import type { Meta, StoryObj } from '@storybook/react';
import Toolbar from './Toolbar';

type Props = {
  onDrawingModeChange: (mode: string) => void;
  activeDrawingMode: string;
  layers: any[];
  activeLayer?: string;
  onLayerAdd?: () => void;
  onLayerDelete?: (id: string) => void;
  onLayerVisibilityToggle?: (id: string) => void;
  onLayerSelect?: (id: string) => void;
};

const meta: Meta<Props> = {
  title: 'Floorplanner/Toolbar',
  component: Toolbar,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onDrawingModeChange: { action: 'drawingModeChanged' },
  },
};

export default meta;
type Story = StoryObj<Props>;

// Default State
export const Default: Story = {
  name: 'Default View',
  args: {
    activeDrawingMode: "",
    layers: [],
  },
};

// Room Drawing Mode Active
export const RoomDrawingActive: Story = {
  name: 'Room Drawing Mode',
  args: {
    activeDrawingMode: "draw-room",
    layers: [],
  },
};

// Wall Drawing Mode Active
export const WallDrawingActive: Story = {
  name: 'Wall Drawing Mode',
  args: {
    activeDrawingMode: "draw-wall",
    layers: [],
  },
};

// Surface Drawing Mode Active
export const SurfaceDrawingActive: Story = {
  name: 'Surface Drawing Mode',
  args: {
    activeDrawingMode: "draw-surface",
    layers: [],
  },
}; 