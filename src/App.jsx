jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { jwtDecode } from 'jwt-decode';

const Container = styled.div`
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  background-color: purple;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: darkorchid;
  }
`;

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) setUser(savedUser);
  }, [setUser]);

  const handleLogin = async () => {
    try {
      const res = await fetch("https://charlady-worker.timothybanjo42.workers.dev/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Invalid credentials");

      const data = await res.json();
      if (data.token) {
        const userData = { email, token: data.token, role: jwt_decode(data.token).role };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container>
      <h2>Login</h2>
      {error && <p css={css`color: red;`}>{error}</p>}
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button onClick={handleLogin}>Login</Button>
    </Container>
  );
};

const Dashboard = ({ user }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser && savedUser.role) {
      handleNavigation(savedUser);
    }
  }, [navigate]);

  const handleNavigation = (user) => {
    if (user.role === "worker") navigate("/worker");
    else if (user.role === "employer") navigate("/employer");
    else if (user.role === "admin") navigate("/admin");
  };

  return <h2>Redirecting to your dashboard...</h2>;
};

const WorkerDashboard = () => <h2>Worker Dashboard</h2>;
const EmployerDashboard = () => <h2>Employer Dashboard</h2>;
const AdminDashboard = () => <h2>Admin Dashboard</h2>;

const App = () => {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setUser={setUser} />} />
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/worker" element={<WorkerDashboard />} />
        <Route path="/employer" element={<EmployerDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;