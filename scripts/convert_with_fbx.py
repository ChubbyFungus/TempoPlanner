import bpy
import os
import sys
import glob
from pathlib import Path

def convert_to_glb(input_file, output_file):
    print(f"Converting {input_file} to {output_file}")
    
    try:
        # Clear existing objects
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete()
        
        # First convert to FBX using FBX Converter
        fbx_file = input_file.replace('.3ds', '.fbx')
        fbx_converter = r"C:\Program Files\Autodesk\FBX\FBX Converter\2013.3\bin\FbxConverter.exe"
        
        if not os.path.exists(fbx_converter):
            print("FBX Converter not found. Please download and install it from:")
            print("https://www.autodesk.com/developer-network/platform-technologies/fbx-converter-archives")
            return False
        
        # Convert to FBX
        os.system(f'"{fbx_converter}" "{input_file}" "{fbx_file}"')
        
        if not os.path.exists(fbx_file):
            print(f"Failed to convert {input_file} to FBX")
            return False
        
        # Import FBX
        bpy.ops.import_scene.fbx(filepath=fbx_file)
        
        # Select all objects
        bpy.ops.object.select_all(action='SELECT')
        
        # Create output directory if it doesn't exist
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        # Export as GLB
        bpy.ops.export_scene.gltf(
            filepath=output_file,
            export_format='GLB',
            export_materials='EXPORT',
            export_colors=True,
            export_textures=True,
            export_normals=True,
            export_draco_mesh_compression_enable=True
        )
        
        # Clean up temporary FBX file
        os.remove(fbx_file)
        
        print(f"Successfully converted {input_file}")
        return True
        
    except Exception as e:
        print(f"Error converting {input_file}: {str(e)}")
        if os.path.exists(fbx_file):
            os.remove(fbx_file)
        return False

def main():
    # Get the base directory from command line argument or use default
    base_dir = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.getcwd(), 'public', 'models', 'appliances', '3ds')
    
    print(f"Scanning directory: {base_dir}")
    
    # Find all .3ds files
    pattern = os.path.join(base_dir, '**', '*.3ds')
    files = glob.glob(pattern, recursive=True)
    
    print(f"Found {len(files)} .3ds files")
    
    # Process each file
    success_count = 0
    for input_file in files:
        # Create output path
        rel_path = os.path.relpath(input_file, base_dir)
        output_dir = os.path.join(os.path.dirname(input_file), 'high')
        output_file = os.path.join(output_dir, 'high.glb')
        
        print(f"\nProcessing: {rel_path}")
        if convert_to_glb(input_file, output_file):
            success_count += 1
    
    print(f"\nConversion complete!")
    print(f"Successfully converted {success_count} out of {len(files)} files")

if __name__ == "__main__":
    main() 