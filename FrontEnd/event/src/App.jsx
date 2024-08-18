import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import EventList from "./components/EventList";
import AdminPanel from "./components/AdminPanel";
import { jwtDecode } from "jwt-decode";
import PrivateRoute from "./components/PrivateRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [user, setUser] = useState(null);
  console.log(user);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUser(decodedToken);
      } catch (error) {
        console.error("Token decoding failed", error);
        localStorage.removeItem("token");
      }
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    const decodedToken = jwtDecode(token);
    setUser(decodedToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <Router>
      <nav>
        <Link to="/">
          <button>Home</button>
        </Link>
        {!user && (
          <>
            <Link to="/register">
              <button>Register</button>
            </Link>
            <Link to="/login">
              <button>Login</button>
            </Link>
          </>
        )}
        {user && (
          <>
            <Link to="/events">
              <button>Events</button>
            </Link>
            <Link to="/admin">
              <button>Admin Panel</button>
            </Link>{" "}
            <button onClick={logout}>Logout</button>
          </>
        )}
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login login={login} />} />

        <Route
          path="/events"
          element={
            <PrivateRoute>
              <EventList />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminPanel />
            </PrivateRoute>
          }
        />
      </Routes>
      <ToastContainer />
    </Router>
  );
};

export default App;
