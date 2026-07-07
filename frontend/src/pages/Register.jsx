import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await authAPI.register(form);
      
      // 🎯 FIXED: Direct wrapper handling (extract correct token/profile data consistently)
      const cleanData = res?.data ? res.data : res;
      
      login(cleanData); 
      navigate('/dashboard');
    } catch (err) {
      const backendError = err.response?.data?.message || err.response?.data?.error || err.message || 'Registration failed';
      setError(backendError);
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 70% 50%, #243516 0%, #0f1a08 70%)',
      padding: 24,
    }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: 420 }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg,#c9a84c,#f0c96a)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 28, color: '#1a2710',
            boxShadow: '0 8px 32px rgba(201,168,76,0.3)',
          }}>◆</div>
          <h1 style={{ color: '#c9a84c', fontSize: 22, fontWeight: 700, letterSpacing: 2 }}>
            VERDANT BANK
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 6 }}>
            Open your account today
          </p>
        </div>

        <div className="glass-card" style={{ padding: 32 }}>

          {error && (
            <div style={{
              background: 'rgba(224,124,124,0.1)',
              border: '1px solid rgba(224,124,124,0.25)',
              borderRadius: 10, padding: '10px 14px',
              color: '#e07c7c', fontSize: 13, marginBottom: 20,
            }}>{error}</div>
          )}

          <form onSubmit={onSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label className="field-label">Full Name</label>
              <input
                className="olive-input" type="text"
                name="name" value={form.name} onChange={onChange}
                placeholder="Sarthak Gupta" required
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label className="field-label">Email Address</label>
              <input
                className="olive-input" type="email"
                name="email" value={form.email} onChange={onChange}
                placeholder="you@example.com" required
              />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label className="field-label">Password</label>
              <input
                className="olive-input" type="password"
                name="password" value={form.password} onChange={onChange}
                placeholder="Min 6 characters" required minLength={6}
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="gold-btn"
              style={{ width: '100%', padding: 14, fontSize: 14 }}>
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>

          <p style={{
            textAlign: 'center', marginTop: 24,
            color: 'rgba(255,255,255,0.35)', fontSize: 13,
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{
              color: '#c9a84c', fontWeight: 600, textDecoration: 'none',
            }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}