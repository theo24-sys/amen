import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { css } from '@emotion/react';
import styled from '@emotion/styled';

const colors = { charladyPink: '#FF6F91', charladyPurple: '#D4A5A5', charladyCream: '#FFF5E4' };

const Container = styled.div`min-height: 100vh; background-color: ${colors.charladyCream}; color: ${colors.charladyPurple};`;
const LoginBox = styled.div`padding: 1.5rem; background: white; border-radius: 0.75rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 400px; width: 100%;`;
const Title = styled.h1`font-size: 1.875rem; font-weight: bold; color: ${colors.charladyPink};`;
const Input = styled.input`margin-top: 1rem; padding: 0.5rem; border: 1px solid ${colors.charladyPurple}; border-radius: 0.375rem; width: 100%;`;
const Button = styled.button`margin-top: 1rem; padding: 0.5rem; background-color: ${colors.charladyPink}; color: white; border: none; border-radius: 0.375rem; width: 100%; cursor: pointer; &:hover { background-color: ${colors.charladyPurple}; }`;

const App = () => {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Container>
        <Routes>
          <Route path="/" element={<Login setUser={setUser} />} />
          <Route path="/dashboard" element={user ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/" />} />
        </Routes>
      </Container>
    </Router>
  );
};

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const res = await fetch('https://charlady-worker.your-subdomain.workers.dev/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.token) setUser({ email, token: data.token, role: jwt.decode(data.token).role });
  };

  return (
    <div css={css`display: flex; align-items: center; justify-content: center; min-height: 100vh;`}>
      <LoginBox>
        <Title>Welcome to CHARLADY</Title>
        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button onClick={handleLogin}>Login</Button>
      </LoginBox>
    </div>
  );
};

const Dashboard = ({ user, setUser }) => {
  const logout = () => setUser(null);

  return (
    <div css={css`padding: 1.5rem;`}>
      <Title>Hello, {user.email}!</Title>
      <Button onClick={logout}>Logout</Button>
      {user.role === 'worker' && <WorkerDashboard user={user} />}
      {user.role === 'employer' && <EmployerDashboard user={user} />}
      {user.role === 'admin' && <AdminDashboard user={user} />}
    </div>
  );
};

const WorkerDashboard = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetch('https://charlady-worker.your-subdomain.workers.dev/api/worker/profile', {
      headers: { Authorization: `Bearer ${user.token}` },
    }).then(res => res.json()).then(setProfile);
    fetch('https://charlady-worker.your-subdomain.workers.dev/api/jobs').then(res => res.json()).then(setJobs);
  }, [user.token]);

  const apply = (jobId) => {
    fetch('https://charlady-worker.your-subdomain.workers.dev/api/worker/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
      body: JSON.stringify({ jobId }),
    }).then(() => alert('Applied!'));
  };

  return (
    <div>
      <h2 css={css`font-size: 1.5rem; margin-top: 1rem;`}>Worker Dashboard</h2>
      {profile && <p>Name: {profile.name} | Bio: {profile.bio || 'Not set'}</p>}
      <h3>Available Jobs</h3>
      {jobs.map(job => (
        <div key={job.id} css={css`border: 1px solid ${colors.charladyPurple}; padding: 1rem; margin: 0.5rem 0; border-radius: 0.375rem;`}>
          <p>{job.title} - {job.salary}</p>
          <Button onClick={() => apply(job.id)}>Apply</Button>
        </div>
      ))}
    </div>
  );
};

const EmployerDashboard = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetch('https://charlady-worker.your-subdomain.workers.dev/api/jobs').then(res => res.json()).then(setJobs);
    fetch('https://charlady-worker.your-subdomain.workers.dev/api/employer/applications', {
      headers: { Authorization: `Bearer ${user.token}` },
    }).then(res => res.json()).then(setApplications);
  }, [user.token]);

  const postJob = async () => {
    const title = prompt('Job Title');
    const description = prompt('Description');
    const salary = prompt('Salary');
    const experience = prompt('Experience Required');
    await fetch('https://charlady-worker.your-subdomain.workers.dev/api/employer/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
      body: JSON.stringify({ title, description, salary, experience }),
    });
    window.location.reload();
  };

  return (
    <div>
      <h2 css={css`font-size: 1.5rem; margin-top: 1rem;`}>Employer Dashboard</h2>
      <Button onClick={postJob}>Post New Job</Button>
      <h3>Your Jobs</h3>
      {jobs.map(job => job.employerEmail === user.email && (
        <div key={job.id} css={css`border: 1px solid ${colors.charladyPurple}; padding: 1rem; margin: 0.5rem 0; border-radius: 0.375rem;`}>
          <p>{job.title} - {job.salary}</p>
        </div>
      ))}
      <h3>Applications</h3>
      {applications.map(app => (
        <div key={`${app.jobId}-${app.workerEmail}`} css={css`border: 1px solid ${colors.charladyPurple}; padding: 1rem; margin: 0.5rem 0; border-radius: 0.375rem;`}>
          <p>Worker: {app.workerEmail} | Status: {app.status}</p>
        </div>
      ))}
    </div>
  );
};

const AdminDashboard = ({ user }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('https://charlady-worker.your-subdomain.workers.dev/api/admin/users', {
      headers: { Authorization: `Bearer ${user.token}` },
    }).then(res => res.json()).then(setUsers);
  }, [user.token]);

  const verifyUser = (email) => {
    fetch('https://charlady-worker.your-subdomain.workers.dev/api/admin/verify', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
      body: JSON.stringify({ email }),
    }).then(() => window.location.reload());
  };

  return (
    <div>
      <h2 css={css`font-size: 1.5rem; margin-top: 1rem;`}>Admin Dashboard</h2>
      <h3>All Users</h3>
      {users.map(u => (
        <div key={u.email} css={css`border: 1px solid ${colors.charladyPurple}; padding: 1rem; margin: 0.5rem 0; border-radius: 0.375rem;`}>
          <p>Email: {u.email} | Role: {u.role} | Verified: {u.verified ? 'Yes' : 'No'}</p>
          {!u.verified && <Button onClick={() => verifyUser(u.email)}>Verify</Button>}
        </div>
      ))}
    </div>
  );
};

export default App;