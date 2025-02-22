import bpy
import sys
import os

# Get input and output file paths from command line arguments
input_file = sys.argv[-2]
output_file = sys.argv[-1]

print(f"Converting {input_file} to {output_file}")

try:
    # Clear existing objects
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    
    # Import OBJ file
    bpy.ops.import_scene.obj(filepath=input_file)
    
    # Select all objects
    bpy.ops.object.select_all(action='SELECT')
    
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
    
except Exception as e:
    print(f"Error during conversion: {str(e)}")
    sys.exit(1) 