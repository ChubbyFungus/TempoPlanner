import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./components/home";
import ObjModelTest from "./components/ObjModelTest";
import React from "react";

/**
 * Props for the ErrorBoundary component
 */
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * Error Boundary component that catches and handles errors in its child components
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  state = { hasError: false, error: null };

  /**
   * Updates state when an error occurs in a child component
   * @param error - The error that was thrown
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * Logs error information when a child component throws an error
   * @param error - The error that was thrown
   * @param errorInfo - Additional error information
   */
  componentDidCatch(error, errorInfo) {
    console.error("App Error:", error);
    console.error("Error Info:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Root application component that sets up routing and error handling
 * @returns The main application component with routing configuration
 */
function App() {
  console.log("Rendering App component"); // Debug log

  return (
    <ErrorBoundary>
      <Router>
        <div className="w-screen h-screen">
          <nav className="bg-gray-100 p-4">
            <Link to="/" className="mr-4">Home</Link>
            <Link to="/obj-test">OBJ Test</Link>
          </nav>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/obj-test" element={<ObjModelTest />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
