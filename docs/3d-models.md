# 3D Model Integration

## Supported Manufacturers

The application supports 3D models from major kitchen and bath manufacturers:
- Sub-Zero
- Viking
- Thermador
- Miele
- Liebherr

## Model Request Process

1. Use the templates in `docs/model-requests/` for each manufacturer
2. Submit requests through official channels
3. Follow manufacturer-specific guidelines for access

## Model Requirements

- Format: GLB/GLTF
- Features:
  - Proper materials and textures
  - Multiple LOD (Level of Detail) versions
  - Draco compression support

## Development with Placeholder Models

While waiting for official models:
1. Use generated placeholder models
2. Test with sample models in `public/models/`
3. Replace with official models when available

## Model Processing

```javascript
// Example model optimization
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
dracoLoader.setDecoderConfig({type: 'js'});
```