import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import os from 'os';
import { spawn } from 'child_process';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if Blender is installed and accessible
function checkBlenderInstallation() {
  try {
    const result = execSync('blender --version', { encoding: 'utf8' });
    console.log('Blender version:', result.trim());
    return true;
  } catch (error) {
    console.error('Blender is not installed or not accessible from command line');
    console.error('Please install Blender and make sure it\'s accessible from command line');
    return false;
  }
}

// Function to create Python script for conversion
function createPythonScript(inputFile, outputFile) {
    const pythonScript = `
import bpy
import addon_utils
import os

# Enable required addons
addon_utils.enable("io_scene_obj", default_set=True, persistent=True)
addon_utils.enable("io_scene_3ds", default_set=True, persistent=True)

# Clear existing objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Set up scene
bpy.context.scene.render.engine = 'CYCLES'
bpy.context.scene.unit_settings.system = 'METRIC'

# Import OBJ file
try:
    bpy.ops.import_scene.obj(filepath='${inputFile.replace(/\\/g, '\\\\')}')
except Exception as e:
    print(f"Error importing OBJ: {str(e)}")
    # Try 3DS import as fallback
    try:
        bpy.ops.import_scene.autodesk_3ds(filepath='${inputFile.replace(/\\/g, '\\\\')}')
    except Exception as e2:
        print(f"Error importing 3DS: {str(e2)}")
        raise

# Select all objects and join them
bpy.ops.object.select_all(action='SELECT')
if len(bpy.context.selected_objects) > 1:
    bpy.context.view_layer.objects.active = bpy.context.selected_objects[0]
    bpy.ops.object.join()

# Export as GLB
try:
    bpy.ops.export_scene.gltf(
        filepath='${outputFile.replace(/\\/g, '\\\\')}',
        export_format='GLB',
        export_materials='EXPORT',
        export_colors=True,
        export_texcoords=True,
        export_normals=True,
        use_mesh_edges=False,
        use_mesh_vertices=False,
        export_draco_mesh_compression_enable=True
    )
    print("Successfully exported to GLB")
except Exception as e:
    print(f"Error exporting GLB: {str(e)}")
    raise`;

    const tempFile = path.join(os.tmpdir(), `blender_convert_${Date.now()}.py`);
    fs.writeFileSync(tempFile, pythonScript);
    console.log(`Created temporary script at: ${tempFile}`);
    return tempFile;
}

// Process all .obj files in the models directory
async function convertObjFiles() {
  if (!checkBlenderInstallation()) {
    return;
  }

  const baseDir = path.join(__dirname, '../public/models/appliances/3ds');
  const pattern = '**/*.obj';
  
  try {
    // Find all .obj files
    const files = glob.sync(pattern, { 
      cwd: baseDir, 
      nocase: true,
      absolute: true 
    });
    
    console.log(`Found ${files.length} .obj files to convert`);

    // Process each file
    for (const file of files) {
      const relativePath = path.relative(baseDir, file);
      const outputDir = path.join(path.dirname(file), 'high');
      const outputFile = path.join(outputDir, 'high.glb');

      console.log(`\nProcessing: ${relativePath}`);
      console.log(`Output: ${outputFile}`);
      
      // Create output directory if it doesn't exist
      fs.mkdirSync(outputDir, { recursive: true });
      
      // Create temporary Python script
      const scriptPath = createPythonScript(file, outputFile);
      
      try {
        console.log('Running Blender conversion...');
        const blenderProcess = spawn('blender', [
            '--background',
            '--python-use-system-env',
            '--python',
            scriptPath
        ], {
            stdio: 'inherit'
        });

        // Wait for process to complete
        await new Promise((resolve, reject) => {
          blenderProcess.on('close', (code) => {
            if (code === 0) {
              console.log(`✓ Successfully converted ${relativePath}`);
              resolve();
            } else {
              console.error(`✗ Failed to convert ${relativePath} with exit code ${code}`);
              reject(new Error(`Process exited with code ${code}`));
            }
          });
          
          blenderProcess.on('error', (err) => {
            console.error(`✗ Failed to start Blender process for ${relativePath}:`, err);
            reject(err);
          });
        });

      } catch (error) {
        console.error(`✗ Failed to convert ${relativePath}:`, error.message);
      } finally {
        // Clean up temporary script
        try {
          fs.unlinkSync(scriptPath);
          console.log('Cleaned up temporary script');
        } catch (err) {
          console.warn('Failed to clean up temporary script:', err);
        }
      }
    }

  } catch (error) {
    console.error('Error processing files:', error);
  }
}

// Run the conversion
convertObjFiles().catch(console.error); 