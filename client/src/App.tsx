import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Overlay from "./pages/Overlay"
function App() {
  return (
    <Router>
      <nav>
        <ul>
          <li><Link to="/">Overlay</Link></li>

        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<Overlay />} />
      </Routes>
    </Router>
  );
};

export default App;
