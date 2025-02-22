import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./components/home";
import ObjModelTest from "./components/ObjModelTest";

function App() {
  return (
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
  );
}

export default App;
