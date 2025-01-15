import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Overlay from "./pages/Overlay";
import Chat from "./pages/Chat";
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <h1>Crypto Super Chat</h1>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/home" element={<Home/>} />
        <Route path="/:streamerId/overlay" element={<Overlay />} />
        <Route path="/:streamerId/chat" element={<Chat/>} />
      </Routes>
    </Router>
  );
};

export default App;
