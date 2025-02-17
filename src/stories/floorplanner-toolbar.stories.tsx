import type { Meta, StoryObj } from '@storybook/react';
import Toolbar from '../components/floorplanner/Toolbar';

const meta = {
  title: 'Floorplanner/Toolbar',
  component: Toolbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '1rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Toolbar>;

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