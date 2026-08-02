import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis
} from 'recharts';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { accountAPI } from '../services/api';

const MOCK_CHART = [
  { day: 'Mon', balance: 180000 },
  { day: 'Tue', balance: 195000 },
  { day: 'Wed', balance: 188000 },
  { day: 'Thu', balance: 215000 },
  { day: 'Fri', balance: 209000 },
  { day: 'Sat', balance: 241000 },
  { day: 'Sun', balance: 247850 },
];

const fmt = (n) =>
  '₹' + parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

export default function Dashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    console.log("Dashboard mount - Current user object:", user);
  
    if (user && user.id) {
      accountAPI.getByUser(user.id)
        .then(r => {
          console.log("Account API Raw Response on Dashboard:", r);
          
          // 🎯 FIXED: Consistently extract response direct array based on your client wrapper fix
          const cleanArray = Array.isArray(r) ? r : (r?.data ? r.data : []);
          setAccounts(cleanArray);
        })
        .catch((err) => {
          console.error("Account API Network Error:", err);
          setAccounts([]);
        })
        .finally(() => setLoading(false));
    } else {
      // CRITICAL: Stop the spinner if session isn't populated yet
      console.warn("Skipping account fetch: user or user.id is missing.");
      setLoading(false); 
    }
  }, [user]);

  const total = accounts.reduce(
    (s, a) => s + parseFloat(a.balance || 0), 0
  );

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: '#1e2d12',
        border: '1px solid rgba(201,168,76,0.3)',
        borderRadius: 10, padding: '8px 14px',
      }}>
        <p style={{ color: '#f0c96a', fontWeight: 600, fontSize: 14 }}>
          {fmt(payload[0].value)}
        </p>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      <Navbar />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Welcome */}
        <div className="fade-in" style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>
            Good morning, {user?.name ? user.name.split(' ')[0] : 'User'} 👋
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginTop: 4 }}>
            Here's your financial overview
          </p>
        </div>

        {/* Hero Balance */}
        <div className="glass-card fade-in" style={{
          padding: '28px 32px', marginBottom: 20,
          background: 'linear-gradient(135deg, rgba(36,53,22,0.8), rgba(30,45,18,0.6))',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -60, right: -60,
            width: 220, height: 220, borderRadius: '50%',
            background: 'rgba(201,168,76,0.05)', pointerEvents: 'none',
          }}/>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-start', flexWrap: 'wrap', gap: 20,
          }}>
            <div>
              <p style={{
                color: 'rgba(255,255,255,0.4)', fontSize: 11,
                letterSpacing: 1.5, fontWeight: 600,
                textTransform: 'uppercase', marginBottom: 8,
              }}>Total Portfolio Balance</p>
              <p style={{
                fontSize: 42, fontWeight: 800,
                color: '#f0c96a', letterSpacing: -1, lineHeight: 1,
              }}>{fmt(total)}</p>
              <p style={{
                color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 8,
              }}>Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
            </div>
            <div style={{ display: 'flex', gap: 32 }}>
              {[
                { label: 'This Month', val: '+₹12,400', up: true },
                { label: 'Last Month', val: '-₹3,200',  up: false },
              ].map(s => (
                <div key={s.label}>
                  <p style={{
                    color: 'rgba(255,255,255,0.35)',
                    fontSize: 11, marginBottom: 4,
                  }}>{s.label}</p>
                  <p style={{
                    color: s.up ? '#7ec87e' : '#e07c7c',
                    fontSize: 18, fontWeight: 700,
                  }}>{s.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="glass-card fade-in" style={{
          padding: '24px 24px 16px', marginBottom: 20,
        }}>
          <p className="section-title">Balance History — Last 7 Days</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={MOCK_CHART}>
              <defs>
                <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#c9a84c" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#c9a84c" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4"/>
              <XAxis dataKey="day"
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                axisLine={false} tickLine={false}/>
              <YAxis
                tickFormatter={v => '₹' + Math.round(v/1000) + 'k'}
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                axisLine={false} tickLine={false} width={60}/>
              <Tooltip content={<CustomTooltip />}/>
              <Area
                type="monotone" dataKey="balance"
                stroke="#c9a84c" strokeWidth={2}
                fill="url(#gold)" dot={{ fill: '#f0c96a', r: 3 }}
                activeDot={{ r: 5, fill: '#f0c96a' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Grid — accounts + quick actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 20,
        }}>

          {/* Accounts */}
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 20,
            }}>
              <p className="section-title" style={{ margin: 0 }}>Your Accounts</p>
              <button
                className="ghost-btn"
                onClick={() => navigate('/create-account')}
                style={{ padding: '6px 14px', fontSize: 12 }}>
                + Add
              </button>
            </div>

            {loading && (
              <div style={{ textAlign: 'center', padding: 32 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', margin: '0 auto',
                  border: '2px solid rgba(201,168,76,0.2)',
                  borderTop: '2px solid #c9a84c',
                  animation: 'spin 0.8s linear infinite',
                }}/>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            )}

            {!loading && accounts.length === 0 && (
              <div style={{ textAlign: 'center', padding: 32 }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>🏦</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                  No accounts yet
                </p>
                <button
                  className="gold-btn"
                  onClick={() => navigate('/create-account')}
                  style={{ padding: '10px 20px', fontSize: 13, marginTop: 16 }}>
                  Open First Account
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {accounts.map(acc => (
                // 🎯 FIXED: Using resilient key identifier fallback
                <div key={acc?.id || acc?.accountNumber} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(201,168,76,0.15)',
                  borderRadius: 12, padding: 16,
                  transition: 'all 0.2s', cursor: 'pointer',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)';
                    e.currentTarget.style.background = 'rgba(201,168,76,0.05)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(201,168,76,0.15)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>
                          {acc?.accountType === 'SAVINGS' ? '💰' : '🏢'}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>
                          {acc?.accountType || 'SAVINGS'}
                        </span>
                        <span className={
                          acc?.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'
                        }>{acc?.status || 'ACTIVE'}</span>
                      </div>
                      <p style={{
                        color: 'rgba(255,255,255,0.35)', fontSize: 11,
                        fontFamily: 'monospace', marginTop: 6,
                      }}>{acc?.accountNumber}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{
                        color: 'rgba(255,255,255,0.35)',
                        fontSize: 10, marginBottom: 4,
                      }}>Balance</p>
                      <p style={{
                        color: '#f0c96a', fontSize: 18,
                        fontWeight: 700, letterSpacing: -0.5,
                      }}>{fmt(acc?.balance)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="glass-card" style={{ padding: 24 }}>
              <p className="section-title">Quick Actions</p>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
              }}>
                {[
                  { icon: '➕', label: 'New Account', path: '/create-account' },
                  { icon: '⬆️', label: 'Deposit',     path: '/deposit'        },
                  { icon: '⬇️', label: 'Withdraw',    path: '/withdraw'       },
                  { icon: '💸', label: 'Transfer',    path: '/transfer'       },
                ].map(a => (
                  <button
                    key={a.label}
                    onClick={() => navigate(a.path)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(201,168,76,0.15)',
                      borderRadius: 12, padding: '16px 12px',
                      textAlign: 'center', cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(201,168,76,0.08)';
                      e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.borderColor = 'rgba(201,168,76,0.15)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}>
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{a.icon}</div>
                    <p style={{
                      color: 'rgba(255,255,255,0.55)',
                      fontSize: 12, fontWeight: 500,
                    }}>{a.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="glass-card" style={{ padding: 24 }}>
              <p className="section-title">Account Stats</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Total Accounts', val: accounts.length },
                  { label: 'Active Accounts',
                    val: accounts.filter(a => a?.status === 'ACTIVE').length },
                  { label: 'Total Balance', val: fmt(total) },
                ].map(s => (
                  <div key={s.label} style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: 14,
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <span style={{
                      color: 'rgba(255,255,255,0.4)', fontSize: 13,
                    }}>{s.label}</span>
                    <span style={{
                      color: '#f0c96a', fontWeight: 600, fontSize: 14,
                    }}>{s.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}