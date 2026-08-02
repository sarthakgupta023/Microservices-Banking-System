import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name
    ?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const linkStyle = ({ isActive }) => ({
    color: isActive ? '#c9a84c' : 'rgba(255,255,255,0.45)',
    fontSize: 13, fontWeight: 500, textDecoration: 'none',
    padding: '6px 12px', borderRadius: 8,
    background: isActive ? 'rgba(201,168,76,0.1)' : 'transparent',
    transition: 'all 0.2s',
  });

  return (
    <nav style={{
      background: 'rgba(15, 26, 8, 0.75)',
      borderBottom: '1px solid rgba(201,168,76,0.18)',
      padding: '0 24px', height: 60,
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 100,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg,#c9a84c,#f0c96a)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 16, color: '#1a2710',
        }}>◆</div>
        <span style={{
          color: '#c9a84c', fontWeight: 700,
          fontSize: 15, letterSpacing: 1,
        }}>VERDANT BANK</span>
      </div>

      {/* Links */}
      <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <NavLink to="/dashboard"      style={linkStyle}>Dashboard</NavLink>
        <NavLink to="/deposit"        style={linkStyle}>Deposit</NavLink>
        <NavLink to="/withdraw"       style={linkStyle}>Withdraw</NavLink>
        <NavLink to="/transfer"       style={linkStyle}>Transfer</NavLink>
        <NavLink to="/history"        style={linkStyle}>History</NavLink>
        <NavLink to="/notifications"  style={linkStyle}>Notifications 🔔</NavLink>
        <NavLink to="/create-account" style={linkStyle}>+ Account</NavLink>
      </div>

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
          {user?.name}
        </span>
        <div
          onClick={() => setOpen(!open)}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg,#c9a84c,#f0c96a)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 700,
            fontSize: 13, color: '#1a2710', cursor: 'pointer',
            position: 'relative',
            boxShadow: '0 0 0 2px rgba(201,168,76,0.3)',
          }}>
          {initials}
          {open && (
            <div style={{
              position: 'absolute', top: 44, right: 0,
              background: '#1e2d12',
              border: '1px solid rgba(201,168,76,0.25)',
              borderRadius: 12, padding: 8, minWidth: 160,
              boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
            }}>
              <div style={{
                padding: '8px 12px', fontSize: 12,
                color: 'rgba(255,255,255,0.4)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                marginBottom: 4,
              }}>{user?.email}</div>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', padding: '8px 12px',
                  background: 'none', border: 'none',
                  color: '#e07c7c', fontSize: 13,
                  cursor: 'pointer', textAlign: 'left',
                  borderRadius: 8,
                }}>Sign out</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}