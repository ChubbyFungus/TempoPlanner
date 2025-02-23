import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define expected count before any other logic
const EXPECTED_DIAGRAM_COUNT = 17;

// Known implementations (from provided code)
const diagrams = {
  'floorplan-manager': `
classDiagram
    class FloorplanManager {
        <<Service /src/lib/floorplanManager.ts:12-42>>
        +saveFloorplan(elements: CanvasElement[], name: string) %% Line: 15-20
        +loadFloorplan(name: string) %% Line: 22-28
        +listFloorplans() %% Line: 30-32
        -calculateTotalArea(elements: CanvasElement[]) %% Line: 34-36
        -countElementsByType(elements: CanvasElement[], type: string) %% Line: 38-40
        -countApplianceElements(elements: CanvasElement[]) %% Line: 42-44
    }
`,

  'canvas': `
classDiagram
    class Canvas {
        <<Component /src/components/floorplanner/Canvas.tsx:350-450>>
        -viewport: ViewportState
        -mousePos: Point | null
        -isPanning: boolean
        -isSpacePressed: boolean
        +handleMouseMove(e: React.MouseEvent) %% Line: 380-395
        +handleCanvasClick(e: React.MouseEvent) %% Line: 400-415
        +handleMouseUp() %% Line: 420-425
        +handleWheel(e: WheelEvent) %% Line: 430-445
    }
    
    class ViewportState {
        <<Interface /src/types/viewport.ts:10-25>>
        +scale: number
        +offsetX: number
        +offsetY: number
    }
    
    Canvas --> ViewportState
`,

  'wall-utils': `
flowchart TD
    subgraph "Wall Utilities"
        S["snapToGrid<br/><small><i>/src/lib/wallUtils.ts:5-12</i></small>"] 
        --> G["Snapped Point<br/><small><i>/src/lib/wallUtils.ts:8</i></small>"]
        
        C["snapToNearestCorner<br/><small><i>/src/lib/wallUtils.ts:14-20</i></small>"] 
        --> NC["Nearest Corner<br/><small><i>/src/lib/wallUtils.ts:18</i></small>"]
        
        W["snapToNearestWall<br/><small><i>/src/lib/wallUtils.ts:22-28</i></small>"] 
        --> VW["Valid Wall<br/><small><i>/src/lib/wallUtils.ts:26</i></small>"]
    end
`,

  'layers-panel': `
classDiagram
    class LayersPanel {
        <<Component /src/components/floorplanner/LayersPanel.tsx:1-120>>
        +layers: Layer[] %% Line: 15
        +activeLayer: string %% Line: 20
        +onLayerAdd() %% Line: 35-45
        +onLayerDelete() %% Line: 50-60
        +onLayerVisibilityToggle() %% Line: 65-75
        +onLayerSelect() %% Line: 80-90
    }

    class Layer {
        <<Interface /src/types/shared.ts:40-55>>
        +id: string
        +name: string
        +visible: boolean
    }

    LayersPanel --> Layer
`,

  'room-element': `
classDiagram
    class RoomElement {
        <<Component /src/components/floorplanner/RoomElement.tsx>>
        +element: Element %% Line: 15
        +selected: boolean %% Line: 20
        +viewMode: "2d" | "3d" %% Line: 25
        +drawingMode: string %% Line: 30
        +handleCornerMouseDown() %% Line: 50-65
        +render() %% Line: 150-195
    }
    
    class Element {
        <<Interface /src/types/shared.ts:10-30>>
        +id: string
        +points: Point[]
        +wallSegments: WallSegment[]
    }
    
    RoomElement --> Element
`,

  'wall-element': `
classDiagram
    note for WallElement "Source: /src/components/floorplanner/WallElement.tsx:1-180"
    class WallElement {
        +element: Element
        +selected: boolean
        +drawingMode: string
        +handleEndpointMouseDown()
        +render()
    }
`,

  'element-types': `
classDiagram
    note for Element "Source: /src/types/shared.ts:1-79"
    class Element {
        +id: string
        +x: number
        +y: number
        +width: number
        +height: number
        +type: string
        +rotation: number
        +locked: boolean
        +points?: Point[]
        +wallSegments?: WallSegment[]
        +corners?: Corner[]
    }
`,

  'viewport': `
classDiagram
    class ViewportState {
        <<Class /src/components/floorplanner/Viewport.tsx:10-150>>
        +scale: number %% Line: 20
        +offsetX: number %% Line: 25
        +offsetY: number %% Line: 30
        +updateScale() %% Line: 50-70
        +updateOffset() %% Line: 80-100
    }

    class ViewportControls {
        <<Component /src/components/floorplanner/ViewportControls.tsx:5-80>>
        +onZoom() %% Line: 20-35
        +onPan() %% Line: 40-55
        +onReset() %% Line: 60-75
    }

    ViewportControls --> ViewportState
`,

  'model-system': `
flowchart TB
    subgraph "Model Management"
        A["ModelManager<br/><small><i>/src/lib/modelManager.ts:10-25</i></small>"] 
        B["Load Model Process<br/><small><i>/src/lib/modelManager.ts:30-45</i></small>"]
        C["Progress Tracking<br/><small><i>/src/lib/modelManager.ts:50-65</i></small>"]
        D["Cache Storage<br/><small><i>/src/lib/modelManager.ts:70-85</i></small>"]
        
        A --> B
        B --> C
        C --> D
    end
    
    subgraph "Material Processing"
        E["GenerateModel<br/><small><i>/src/lib/pbrMaterialManager.ts:15-30</i></small>"]
        F["Basic Geometry<br/><small><i>/src/lib/pbrMaterialManager.ts:35-50</i></small>"]
        G["Material Setup<br/><small><i>/src/lib/pbrMaterialManager.ts:55-70</i></small>"]
        H["Scene Export<br/><small><i>/src/lib/pbrMaterialManager.ts:75-90</i></small>"]
        I["GLTF Output<br/><small><i>/src/lib/pbrMaterialManager.ts:95-110</i></small>"]
        
        E --> F
        F --> G
        G --> H
        H --> I
    end
`,

  'room-layout-generator': `
classDiagram
    class LayoutGenerator {
        <<Service /src/lib/roomLayouts.ts:5-45>>
        +generateLayout() %% Line: 10-20
        +validateLayout() %% Line: 25-30
        +optimizeSpace() %% Line: 35-40
    }

    class LayoutConstraints {
        <<Interface /src/types/layouts.ts:10-30>>
        +minWidth: number
        +maxWidth: number
        +minDepth: number
        +maxDepth: number
    }

    class LayoutRules {
        <<Service /src/lib/layoutRules.ts:5-50>>
        +validateSpacing() %% Line: 15-25
        +checkCollisions() %% Line: 30-40
    }

    LayoutGenerator --> LayoutConstraints
    LayoutGenerator --> LayoutRules
`,

  'floorplan-system': `
classDiagram
    class FloorplanSystem {
        <<Service /src/lib/floorplanSystem.ts:5-200>>
        +elements: Element[] %% Line: 20
        +activeLayer: Layer %% Line: 25
        +viewport: ViewportState %% Line: 30
    }

    class ElementManager {
        <<Service /src/lib/elementManager.ts:10-150>>
        +addElement() %% Line: 20-40
        +removeElement() %% Line: 45-65
        +updateElement() %% Line: 70-90
    }

    class LayerManager {
        <<Service /src/lib/layerManager.ts:5-100>>
        +createLayer() %% Line: 15-35
        +deleteLayer() %% Line: 40-60
        +updateLayer() %% Line: 65-85
    }

    FloorplanSystem --> ElementManager
    FloorplanSystem --> LayerManager
`,

  'command-flow': `
flowchart TD
    subgraph "Command Flow"
        A["User Input<br/><small><i>/src/lib/commandHandler.ts:15-20</i></small>"] 
        B["Command Handler<br/><small><i>/src/lib/commandHandler.ts:25-40</i></small>"]
        C["State Update<br/><small><i>/src/lib/commandHandler.ts:45-60</i></small>"]
        D["Render Update<br/><small><i>/src/lib/commandHandler.ts:65-80</i></small>"]
        
        A --> B
        B --> C
        C --> D
    end
`,

  'ui-component-hierarchy': `
classDiagram
    class App {
        <<Component /src/App.tsx:1-100>>
        +header: Header
        +main: Main
        +footer: Footer
    }

    class Header {
        <<Component /src/components/Header.tsx:1-50>>
        +logo: Logo
        +nav: Navigation
    }

    class Main {
        <<Component /src/components/Main.tsx:1-100>>
        +sidebar: Sidebar
        +content: Content
    }

    class Footer {
        <<Component /src/components/Footer.tsx:1-50>>
        +copyright: Copyright
        +links: Links
    }

    class Logo {
        <<Component /src/components/Logo.tsx:1-30>>
        +image: Image
    }

    class Navigation {
        <<Component /src/components/Navigation.tsx:1-50>>
        +links: Link[]
    }

    class Sidebar {
        <<Component /src/components/Sidebar.tsx:1-100>>
        +menu: Menu
        +search: Search
    }

    class Content {
        <<Component /src/components/Content.tsx:1-100>>
        +main: MainContent
        +sidebar: SecondarySidebar
    }

    class Copyright {
        <<Component /src/components/Copyright.tsx:1-30>>
        +text: Text
    }

    class Links {
        <<Component /src/components/Links.tsx:1-50>>
        +link: Link[]
    }

    class Menu {
        <<Component /src/components/Menu.tsx:1-50>>
        +items: MenuItem[]
    }

    class Search {
        <<Component /src/components/Search.tsx:1-50>>
        +input: Input
    }

    class MainContent {
        <<Component /src/components/MainContent.tsx:1-100>>
        +title: Title
        +body: Body
    }

    class SecondarySidebar {
        <<Component /src/components/SecondarySidebar.tsx:1-100>>
        +items: SidebarItem[]
    }

    class Title {
        <<Component /src/components/Title.tsx:1-30>>
        +text: Text
    }

    class Body {
        <<Component /src/components/Body.tsx:1-100>>
        +content: Content
    }

    class Link {
        <<Component /src/components/Link.tsx:1-30>>
        +url: string
        +text: string
    }

    class MenuItem {
        <<Component /src/components/MenuItem.tsx:1-30>>
        +label: string
        +icon: Icon
    }

    class SidebarItem {
        <<Component /src/components/SidebarItem.tsx:1-30>>
        +label: string
        +icon: Icon
    }

    class Input {
        <<Component /src/components/Input.tsx:1-30>>
        +type: string
        +placeholder: string
    }

    class Icon {
        <<Component /src/components/Icon.tsx:1-30>>
        +name: string
    }

    App --> Header
    App --> Main
    App --> Footer

    Header --> Logo
    Header --> Navigation

    Main --> Sidebar
    Main --> Content

    Footer --> Copyright
    Footer --> Links

    Sidebar --> Menu
    Sidebar --> Search

    Content --> MainContent
    Content --> SecondarySidebar

    MainContent --> Title
    MainContent --> Body

    SecondarySidebar --> SidebarItem
`,

  'properties-system': `
classDiagram
    class PropertiesPanel {
        <<Component /src/components/PropertiesPanel.tsx:1-100>>
        +properties: Property[]
        +onPropertyChange: (property: Property) => void
    }

    class Property {
        <<Interface /src/types/properties.ts:10-30>>
        +id: string
        +name: string
        +type: string
        +value: any
    }

    class PropertyInput {
        <<Component /src/components/PropertyInput.tsx:1-100>>
        +property: Property
        +onChange: (value: any) => void
    }

    class PropertyEditor {
        <<Component /src/components/PropertyEditor.tsx:1-100>>
        +property: Property
        +onSave: () => void
    }

    PropertiesPanel --> Property
    PropertiesPanel --> PropertyInput
    PropertiesPanel --> PropertyEditor
`,

  'catalog-system': `
classDiagram
    class Catalog {
        <<Component /src/components/Catalog.tsx:1-100>>
        +items: CatalogItem[]
        +onSelect: (item: CatalogItem) => void
    }

    class CatalogItem {
        <<Interface /src/types/catalog.ts:10-30>>
        +id: string
        +name: string
        +description: string
        +image: string
    }

    class CatalogItemCard {
        <<Component /src/components/CatalogItemCard.tsx:1-100>>
        +item: CatalogItem
        +onSelect: () => void
    }

    Catalog --> CatalogItem
    Catalog --> CatalogItemCard
`,

  'material-pipeline': `
flowchart TB
    subgraph "Material Pipeline"
        A["MaterialRequest<br/><small><i>/src/lib/materialPipeline.ts:10-20</i></small>"]
        B["MaterialProcessing<br/><small><i>/src/lib/materialPipeline.ts:30-40</i></small>"]
        C["MaterialOutput<br/><small><i>/src/lib/materialPipeline.ts:50-60</i></small>"]
        
        A --> B
        B --> C
    end
`,

  'action-system': `
classDiagram
    class ActionManager {
        <<Service /src/lib/actionManager.ts:5-50>>
        +actions: Action[]
        +executeAction(action: Action) %% Line: 10-15
        +undoAction() %% Line: 20-25
        +redoAction() %% Line: 30-35
    }

    class Action {
        <<Interface /src/types/actions.ts:10-30>>
        +id: string
        +type: string
        +payload: any
    }

    ActionManager --> Action
`,

  'toolbar-integration': `
classDiagram
    class Toolbar {
        <<Component /src/components/Toolbar.tsx:1-100>>
        +actions: Action[]
        +onAction: (action: Action) => void
    }

    class Action {
        <<Interface /src/types/actions.ts:10-30>>
        +id: string
        +type: string
        +payload: any
    }

    class ToolbarButton {
        <<Component /src/components/ToolbarButton.tsx:1-100>>
        +action: Action
        +onClick: () => void
    }

    Toolbar --> Action
    Toolbar --> ToolbarButton
`
};

console.log('\nDiagram Inventory:');
Object.keys(diagrams).forEach((name, index) => {
  console.log(`${index + 1}. ${name}`);
});

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '../docs/diagrams');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate PNGs for each diagram
async function generateDiagrams() {
  const diagramCount = Object.keys(diagrams).length;
  console.log(`\nExpected diagrams: ${EXPECTED_DIAGRAM_COUNT}`);
  console.log(`Found diagrams: ${diagramCount}`);
  
  if (diagramCount !== EXPECTED_DIAGRAM_COUNT) {
    console.error('\nMissing diagrams:');
    const expectedDiagrams = [
      'floorplan-manager', 'canvas', 'wall-utils', 'layers-panel', 
      'room-element', 'wall-element', 'element-types', 'viewport',
      'model-system', 'room-layout-generator', 'floorplan-system',
      'command-flow', 'ui-component-hierarchy', 'properties-system',
      'catalog-system', 'material-pipeline', 'action-system',
      'toolbar-integration'
    ];
    
    const missingDiagrams = expectedDiagrams.filter(name => !diagrams[name]);
    missingDiagrams.forEach(name => console.log(`- ${name}`));
  }

  const results = {
    success: [],
    failed: [],
    skipped: []
  };

  for (const [name, definition] of Object.entries(diagrams)) {
    try {
      console.log(`\nProcessing diagram: ${name}`);
      console.log('Definition length:', definition.trim().length, 'characters');
      
      const tempFile = path.join(outputDir, `${name}.mmd`);
      const outputFile = path.join(outputDir, `${name}.png`); // Changed to .png
      
      // Write the diagram definition to a temporary file
      fs.writeFileSync(tempFile, definition.trim());
      console.log(`Created temporary file: ${tempFile} (${fs.statSync(tempFile).size} bytes)`);
      
      // Use mmdc (Mermaid CLI) to generate the PNG
      console.log('Executing mermaid-cli...');
      const { stdout, stderr } = await execAsync(
        `npx mmdc -i ${tempFile} -o ${outputFile} -b transparent`
      );
      
      if (stderr) {
        console.warn(`Warning for ${name}:`, stderr);
      }
      
      // Verify the output file exists and has content
      if (fs.existsSync(outputFile) && fs.statSync(outputFile).size > 0) {
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

  // Print detailed summary
  console.log('\n=== Generation Summary ===');
  console.log(`Expected diagrams: ${EXPECTED_DIAGRAM_COUNT}`);
  console.log(`Found diagrams: ${diagramCount}`);
  console.log(`Successfully generated: ${results.success.length}`);
  console.log(`Failed: ${results.failed.length}`);
  
  console.log('\nSuccessfully generated diagrams:');
  results.success.forEach(name => console.log(`✓ ${name}`));
  
  if (results.failed.length > 0) {
    console.log('\nFailed diagrams:');
    results.failed.forEach(name => console.log(`✗ ${name}`));
  }
  
  if (diagramCount !== EXPECTED_DIAGRAM_COUNT || results.failed.length > 0) {
    process.exit(1);
  }
}

// Execute with proper error handling
generateDiagrams().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
