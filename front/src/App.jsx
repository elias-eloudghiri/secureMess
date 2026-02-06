import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Register from './pages/Register';

function App() {
  const user = useSelector((state) => state.user);

  return (
    <Router>
      <Routes>
        <Route path="/register" element={!user.isAuthenticated ? <Register /> : <Navigate to="/chat" />} />
        <Route path="/chat" element={user.isAuthenticated ? <div>Chat Interface (TODO)</div> : <Navigate to="/register" />} />
        <Route path="*" element={<Navigate to="/register" />} />
      </Routes>
    </Router>
  );
}

export default App;
