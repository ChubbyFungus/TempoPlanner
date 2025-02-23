import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Diagram definitions
const diagrams = {
  'floorplan-system': `
classDiagram
    class FloorplanManager {
        +saveFloorplan(elements: CanvasElement[], name: string)
        +calculateTotalArea(elements: CanvasElement[])
        +countElementsByType(elements: CanvasElement[], type: string)
        +countApplianceElements(elements: CanvasElement[])
    }
    
    class Layer {
        +id: string
        +name: string
        +visible: boolean
        +allowedTools: string[]
        +elements: CanvasElement[]
        +locked: boolean
    }

    class Home {
        +useState()
        +useEffect()
        +Toolbar
        +Canvas
        +PropertiesPanel
        +ActionBar
        +CatalogDialog
    }

    Home --> Layer
    FloorplanManager --> Layer
  `,

  'model-system': `
flowchart TB
    A[ModelManager] --> B[Load Model]
    B --> C[Progress Tracking]
    C --> D[Cache Storage]
    
    E[GenerateModel] --> F[Basic Geometry]
    F --> G[Material Setup]
    G --> H[Scene Export]
    H --> I[GLTF Output]
  `,

  'layer-system': `
classDiagram
    class DefaultLayers {
        +layer-0: Canvas
        +layer-1: Floor & Surfaces
        +layer-2: Walls & Base
        +layer-3: Countertops
    }
    
    class Layer {
        +id: string
        +name: string
        +visible: boolean
        +allowedTools: string[]
        +elements: CanvasElement[]
        +locked: boolean
    }

    DefaultLayers --> Layer
  `,

  'area-calculation': `
%% src/lib/geometry.ts:1-20
flowchart LR
    subgraph PolygonArea
        Points[Room Points] --> Formula[Shoelace Formula]
        Formula --> PixelArea[Area in Pixels]
        PixelArea --> Convert[Convert to Sq Ft]
        Convert --> Final[Final Area]
    end

    subgraph GridConversion
        direction TB
        Grid[20px = 1ft] --> Scale[Scale Factor]
        Scale --> Convert
    end
  `,

  'dimension-measurement': `
%% src/lib/geometry.ts:20-40
sequenceDiagram
    participant U as User
    participant C as Canvas
    participant G as Geometry
    participant D as Display

    U->>C: Start dimension tool
    U->>C: Click first point
    C->>G: calculateDistance(point1)
    U->>C: Click second point
    C->>G: calculateDistance(point2)
    G->>G: snapToGrid(distance)
    G->>G: convertToFeet(pixels)
    G->>D: Display measurement
  `,

  'tool-measure': `
%% src/components/floorplanner/Canvas.tsx:400-450
sequenceDiagram
    participant U as User
    participant T as Toolbar
    participant H as Home
    participant C as Canvas
    participant S as SnapSystem
    participant G as Grid
    participant D as Display

    Note over U,T: Tool Activation Phase
    U->>T: Click Measure Tool
    T->>H: setDrawingMode("measure")
    H->>C: updateCursor("crosshair")
    H->>C: enableSnapGuides()

    Note over U,C: Start Point Selection
    U->>C: Click start point
    C->>S: snapToNearestPoint(mousePos)
    S->>G: checkGridSnap(20px threshold)
    S->>C: checkWallSnap(10px threshold)
    S->>C: checkCornerSnap(15px threshold)
    C->>H: setMeasureStart(snappedPoint)
    H->>D: showStartIndicator()

    Note over U,C: Measurement Preview
    U->>C: Move mouse
    C->>S: snapToNearestPoint(currentPos)
    C->>H: updateMeasureLine(start, current)
    C->>H: calculateDistance(start, current)
    H->>G: convertPixelsToFeet(distance)
    H->>D: showMeasurement({
        distance,
        angle,
        units: "ft-in"
    })
    H->>D: updateGuideLines()

    Note over U,H: Measurement Completion
    U->>C: Click end point
    C->>S: snapToNearestPoint(endPos)
    C->>H: finalizeMeasurement({
        startPoint,
        endPoint,
        distance,
        angle
    })
    H->>H: addToHistory()
    H->>D: showFinalMeasurement()
  `,

  'snap-system': `
%% src/lib/wallUtils.ts:1-30
flowchart TD
    M[Mouse Position] --> G[Grid Snap]
    M --> W[Wall Snap]
    M --> C[Corner Snap]
    
    subgraph Thresholds
        G -- 20px --> R[Round to Grid]
        W -- 10px --> S[Snap to Wall]
        C -- 15px --> P[Snap to Corner]
    end

    R --> F[Final Position]
    S --> F
    P --> F
  `,

  'tool-add-text': `
%% src/components/floorplanner/Canvas.tsx:450-500
sequenceDiagram
    participant U as User
    participant T as Toolbar
    participant H as Home
    participant C as Canvas

    U->>T: Click Text Tool
    T->>H: setDrawingMode("text")
    U->>C: Click canvas
    C->>H: handleTextAdd
    H->>H: Create text element
    H->>H: Enter edit mode
    U->>H: Type text
    U->>H: Finish editing
    H->>H: Save text element
  `,

  'layer-visibility': `
%% src/components/floorplanner/LayersPanel.tsx:1-50
stateDiagram-v2
    [*] --> Visible
    Visible --> Hidden: Toggle visibility
    Hidden --> Visible: Toggle visibility

    state Visible {
        [*] --> Active
        Active --> Inactive: Select other layer
    }

    state Hidden {
        Locked
        Unlocked
    }
  `,

  'room-validation': `
%% src/lib/floorplanManager.ts:50-100
flowchart TD
    Start[Room Points] --> MinPoints{At least 3 points?}
    MinPoints -- No --> Invalid[Invalid Room]
    MinPoints -- Yes --> Intersect{Self-intersecting?}
    Intersect -- Yes --> Invalid
    Intersect -- No --> Area{Min area check}
    Area -- Too small --> Invalid
    Area -- OK --> Valid[Valid Room]
  `,

  'wall-intersection': `
%% src/lib/wallUtils.ts:30-60
flowchart LR
    subgraph Intersection Detection
        W1[Wall 1] --> Check{Intersect?}
        W2[Wall 2] --> Check
        Check -- Yes --> Split[Split Walls]
        Check -- No --> Keep[Keep Original]
    end

    subgraph Corner Creation
        Split --> C1[Corner 1]
        Split --> C2[Corner 2]
        C1 --> Join[Join Walls]
        C2 --> Join
    end
  `,

  'grid-system': `
%% src/components/floorplanner/Canvas.tsx:500-550
flowchart TD
    subgraph Grid Configuration
        Base[Base Grid 20px] --> Major[Major Lines]
        Base --> Minor[Minor Lines]
    end

    subgraph Zoom Levels
        Z1[Level 1: 1ft]
        Z2[Level 2: 6in]
        Z3[Level 3: 3in]
    end

    Major --> Display[Grid Display]
    Minor --> Display
    Z1 --> Scale[Scale Factor]
    Z2 --> Scale
    Z3 --> Scale
  `,

  'room-layout-generator': `
%% src/lib/roomLayouts.ts
flowchart TD
    subgraph Input Parameters
        S[Room Size]
        T[Room Type]
        F[Features]
    end

    subgraph Generation Steps
        W[Generate Walls]
        C[Create Corners]
        O[Place Openings]
        Z[Define Zones]
    end

    subgraph Validation
        V1[Check Dimensions]
        V2[Verify Clearances]
        V3[Access Paths]
    end

    Input Parameters --> Generation Steps
    Generation Steps --> Validation
  `,

  'draco-compression': `
%% src/lib/modelCompression.ts
flowchart LR
    subgraph Compression
        M[Model] --> D[Draco Encoder]
        D --> C[Compressed Data]
        C --> DC[Draco Decoder]
        DC --> R[Rendered Model]
    end

    subgraph Settings
        Q[Quality Level]
        P[Position Bits]
        N[Normal Bits]
        U[UV Bits]
    end
  `,

  'performance-monitoring': `
%% src/lib/performanceMonitor.ts
flowchart TD
    subgraph Metrics
        F[FPS Counter]
        D[Draw Calls]
        M[Memory Usage]
        L[Load Times]
    end

    subgraph Optimization
        T[Triangle Count]
        B[Batch Merging]
        C[Cache Usage]
    end

    subgraph Alerts
        W[Warning Thresholds]
        A[Auto-Optimization]
        N[Notifications]
    end
  `,

  'manufacturer-model-system': `
%% src/lib/manufacturerModels.ts
flowchart TD
    subgraph Manufacturers
        S[Sub-Zero]
        V[Viking]
        T[Thermador]
        M[Miele]
        L[Liebherr]
    end

    subgraph Model Processing
        R[Request Handler]
        P[Processing Queue]
        C[Conversion Tools]
        O[Optimization]
    end

    subgraph Storage
        DB[Model Database]
        Cache[Local Cache]
        CDN[CDN Storage]
    end
  `,

  'accessibility-features': `
%% src/lib/accessibility.ts
flowchart LR
    subgraph Features
        K[Keyboard Nav]
        S[Screen Reader]
        C[Color Contrast]
        F[Focus Management]
    end

    subgraph ARIA
        L[Labels]
        R[Roles]
        D[Descriptions]
        A[Announcements]
    end

    subgraph Shortcuts
        H[Hotkeys]
        Q[Quick Actions]
        N[Navigation]
    end
  `,

  'project-versioning': `
%% src/lib/versionControl.ts
flowchart TD
    subgraph Version Control
        S[Save Version]
        R[Restore Version]
        C[Compare Versions]
        M[Merge Changes]
    end

    subgraph Metadata
        T[Timestamp]
        U[User Info]
        CH[Changes List]
        ST[Statistics]
    end

    subgraph Storage
        L[Local Storage]
        B[Backend Storage]
        SY[Sync Status]
    end
  `,

  'rendering-pipeline': `
%% src/lib/renderManager.ts
flowchart LR
    subgraph Pipeline
        S[Scene Graph]
        C[Culling]
        L[LOD Selection]
        R[Render Queue]
    end

    subgraph Effects
        SH[Shadows]
        AO[Ambient Occlusion]
        AA[Anti-aliasing]
        PF[Post-processing]
    end

    subgraph Output
        VP[Viewport]
        EX[Export]
        PR[Preview]
    end
  `,

  'collaboration-system': `
%% src/lib/collaborationManager.ts
flowchart TD
    subgraph Users
        U1[User 1]
        U2[User 2]
        U3[User 3]
    end

    subgraph Actions
        E[Edit]
        C[Comment]
        M[Mark-up]
        R[Review]
    end

    subgraph Sync
        RT[Real-time Updates]
        CF[Conflict Resolution]
        HI[History]
    end
  `,

  'print-layout': `
%% src/lib/printManager.ts
flowchart TD
    subgraph Layout Options
        F[Floor Plan]
        E[Elevations]
        D[Dimensions]
        L[Legend]
    end

    subgraph Page Setup
        S[Scale]
        O[Orientation]
        M[Margins]
        H[Headers]
    end

    subgraph Output
        P[PDF]
        I[Images]
        DX[DXF]
        CA[CAD]
    end
  `,

  'tool-wall': `
%% src/components/floorplanner/tools/WallTool.tsx
sequenceDiagram
    participant U as User
    participant T as Toolbar
    participant H as Home
    participant C as Canvas
    participant W as WallManager
    participant S as SnapSystem
    participant V as Validator

    Note over U,T: Tool Setup
    U->>T: Select Wall Tool
    T->>H: setActiveTool("wall")
    H->>C: enableWallPreview()
    H->>S: setSnapTargets([
        "grid",
        "walls",
        "corners"
    ])

    Note over U,W: Wall Creation Start
    U->>C: Click start point
    C->>S: getSnappedPosition(point)
    C->>W: startWall({
        x: snappedX,
        y: snappedY,
        thickness: 6,
        height: 96
    })

    Note over U,C: Wall Drawing
    U->>C: Move mouse
    C->>S: snapPreview(mousePos)
    C->>W: updatePreview({
        angle: calcAngle(),
        length: calcLength(),
        snapAngles: [0, 45, 90]
    })
    W->>C: showGuidelines()
    W->>C: showDimensions()

    Note over U,V: Wall Validation
    U->>C: Click end point
    C->>S: snapEndPoint(point)
    C->>V: validateWall({
        minLength: 6,
        maxLength: 600,
        intersection: false
    })
    V-->>C: validationResult

    Note over W,H: Wall Finalization
    alt is valid wall
        C->>W: finalizeWall({
            start: startPoint,
            end: endPoint,
            properties: wallProps
        })
        W->>W: createCorners()
        W->>W: checkIntersections()
        W->>H: updateCanvas()
        H->>H: addToHistory()
    else invalid wall
        C->>H: showError("Invalid wall placement")
        C->>W: cancelWall()
    end
  `,

  'tool-room': `
%% src/components/floorplanner/tools/RoomTool.tsx
sequenceDiagram
    participant U as User
    participant T as Toolbar
    participant H as Home
    participant C as Canvas
    participant R as RoomManager
    participant V as Validator
    participant S as SnapSystem

    Note over U,T: Room Tool Initialization
    U->>T: Select Room Tool
    T->>H: setActiveTool("room")
    H->>C: enableRoomPreview()
    H->>S: setSnapTargets([
        "corners",
        "walls",
        "grid"
    ])

    Note over U,R: Room Point Collection
    loop Add Points
        U->>C: Click point
        C->>S: snapPoint(position)
        C->>R: addPoint({
            x: snappedX,
            y: snappedY,
            type: "corner"
        })
        R->>C: drawPreviewLine()
        R->>C: showPointIndicator()
        
        alt point count >= 3
            R->>C: enableClosePath()
            C->>C: showCloseIndicator()
        end
    end

    Note over U,V: Room Validation
    U->>C: Double click/Close path
    C->>V: validateRoom({
        minPoints: 3,
        minArea: 20,
        selfIntersecting: false
    })
    V-->>R: validationResult

    Note over R,H: Room Finalization
    alt valid room
        R->>R: calculateArea()
        R->>R: determineRoomType()
        R->>R: createWalls()
        R->>R: assignLayer()
        R->>H: updateCanvas()
        H->>H: addToHistory()
    else invalid room
        R->>H: showError("Invalid room shape")
        R->>R: resetTool()
    end
  `,

  'tool-cabinet': `
%% src/components/floorplanner/tools/CabinetTool.tsx
sequenceDiagram
    participant U as User
    participant T as Toolbar
    participant H as Home
    participant C as Canvas
    participant CB as CabinetManager
    participant S as SnapSystem
    participant V as Validator

    Note over U,T: Cabinet Tool Setup
    U->>T: Select Cabinet Tool
    T->>H: setActiveTool("cabinet")
    H->>CB: loadCabinetPresets()
    H->>S: setSnapTargets([
        "walls",
        "cabinets",
        "grid"
    ])

    Note over U,CB: Cabinet Placement
    U->>C: Click position
    C->>S: getSnappedPosition({
        grid: 1,
        wall: 0.5,
        cabinet: 0.25
    })
    C->>CB: previewCabinet({
        type: "base",
        width: 24,
        height: 34.5,
        depth: 24
    })

    Note over CB,V: Placement Validation
    CB->>V: validatePlacement({
        clearance: 24,
        wallRequired: true,
        noOverlap: true
    })
    V-->>CB: validationResult

    Note over CB,H: Cabinet Creation
    alt valid placement
        CB->>CB: createCabinet({
            position: snappedPos,
            rotation: wallAngle,
            properties: cabinetProps
        })
        CB->>CB: attachToWall()
        CB->>CB: createConnectors()
        CB->>H: updateCanvas()
        H->>H: addToHistory()
    else invalid placement
        CB->>H: showError("Invalid cabinet placement")
        CB->>CB: resetPreview()
    end

    Note over U,H: Cabinet Modification
    U->>C: Select cabinet
    C->>H: showProperties({
        dimensions,
        style,
        hardware,
        features
    })
    U->>H: Modify properties
    H->>CB: updateCabinet(changes)
    CB->>V: validateChanges()
    CB->>H: refreshCanvas()
  `,

  'tool-dimension': `
%% src/components/floorplanner/tools/DimensionTool.tsx
sequenceDiagram
    participant U as User
    participant T as Toolbar
    participant H as Home
    participant C as Canvas
    participant D as DimensionManager
    participant S as SnapSystem
    participant F as Formatter

    Note over U,T: Dimension Tool Setup
    U->>T: Select Dimension Tool
    T->>H: setActiveTool("dimension")
    H->>C: enableDimensionPreview()
    H->>S: setSnapTargets([
        "points",
        "edges",
        "centers"
    ])

    Note over U,D: Dimension Creation
    U->>C: Click first point
    C->>S: snapToPoint(pos, {
        threshold: 10,
        priority: ["corners", "edges"]
    })
    C->>D: setFirstPoint(snappedPos)
    D->>C: showFirstAnchor()

    U->>C: Move mouse
    C->>D: updatePreview({
        start: firstPoint,
        current: mousePos,
        orientation: "auto"
    })
    D->>F: formatMeasurement({
        value: distance,
        unit: "ft-in",
        precision: 0.125
    })
    D->>C: showPreviewLine()

    U->>C: Click second point
    C->>S: snapToPoint(pos)
    C->>D: setSecondPoint(snappedPos)
    D->>D: calculateOffset()
    D->>D: determineOrientation()

    Note over D,H: Dimension Finalization
    D->>D: createDimension({
        points: [p1, p2],
        offset: 20,
        orientation: "auto",
        style: {
            color: "#000",
            fontSize: 12,
            arrowStyle: "architectural"
        }
    })
    D->>H: updateCanvas()
    H->>H: addToHistory()

    Note over U,D: Dimension Editing
    U->>C: Select dimension
    C->>H: showProperties({
        measurement,
        style,
        position
    })
    U->>H: Modify properties
    H->>D: updateDimension(changes)
    D->>C: refreshDisplay()
  `
};

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '../docs/diagrams');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate SVGs for each diagram
async function generateDiagrams() {
  console.log(`Found ${Object.keys(diagrams).length} diagrams to generate`);
  console.log('Output directory:', outputDir);
  
  const results = {
    success: [],
    failed: []
  };

  for (const [name, definition] of Object.entries(diagrams)) {
    try {
      console.log(`\nProcessing diagram: ${name}`);
      
      const tempFile = path.join(outputDir, `${name}.mmd`);
      const outputFile = path.join(outputDir, `${name}.svg`);
      
      // Write the diagram definition to a temporary file
      fs.writeFileSync(tempFile, definition.trim());
      console.log(`Created temporary file: ${tempFile}`);
      
      // Use mmdc (Mermaid CLI) to generate the SVG
      console.log('Executing mermaid-cli...');
      const { stdout, stderr } = await execAsync(`npx mmdc -i ${tempFile} -o ${outputFile}`);
      
      if (stderr) {
        console.warn(`Warning for ${name}:`, stderr);
      }
      
      // Verify the output file exists and has content
      if (fs.existsSync(outputFile) && fs.statSync(outputFile).size > 0) {
        // Clean up the temporary file
        fs.unlinkSync(tempFile);
        console.log(`Successfully generated: ${outputFile}`);
        results.success.push(name);
      } else {
        throw new Error('Output file is empty or not created');
      }
    } catch (error) {
      console.error(`\nError generating diagram ${name}:`, error.message);
      results.failed.push(name);
    }
  }

  // Print summary
  console.log('\n=== Generation Summary ===');
  console.log(`Total diagrams: ${Object.keys(diagrams).length}`);
  console.log(`Successfully generated: ${results.success.length}`);
  console.log(`Failed: ${results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.log('\nFailed diagrams:');
    results.failed.forEach(name => console.log(`- ${name}`));
    process.exit(1);
  }
}

// Execute with proper error handling
generateDiagrams().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
