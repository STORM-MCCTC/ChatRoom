import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import ChatRoom from "./ChatRoom";

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect from root to /chat */}
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<ChatRoom />} />
      </Routes>
    </Router>
  );
}

export default App;