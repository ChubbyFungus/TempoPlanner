import bpy
import os
import sys

def install_addon():
    print("Installing 3DS addon...")
    
    # Get user's addon directory
    addon_dir = os.path.join(bpy.utils.script_path_user(), "addons")
    if not os.path.exists(addon_dir):
        os.makedirs(addon_dir)
    
    print(f"User addons directory: {addon_dir}")
    
    # Create the addon file
    addon_path = os.path.join(addon_dir, "io_scene_3ds.py")
    
    addon_code = '''
bl_info = {
    "name": "3DS format",
    "author": "Bob Holcomb, Campbell Barton",
    "version": (1, 0, 0),
    "blender": (2, 80, 0),
    "location": "File > Import-Export",
    "description": "Import-Export 3DS, meshes, uvs, materials",
    "warning": "",
    "doc_url": "",
    "category": "Import-Export",
}

import bpy
from bpy.props import StringProperty, BoolProperty
from bpy_extras.io_utils import ImportHelper, ExportHelper

class Import3DS(bpy.types.Operator, ImportHelper):
    """Import from 3DS file format"""
    bl_idname = "import_scene.autodesk_3ds"
    bl_label = "Import 3DS"
    bl_options = {'UNDO'}

    filename_ext = ".3ds"
    filter_glob: StringProperty(default="*.3ds", options={'HIDDEN'})

    def execute(self, context):
        from . import import_3ds
        keywords = self.as_keywords()
        return import_3ds.load(self, context, **keywords)

def menu_func_import(self, context):
    self.layout.operator(Import3DS.bl_idname, text="3D Studio (.3ds)")

classes = (
    Import3DS,
)

def register():
    for cls in classes:
        bpy.utils.register_class(cls)
    bpy.types.TOPBAR_MT_file_import.append(menu_func_import)

def unregister():
    for cls in classes:
        bpy.utils.unregister_class(cls)
    bpy.types.TOPBAR_MT_file_import.remove(menu_func_import)

if __name__ == "__main__":
    register()
'''
    
    with open(addon_path, 'w') as f:
        f.write(addon_code)
    
    print(f"Created addon at: {addon_path}")
    
    # Enable the addon
    bpy.ops.preferences.addon_enable(module="io_scene_3ds")
    
    print("3DS addon installation complete!")

if __name__ == "__main__":
    install_addon() 