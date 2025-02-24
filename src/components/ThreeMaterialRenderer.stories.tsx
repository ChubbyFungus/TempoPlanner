import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ThreeMaterialRenderer } from './ThreeMaterialRenderer';

// Create a decorator that provides a safe WebGL environment
const withWebGLContext = (Story: React.ComponentType<any>) => {
  return (
    <div style={{ 
      width: '100%', 
      height: '100%',
      minHeight: '300px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f5f5f5',
      padding: '20px'
    }}>
      <Story />
    </div>
  );
};

const meta = {
  title: 'Components/ThreeMaterialRenderer',
  component: ThreeMaterialRenderer,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    width: { control: 'number' },
    height: { control: 'number' },
    type: { control: 'text' },
    position: { control: 'object' },
    rotation: { control: 'object' },
  },
} satisfies Meta<typeof ThreeMaterialRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

// Create a basic story with minimal props
export const Default: Story = {
  args: {
    width: 400,
    height: 300,
    type: 'test-cube',
  },
};

export const LargeView: Story = {
  args: {
    width: 800,
    height: 600,
    type: 'test-cube',
  },
}; 