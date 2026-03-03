import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import Register from "./pages/Register";
import Login from "./pages/Login";

import Conversations from "./pages/Conversations";
import ChatWindow from "./pages/ChatWindow";

import signalService from "./services/signalService";
import { SignalStore } from "./services/SignalStore";

function App() {
  const user = useSelector((state) => state.user);

  useEffect(() => {
    // Initialize global Signal store with local keys once on app load
    // so it's ready for both Conversations and ChatWindow views
    if (user.keys) {
      const store = new SignalStore();
      signalService.initStore(store, user.keys);
    }
  }, [user.keys]);

  return (
    <Router>
      <Routes>
        <Route
          path="/register"
          element={
            !user.isAuthenticated ? <Register /> : <Navigate to="/chat" />
          }
        />
        <Route
          path="/login"
          element={!user.isAuthenticated ? <Login /> : <Navigate to="/chat" />}
        />
        <Route
          path="/chat"
          element={
            user.isAuthenticated ? <Conversations /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/chat/:uuid"
          element={
            user.isAuthenticated ? <ChatWindow /> : <Navigate to="/login" />
          }
        />
        <Route
          path="*"
          element={<Navigate to={user.isAuthenticated ? "/chat" : "/login"} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
