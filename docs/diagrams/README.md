# Diagram Navigation Guide

## Understanding Diagram References

### File Path Format
Each component/class/function in the diagrams includes a specific file reference in this format:
```
<<Type /path/to/file.ts:start-end>>
```
For example: `<<Component /src/components/floorplanner/Canvas.tsx:350-450>>`
- `Type` indicates the kind of code (Component, Service, Interface)
- File path shows exact location in the project
- Line numbers (350-450) specify where to find the code

### Method Line References
Methods include line numbers as comments:
```
+methodName() %% Line: 20-35
```
This means you can find this method between lines 20-35 in the specified file.

## Diagram Types

### Class Diagrams
Example: `floorplan-system.svg`
- Shows class relationships and hierarchies
- Arrows indicate dependencies
- Methods prefixed with:
  - `+` for public
  - `-` for private
  - `#` for protected

### Flowcharts
Example: `command-flow.svg`
- Shows process flows and data movement
- Arrows indicate direction of flow
- Subgraphs group related functionality

## Finding Related Code

1. **Component Location**
   ```
   LayersPanel {
       <<Component /src/components/floorplanner/LayersPanel.tsx:1-120>>
   }
   ```
   - Open `/src/components/floorplanner/LayersPanel.tsx`
   - Look at lines 1-120 for the component definition

2. **Method Location**
   ```
   +onLayerAdd() %% Line: 35-45
   ```
   - In the same file, go to lines 35-45
   - This contains the method implementation

3. **Following Dependencies**
   ```
   LayersPanel --> Layer
   ```
   - Find the `Layer` interface in `/src/types/shared.ts:40-55`
   - This shows type definitions used by LayersPanel

## Examples

### Finding a Component's Implementation
1. Open `canvas.svg` diagram
2. Locate `Canvas` component reference:
   ```
   <<Component /src/components/floorplanner/Canvas.tsx:350-450>>
   ```
3. Navigate to this file and line range to find the implementation

### Tracing a Flow
1. Open `command-flow.svg`
2. Start at "User Input" node
3. Follow arrows to next components
4. Use file references to find each implementation:
   ```
   User Input <small><i>/src/lib/commandHandler.ts:15-20</i></small>
   ```

## Tips
- Use IDE search to quickly locate files
- References are always relative to project root
- Line numbers are approximate and may shift slightly
- Check nearby lines if exact numbers don't match
- Related components are usually grouped in subgraphs

## Common Paths
- Components: `/src/components/`
- Services: `/src/lib/`
- Types: `/src/types/`
- Utilities: `/src/utils/`