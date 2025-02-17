import { BrowserRouter as Router } from "react-router-dom";
import Home from "./components/home";

function App() {
  return (
    <Router>
      <div className="w-screen h-screen">
        <Home />
      </div>
    </Router>
  );
}

export default App;
