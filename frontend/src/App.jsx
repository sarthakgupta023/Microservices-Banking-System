import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import CreateAccount from './pages/CreateAccount';
import Dashboard from './pages/Dashboard';
import Deposit from './pages/Deposit';
import History from './pages/History';
import Login from './pages/Login';
import Notifications from './pages/Notifications';
import Register from './pages/Register';
import Transfer from './pages/Transfer';
import Withdraw from './pages/Withdraw';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>}/>
          <Route path="/create-account" element={
            <PrivateRoute><CreateAccount /></PrivateRoute>}/>
          <Route path="/transfer" element={
            <PrivateRoute><Transfer /></PrivateRoute>}/>
          <Route path="/deposit" element={
            <PrivateRoute><Deposit /></PrivateRoute>}/>
          <Route path="/withdraw" element={
            <PrivateRoute><Withdraw /></PrivateRoute>}/>
          <Route path="/history" element={
            <PrivateRoute><History /></PrivateRoute>}/>
          <Route path="/notifications" element={
            <PrivateRoute><Notifications /></PrivateRoute>}/>
          <Route path="*" element={<Navigate to="/dashboard" replace />}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}