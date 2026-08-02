import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { accountAPI } from '../services/api';

const fmt = n =>
  '₹' + parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

const QUICK_AMOUNTS = [500, 1000, 5000, 10000, 25000, 50000];

export default function Deposit() {
  const { user }  = useAuth();
  const [accounts, setAccounts]   = useState([]);
  const [selected, setSelected]   = useState('');
  const [amount, setAmount]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState('');
  const [error, setError]         = useState('');
  const [updatedBal, setUpdatedBal] = useState(null);

  useEffect(() => {
    if (user && user.id) {
      accountAPI.getByUser(user.id)
        .then(r => {
          
          setAccounts(r);
          if (r.length > 0) {
            setSelected(r[0].accountNumber);
          }
        })
        .catch(() => {});
    }
    else {
      console.log("skipped")
    }
  }, [user]);
  
const selectedAcc = accounts?.find(a => String(a.accountNumber) === String(selected)) || null;

  const onSubmit = async e => {
    e.preventDefault();
    if (!selected || !amount) return;
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await accountAPI.deposit({
        accountNumber: selected,
        amount: parseFloat(amount),
      });
      setUpdatedBal(res.balance);
      setSuccess(`₹${parseFloat(amount).toLocaleString('en-IN')} deposited successfully!`);
      setAmount('');
      
      // FIXED: Safely refresh accounts using the active logged-in user id
      if (user && user.id) {
        const r = await accountAPI.getByUser(user.id);
        setAccounts(r);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Deposit failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      <Navbar />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
        <div className="fade-in">

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'rgba(126,200,126,0.15)',
              border: '1px solid rgba(126,200,126,0.25)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 22,
            }}>⬆️</div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>
                Deposit Money
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
                Add funds to your account
              </p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 32 }}>

            {success && (
              <div style={{
                background: 'rgba(126,200,126,0.1)',
                border: '1px solid rgba(126,200,126,0.25)',
                borderRadius: 12, padding: '14px 18px',
                marginBottom: 24,
              }}>
                <p style={{ color: '#7ec87e', fontWeight: 600, fontSize: 14 }}>
                  ✓ {success}
                </p>
                {updatedBal !== null && (
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 4 }}>
                    New balance: {fmt(updatedBal)}
                  </p>
                )}
              </div>
            )}

            {error && (
              <div style={{
                background: 'rgba(224,124,124,0.1)',
                border: '1px solid rgba(224,124,124,0.25)',
                borderRadius: 10, padding: '12px 16px',
                color: '#e07c7c', fontSize: 13, marginBottom: 20,
              }}>{error}</div>
            )}

            <form onSubmit={onSubmit}>

              {/* Account Select */}
              <div style={{ marginBottom: 24 }}>
                <label className="field-label">Select Account</label>
                <select
                value={selected}
                onChange={e => { setSelected(e.target.value); setSuccess(''); }}
                required 
                className="olive-input"
              >
                <option value="">Choose account</option>
                
                {accounts && (Array.isArray(accounts) ? accounts : [accounts]).map(a => {
                  // FIXED: Fallback checks handle any naming structure variation from backend
                  const accNum = a?.accountNumber || a?.accNumber || a?.id || '';
                  const accType = a?.accountType || a?.type || 'Savings';
                  
                  return (
                    <option key={a?.id || accNum} value={accNum}>
                      {accType} — {accNum}
                    </option>
                  );
                })}
              </select>

                {/* Balance chip */}
                {selectedAcc && (
                  <div style={{
                    marginTop: 10, padding: '10px 14px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 10,
                    display: 'flex', justifyContent: 'space-between',
                  }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                      Current Balance
                    </span>
                    <span style={{ color: '#f0c96a', fontWeight: 700, fontSize: 14 }}>
                      {fmt(selectedAcc.balance)}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick amounts */}
              <div style={{ marginBottom: 24 }}>
                <label className="field-label">Quick Select</label>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8,
                }}>
                  {QUICK_AMOUNTS.map(q => (
                    <button
                      key={q} type="button"
                      onClick={() => setAmount(String(q))}
                      style={{
                        padding: '10px 8px', borderRadius: 10,
                        border: amount === String(q)
                          ? '2px solid #c9a84c'
                          : '1px solid rgba(255,255,255,0.08)',
                        background: amount === String(q)
                          ? 'rgba(201,168,76,0.12)'
                          : 'rgba(255,255,255,0.03)',
                        color: amount === String(q)
                          ? '#f0c96a' : 'rgba(255,255,255,0.55)',
                        fontSize: 13, fontWeight: 500,
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}>
                      ₹{q.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom amount */}
              <div style={{ marginBottom: 28 }}>
                <label className="field-label">Or Enter Amount</label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 16, top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#c9a84c', fontWeight: 700, fontSize: 18,
                  }}>₹</span>
                  <input
                    className="olive-input" type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    min="1" step="0.01" placeholder="0.00"
                    style={{ paddingLeft: 36, fontSize: 18, fontWeight: 600 }}
                  />
                </div>
                {amount && (
                  <p style={{
                    color: '#7ec87e', fontSize: 12, marginTop: 6,
                  }}>
                    New balance after deposit:{' '}
                    {fmt((parseFloat(selectedAcc?.balance || 0) + parseFloat(amount || 0)))}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !selected || !amount}
                className="gold-btn"
                style={{ width: '100%', padding: 14, fontSize: 15 }}>
                {loading ? 'Processing...' : '⬆️ Deposit Now'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}