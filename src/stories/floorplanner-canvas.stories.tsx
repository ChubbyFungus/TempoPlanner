import type { Meta, StoryObj } from '@storybook/react';
import Canvas from '../components/floorplanner/Canvas';

const meta = {
  title: 'Floorplanner/Canvas',
  component: Canvas,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Canvas>;

export default meta;
type Story = StoryObj<typeof Canvas>;

// Empty Canvas
export const Empty: Story = {
  args: {
    elements: [],
    drawingMode: "",
    selectedElement: null,
    scale: 1,
  },
};

// Canvas with a Room
export const WithRoom: Story = {
  args: {
    elements: [
      {
        id: 'room-1',
        type: 'room',
        x: 100,
        y: 100,
        width: 400,
        height: 300,
        points: [
          { x: 100, y: 100 },
          { x: 500, y: 100 },
          { x: 500, y: 400 },
          { x: 100, y: 400 },
          { x: 100, y: 100 }
        ],
        rotation: 0,
        locked: false,
      }
    ],
    drawingMode: "",
    selectedElement: null,
    scale: 1,
  },
};

// Canvas with Appliance
export const WithAppliance: Story = {
  args: {
    elements: [
      {
        id: 'appliance-1',
        type: 'sub-zero-refrigerator',
        x: 200,
        y: 200,
        width: 100,
        height: 200,
        rotation: 0,
        locked: false,
        materialPreset: {
          category: 'appliances',
          materialId: 'stainlessSteel',
          settings: {
            normalScale: 0.6,
            roughness: 0.25,
            metalness: 0.95,
            displacementScale: 0.015,
            textureScale: { x: 2, y: 2 }
          }
        },
      }
    ],
    drawingMode: "",
    selectedElement: null,
    scale: 1,
  },
};

// Canvas in Room Drawing Mode
export const RoomDrawingMode: Story = {
  args: {
    elements: [],
    drawingMode: "draw-room",
    selectedElement: null,
    scale: 1,
    drawingPoints: [
      { x: 100, y: 100 },
      { x: 300, y: 100 },
      { x: 300, y: 300 },
    ],
  },
};

// Canvas with Multiple Elements
export const WithMultipleElements: Story = {
  args: {
    elements: [
      {
        id: 'room-1',
        type: 'room',
        x: 100,
        y: 100,
        width: 400,
        height: 300,
        points: [
          { x: 100, y: 100 },
          { x: 500, y: 100 },
          { x: 500, y: 400 },
          { x: 100, y: 400 },
          { x: 100, y: 100 }
        ],
        rotation: 0,
        locked: false,
      },
      {
        id: 'appliance-1',
        type: 'sub-zero-refrigerator',
        x: 200,
        y: 200,
        width: 100,
        height: 200,
        rotation: 0,
        locked: false,
        materialPreset: {
          category: 'appliances',
          materialId: 'stainlessSteel',
          settings: {
            normalScale: 0.6,
            roughness: 0.25,
            metalness: 0.95,
            displacementScale: 0.015,
            textureScale: { x: 2, y: 2 }
          }
        },
      },
      {
        id: 'surface-1',
        type: 'surface',
        x: 300,
        y: 150,
        width: 150,
        height: 80,
        rotation: 0,
        locked: false,
      }
    ],
    drawingMode: "",
    selectedElement: null,
    scale: 1,
  },
}; 