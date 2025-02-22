import React, { Component, ErrorInfo, memo, useMemo } from 'react';
import { THREE } from '@/lib/three';
import { ThreeMaterialRenderer } from './ThreeMaterialRenderer';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ModelErrorBoundary extends Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-600 rounded">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

const ModelRenderer = memo(({ type }: { type: string }) => {
  // Memoize dimensions to prevent re-renders
  const dimensions = useMemo(() => ({
    width: 500,
    height: 400
  }), []);

  return (
    <div className="bg-gray-100 rounded p-4">
      <ThreeMaterialRenderer
        width={dimensions.width}
        height={dimensions.height}
        type={type}
      />
    </div>
  );
});

const ObjModelTest: React.FC = memo(() => {
  // Memoize the model renderers to prevent unnecessary re-renders
  const leftHandModel = useMemo(() => (
    <div>
      <h2 className="text-lg font-semibold mb-2">315W-O Left Hand</h2>
      <ModelErrorBoundary>
        <ModelRenderer type="appliance-315W-O-LH" />
      </ModelErrorBoundary>
    </div>
  ), []);

  const rightHandModel = useMemo(() => (
    <div>
      <h2 className="text-lg font-semibold mb-2">315W-O Right Hand</h2>
      <ModelErrorBoundary>
        <ModelRenderer type="appliance-315W-O-RH" />
      </ModelErrorBoundary>
    </div>
  ), []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">OBJ Model Test</h1>
      
      <div className="grid grid-cols-2 gap-4">
        {leftHandModel}
        {rightHandModel}
      </div>
    </div>
  );
});

export default ObjModelTest;
