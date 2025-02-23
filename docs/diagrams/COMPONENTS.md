# Component Documentation

## Canvas System
Location: `/src/components/floorplanner/Canvas.tsx:350-450`

Primary component for handling the drawing surface. Responsibilities:
- Manages viewport scaling and panning
- Handles drawing modes (select, draw-room, etc.)
- Renders layers and elements
- Manages mouse interactions and snapping

Key Features:
- 2D/3D view switching
- Grid snapping
- Wall drawing
- Room creation
- Element selection

## LayersPanel
Location: `/src/components/floorplanner/LayersPanel.tsx:1-120`

Manages layer organization and visibility. Features:
- Layer creation/deletion
- Visibility toggling
- Layer selection
- Element organization

Methods:
- `onLayerAdd()`: Creates new layers
- `onLayerDelete()`: Removes layers
- `onLayerVisibilityToggle()`: Shows/hides layers
- `onLayerSelect()`: Changes active layer

## FloorplanManager
Location: `/src/lib/floorplanManager.ts:12-42`

Service for managing floorplan data. Capabilities:
- Saving floorplans
- Loading floorplans
- Listing available floorplans
- Calculating areas
- Element counting and categorization

Methods:
- `saveFloorplan()`: Stores floorplan data
- `loadFloorplan()`: Retrieves floorplan data
- `listFloorplans()`: Shows available plans
- `calculateTotalArea()`: Computes space metrics

## Model System
Location: `/src/lib/modelManager.ts` and `/src/lib/pbrMaterialManager.ts`

Handles 3D model management and materials:

Model Management:
- Model loading
- Progress tracking
- Cache management
- Asset optimization

Material Processing:
- PBR material setup
- Geometry handling
- Scene export
- GLTF conversion

## ViewportState
Location: `/src/components/floorplanner/Viewport.tsx:10-150`

Manages canvas view state:
- Scale management
- Offset tracking
- Pan/zoom controls
- View reset functionality

Connected to ViewportControls for user interaction.

## FloorplanSystem
Location: `/src/lib/floorplanSystem.ts:5-200`

Core system coordinating all floorplan operations:

Components:
- ElementManager: Handles individual elements
- LayerManager: Manages layer organization
- ViewportState: Controls view parameters

Responsibilities:
- Element coordination
- Layer management
- Viewport control
- State management

## Room Layout Generator
Location: `/src/lib/roomLayouts.ts:5-45`

Automated room layout system:

Features:
- Layout generation
- Space validation
- Optimization algorithms
- Constraint checking

Components:
- LayoutGenerator: Creates room layouts
- LayoutConstraints: Defines space rules
- LayoutRules: Validates layouts

## Integration Points

### Component Relationships:
1. Canvas → LayersPanel
   - Shares layer state
   - Coordinates element rendering

2. FloorplanSystem → ElementManager
   - Manages element lifecycle
   - Handles element updates

3. ModelSystem → FloorplanSystem
   - Provides 3D representations
   - Handles material application

### Data Flow:
1. User Input → Canvas → FloorplanSystem
2. FloorplanSystem → ElementManager → LayerManager
3. ViewportState → Canvas → Rendering

## Common Use Cases

1. Room Creation:
   ```
   Canvas (draw mode) → RoomElement → FloorplanSystem → ElementManager
   ```

2. Layer Management:
   ```
   LayersPanel → LayerManager → FloorplanSystem → Canvas (render)
   ```

3. Model Loading:
   ```
   ModelSystem → MaterialProcessing → Canvas (3D view)
   ```