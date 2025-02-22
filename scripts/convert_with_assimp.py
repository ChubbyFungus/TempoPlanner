import os
import sys
import glob
import subprocess
from pathlib import Path

def convert_to_glb(input_file, output_file):
    print(f"Converting {input_file} to {output_file}")
    
    try:
        # Create output directory if it doesn't exist
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        # Use assimp-converter from node_modules
        assimp_converter = os.path.join('node_modules', '.bin', 'assimp-converter.cmd')
        
        if not os.path.exists(assimp_converter):
            print("assimp-converter not found. Installing...")
            subprocess.run(['npm', 'install', 'assimp-converter'], check=True)
        
        # Convert file
        subprocess.run([assimp_converter, input_file, output_file], check=True)
        
        print(f"Successfully converted {input_file}")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"Error converting {input_file}: {str(e)}")
        return False
    except Exception as e:
        print(f"Unexpected error converting {input_file}: {str(e)}")
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
    main() 