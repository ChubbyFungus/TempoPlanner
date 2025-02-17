import type { Meta, StoryObj } from '@storybook/react';
import Toolbar from './Toolbar';

const meta: Meta<typeof Toolbar> = {
  title: 'Floorplanner/Toolbar',
  component: Toolbar,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onItemDragStart: { action: 'dragStarted' },
    onDrawingModeChange: { action: 'drawingModeChanged' },
  },
};

export default meta;
type Story = StoryObj<typeof Toolbar>;

// Default State
export const Default: Story = {
  args: {
    activeDrawingMode: "",
  },
};

// Room Drawing Mode Active
export const RoomDrawingActive: Story = {
  args: {
    activeDrawingMode: "room",
  },
};

// Wall Drawing Mode Active
export const WallDrawingActive: Story = {
  args: {
    activeDrawingMode: "wall",
  },
};

// Surface Drawing Mode Active
export const SurfaceDrawingActive: Story = {
  args: {
    activeDrawingMode: "surface",
  },
}; 