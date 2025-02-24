import type { Meta, StoryObj } from '@storybook/react';
import Canvas from './Canvas';
import { Layer, Point, WallSegment, Corner } from '@/types/shared';

// Create a decorator that controls the canvas size
const withCanvasContainer = (Story: React.ComponentType<any>) => {
  return (
    <div style={{ 
      width: '1024px', 
      height: '768px',
      maxWidth: '100%',
      maxHeight: '100vh',
      margin: '0 auto',
      overflow: 'hidden'
    }}>
      <Story />
    </div>
  );
};

// Sample data
const sampleRoom: Point[] = [
  { x: 100, y: 100 },
  { x: 500, y: 100 },
  { x: 500, y: 400 },
  { x: 100, y: 400 },
  { x: 100, y: 100 }
];

const sampleWallSegments: WallSegment[] = [
  { start: { x: 100, y: 100 }, end: { x: 500, y: 100 }, thickness: 6 },
  { start: { x: 500, y: 100 }, end: { x: 500, y: 400 }, thickness: 6 },
  { start: { x: 500, y: 400 }, end: { x: 100, y: 400 }, thickness: 6 },
  { start: { x: 100, y: 400 }, end: { x: 100, y: 100 }, thickness: 6 }
];

const sampleCorners: Corner[] = [
  { x: 100, y: 100, wallSegments: [sampleWallSegments[0], sampleWallSegments[3]] },
  { x: 500, y: 100, wallSegments: [sampleWallSegments[0], sampleWallSegments[1]] },
  { x: 500, y: 400, wallSegments: [sampleWallSegments[1], sampleWallSegments[2]] },
  { x: 100, y: 400, wallSegments: [sampleWallSegments[2], sampleWallSegments[3]] }
];

const sampleLayers: Layer[] = [
  {
    id: 'layer-1',
    name: 'Layer 1',
    visible: true,
    locked: false,
    allowedTools: ['select', 'draw-room', 'draw-wall', 'draw-surface'],
    elements: [{
      id: 'room-1',
      type: 'room',
      x: 100,
      y: 100,
      width: 400,
      height: 300,
      points: sampleRoom,
      rotation: 0,
      locked: false,
      wallSegments: sampleWallSegments,
      corners: sampleCorners,
      color: '#f3f4f6'
    }]
  }
];

const meta = {
  title: 'Floorplanner/Canvas',
  component: Canvas,
  parameters: {
    layout: 'fullscreen',
    chromatic: { 
      viewports: [1024],
      delay: 300 // Add delay to ensure animations complete
    }
  },
  decorators: [withCanvasContainer],
  argTypes: {
    viewMode: {
      control: 'radio',
      options: ['2d', '3d']
    },
    drawingMode: {
      control: 'select',
      options: ['', 'select', 'draw-room', 'draw-wall', 'draw-surface']
    }
  }
} satisfies Meta<typeof Canvas>;

export default meta;
type Story = StoryObj<typeof Canvas>;

// Empty Canvas
export const Empty: Story = {
  args: {
    layers: [],
    drawingMode: '',
    selectedElement: undefined,
    scale: 1,
    viewMode: '2d',
  },
};

// Canvas with Room
export const WithRoom: Story = {
  args: {
    layers: sampleLayers,
    drawingMode: '',
    selectedElement: undefined,
    scale: 1,
    viewMode: '2d',
  },
};

// Room Drawing Mode
export const RoomDrawingMode: Story = {
  args: {
    layers: [],
    drawingMode: 'draw-room',
    selectedElement: undefined,
    scale: 1,
    viewMode: '2d',
    selectedRoomTemplate: {
      points: sampleRoom,
      width: 400,
      height: 300,
      wallSegments: sampleWallSegments,
      corners: sampleCorners
    },
  },
};

// Wall Drawing Mode
export const WallDrawingMode: Story = {
  args: {
    layers: [],
    drawingMode: 'draw-wall',
    selectedElement: undefined,
    scale: 1,
    viewMode: '2d',
    wallStartPoint: { x: 100, y: 100 },
    drawingPoints: [
      { x: 100, y: 100 },
      { x: 300, y: 100 },
      { x: 300, y: 300 }
    ],
  },
};

// 3D View Mode
export const ThreeDView: Story = {
  args: {
    layers: sampleLayers,
    drawingMode: '',
    selectedElement: undefined,
    scale: 1,
    viewMode: '3d',
  },
};

// Selection Mode
export const SelectionMode: Story = {
  args: {
    layers: sampleLayers,
    drawingMode: 'select',
    selectedElement: sampleLayers[0].elements[0],
    scale: 1,
    viewMode: '2d',
  },
}; 