# Programming Basics for Kitchen & Bath Design Tool

## What is Programming?

Programming is giving instructions to a computer. Think of it like writing a very detailed recipe. In our case, we're creating a tool that helps design kitchens and bathrooms.

## Basic Concepts

### 1. Code
- Code is text that tells the computer what to do
- Each programming language has its own rules (syntax)
- Our project uses several languages:
  - TypeScript: Main programming language
  - HTML: Web page structure
  - CSS: Visual styling
  - GLSL: 3D graphics

Example TypeScript code:
```typescript
// This creates a wall in our design tool
function createWall(startPoint: Point, endPoint: Point) {
    const wall = new Wall(startPoint, endPoint);
    return wall;
}
```

### 2. Files and Folders
- Code is organized in files (like documents)
- Files are organized in folders (directories)
- Our main folders:
  - `src/`: Where most code lives
  - `public/`: Images, 3D models, etc.
  - `docs/`: Documentation

### 3. Programs We Use
- Visual Studio Code: Text editor for writing code
- Node.js: Runs JavaScript/TypeScript code
- Git: Tracks code changes
- Chrome/Firefox: Testing the application

## Key Terms Explained

### General Programming Terms

#### Variables
Like boxes that hold information:
```typescript
let wallHeight = 10; // A number
let wallColor = "blue"; // Text (string)
let isDoorOpen = true; // True/false (boolean)
```

#### Functions
Instructions grouped together:
```typescript
function calculateRoomArea(width: number, length: number) {
    return width * length;
}
```

#### Objects
Groups of related information:
```typescript
const room = {
    name: "Kitchen",
    width: 20,
    length: 15,
    hasWindow: true
};
```

### Our Project-Specific Terms

#### Design Elements
- **Wall**: Vertical structure dividing spaces
- **Room**: Enclosed space defined by walls
- **Fixture**: Bathroom/kitchen items (sinks, toilets)
- **Appliance**: Kitchen devices (refrigerators, stoves)

#### Technical Features
- **Viewport**: The visible area showing the design
- **Camera**: Virtual view point in 3D space
- **Render**: Process of drawing the design
- **Material**: Visual appearance of surfaces

## Basic Operations

### 1. Starting the Project
```bash
# In your terminal/command prompt:
npm run dev
```

### 2. Making Changes
1. Open files in Visual Studio Code
2. Make changes
3. Save the file
4. See changes in browser

### 3. Common Tasks
- Creating a new wall
- Adding an appliance
- Saving a design
- Loading a design

## Next Steps

1. Read `002_SETUP.md` for installation
2. Try running the project
3. Make small changes to understand the code
4. Ask questions when stuck

## Glossary of Terms

### A
- **API**: Way for different parts of code to communicate
- **Array**: List of items in code

### B
- **Browser**: Program that shows web pages
- **Bug**: Error in code

### C
- **Component**: Reusable piece of interface
- **Compiler**: Converts code to computer instructions

[... continues with full alphabet ...]

## Common Questions

### Q: Where do I start if I want to change how walls look?
A: Look in `src/components/floorplanner/Wall.tsx`

### Q: How do I add new types of appliances?
A: Check `src/data/catalog.ts`

[... continues with more Q&A ...]