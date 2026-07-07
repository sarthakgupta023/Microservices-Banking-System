import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { accountAPI } from '../services/api';

export default function CreateAccount() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const [type, setType]     = useState('SAVINGS');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const onSubmit = async e => {
    e.preventDefault(); 
    
    // 🚀 Direct Action Guard: Agar click ke waqt user fetched nahi hai
    if (!user?.id) {
      setError('Session loading, please try again in a second.');
      return;
    }

    setLoading(true); setError('');
    try {
      await accountAPI.create({
        userId: user.id, // 🚀 Strict dynamic ID passed down to Gateway/Microservice
        accountHolderName: user?.name,
        email: user?.email,
        accountType: type,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create account');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f1a08' }}>
      <Navbar />
      <div style={{
        maxWidth: 480, margin: '0 auto',
        padding: '48px 24px',
      }}>
        <div className="fade-in">
          <h2 style={{
            fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6,
          }}>Open New Account</h2>
          <p style={{
            color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 32,
          }}>Choose your account type</p>

          <div className="glass-card" style={{ padding: 32 }}>

            {error && (
              <div style={{
                background: 'rgba(224,124,124,0.1)',
                border: '1px solid rgba(224,124,124,0.25)',
                borderRadius: 10, padding: '10px 14px',
                color: '#e07c7c', fontSize: 13, marginBottom: 24,
              }}>{error}</div>
            )}

            <form onSubmit={onSubmit}>
              {/* Type selector */}
              <label className="field-label">Account Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
                {[
                  { val: 'SAVINGS', icon: '💰', desc: 'Personal savings' },
                  { val: 'CURRENT', icon: '🏢', desc: 'Business use' },
                ].map(t => (
                  <button
                    key={t.val} type="button"
                    onClick={() => setType(t.val)}
                    style={{
                      padding: 20, borderRadius: 14, textAlign: 'center',
                      border: type === t.val
                        ? '2px solid #c9a84c'
                        : '1px solid rgba(255,255,255,0.1)',
                      background: type === t.val
                        ? 'rgba(201,168,76,0.1)'
                        : 'rgba(255,255,255,0.03)',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{t.icon}</div>
                    <p style={{
                      color: type === t.val ? '#f0c96a' : '#fff',
                      fontWeight: 600, fontSize: 14, marginBottom: 4,
                    }}>{t.val}</p>
                    <p style={{
                      color: 'rgba(255,255,255,0.35)', fontSize: 11,
                    }}>{t.desc}</p>
                  </button>
                ))}
              </div>

              {/* Preview Summary Wrapper */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12, padding: 16, marginBottom: 24,
              }}>
                {[
                  { l: 'Account Holder', v: user?.name || '—' },
                  { l: 'Email',          v: user?.email || '—' },
                  { l: 'Type',           v: type },
                  { l: 'Opening Balance',v: '₹0.00' },
                ].map(row => (
                  <div key={row.l} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
                      {row.l}
                    </span>
                    <span style={{ color: '#fff', fontSize: 12, fontWeight: 500 }}>
                      {row.v}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="submit" disabled={loading}
                className="gold-btn"
                style={{ width: '100%', padding: 14, fontSize: 14 }}>
                {loading ? 'Opening Account...' : 'Open Account →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}