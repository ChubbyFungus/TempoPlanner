# Component Documentation

## Core UI Components

### NavigationMenu
**Location:** `/src/components/ui/navigation-menu.tsx`
- Manages navigation items and active state
- Properties:
  - `items`: Array of menu items
  - `activeItem`: Currently selected item
  - `onNavigate`: Navigation handler

### CommandPalette
**Location:** `/src/components/ui/command.tsx`
- Provides command search and execution functionality
- Properties:
  - `commands`: Available commands
  - `searchQuery`: Current search term
- Methods:
  - `handleCommand`: Executes selected command
  - `filterCommands`: Filters commands based on search

### Drawer
**Location:** `/src/components/ui/drawer.tsx`
- Sliding panel component for additional content
- Properties:
  - `isOpen`: Drawer visibility state
  - `content`: React node to render
  - `position`: "left" or "right" positioning

## Floorplanner Components

### CatalogDialog
**Location:** `/src/components/floorplanner/CatalogDialog.tsx`
- Dialog for selecting rooms and appliances
- Properties:
  - `open`: Dialog visibility state
  - `catalogType`: "room" or "appliance"
- Methods:
  - `onItemSelect`: Handles item selection
  - `onOpenChange`: Manages dialog state

### ActionBar
**Location:** `/src/components/floorplanner/ActionBar.tsx`
- Manages available actions and their execution
- Properties:
  - `actions`: Array of available actions
- Methods:
  - `handleAction`: Processes selected action
  - `isActionEnabled`: Checks action availability

### Toolbar
**Location:** `/src/components/floorplanner/Toolbar.tsx`
- Controls drawing modes and tool selection
- Properties:
  - `toolbarItems`: Available tools
  - `activeDrawingMode`: Current drawing mode
- Methods:
  - `onDrawingModeChange`: Handles mode switching

## Service Components

### ActionHandler
**Location:** `/src/lib/actionHandler.ts`
- Manages action execution and history
- Methods:
  - `executeAction`: Processes actions
  - `undoAction`: Reverts last action
  - `redoAction`: Reapplies undone action

### ActionHistory
**Location:** `/src/lib/actionHistory.ts`
- Maintains action history stacks
- Properties:
  - `undoStack`: Previous actions
  - `redoStack`: Reverted actions
- Methods:
  - `push`: Adds new action
  - `undo`: Reverts action
  - `redo`: Reapplies action

## Data Types

### CatalogItem
**Location:** `/src/types/shared.ts`
- Represents catalog entries
- Properties:
  - `id`: Unique identifier
  - `name`: Display name
  - `category`: Item category
  - `modelPath`: 3D model reference

### RoomLayout
**Location:** `/src/types/shared.ts`
- Defines room structure
- Properties:
  - `id`: Unique identifier
  - `name`: Room name
  - `points`: Coordinate array
  - `type`: Room type

### ToolbarItem
**Location:** `/src/types/shared.ts`
- Defines toolbar options
- Properties:
  - `id`: Unique identifier
  - `name`: Display name
  - `icon`: React node for display

## Integration Flows

### Properties Panel Integration
```typescript
interface PropertiesPanel {
    element: Element;
    onPropertyChange: (property: string, value: any) => void;
    onDimensionChange: (dimension: Dimension) => void;
    onMaterialChange: (materialId: string) => void;
}
```

### Material Pipeline
1. Material Selection → Material Manager
2. PBR Processing
3. Texture Loading
4. Shader Generation
5. Three.js Material Integration

### Action System Flow
1. User Action → ActionHandler
2. State Update
3. History Management
4. UI Refresh

## Usage Guidelines

1. Use `NavigationMenu` for primary navigation
2. Implement `CommandPalette` for quick actions
3. Use `Drawer` for temporary side content
4. Integrate `CatalogDialog` for item selection
5. Implement `ActionBar` for operation management
6. Use `Toolbar` for drawing mode control

## Best Practices

1. Maintain consistent state management
2. Implement proper error handling
3. Follow accessibility guidelines
4. Document component changes
5. Write unit tests for new features
