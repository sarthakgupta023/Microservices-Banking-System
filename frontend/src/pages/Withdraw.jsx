import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { accountAPI } from '../services/api';

const fmt = n =>
  '₹' + parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000];

export default function Withdraw() {
  const [accounts, setAccounts]     = useState([]);
  const [selected, setSelected]     = useState('');
  const [amount, setAmount]         = useState('');
  const [loading, setLoading]       = useState(false);
  const { user } = useAuth();
  const [success, setSuccess]       = useState('');
  const [error, setError]           = useState('');
  const [updatedBal, setUpdatedBal] = useState(null);

  useEffect(() => {
    if (user && user.id) {
      accountAPI.getByUser(user.id)
        .then(r => {
          // 🎯 FIXED: Direct response wrapper assignment (r instead of r.data)
          const cleanArray = Array.isArray(r) ? r : (r?.data ? r.data : []);
          setAccounts(cleanArray);
          
          if (cleanArray.length > 0) {
            setSelected(cleanArray[0].accountNumber);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const selectedAcc = accounts.find(a => String(a.accountNumber) === String(selected));
  const insufficient = selectedAcc &&
    amount && parseFloat(amount) > parseFloat(selectedAcc.balance);

  const onSubmit = async e => {
    e.preventDefault();
    if (!selected || !amount || insufficient) return;
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await accountAPI.withdraw({
        accountNumber: selected,
        amount: parseFloat(amount),
      });
      
      // 🎯 FIXED: Safe dynamic fallback checks from your custom client wrapper
      const newBalance = res?.balance || res?.data?.balance;
      setUpdatedBal(newBalance);
      
      setSuccess(`₹${parseFloat(amount).toLocaleString('en-IN')} withdrawn successfully!`);
      setAmount('');
      
      // 🎯 FIXED: Removed hardcoded user ID 1 and updated fetch to use direct reference 'r'
      if (user && user.id) {
        const r = await accountAPI.getByUser(user.id);
        setAccounts(r);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Withdrawal failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f1a08' }}>
      <Navbar />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
        <div className="fade-in">

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'rgba(224,124,124,0.12)',
              border: '1px solid rgba(224,124,124,0.2)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 22,
            }}>⬇️</div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>
                Withdraw Money
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
                Withdraw funds from your account
              </p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 32 }}>

            {success && (
              <div style={{
                background: 'rgba(126,200,126,0.1)',
                border: '1px solid rgba(126,200,126,0.25)',
                borderRadius: 12, padding: '14px 18px', marginBottom: 24,
              }}>
                <p style={{ color: '#7ec87e', fontWeight: 600, fontSize: 14 }}>
                  ✓ {success}
                </p>
                {updatedBal !== null && (
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 4 }}>
                    Remaining balance: {fmt(updatedBal)}
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

              <div style={{ marginBottom: 24 }}>
                <label className="field-label">Select Account</label>
                <select
                  value={selected}
                  onChange={e => { setSelected(e.target.value); setSuccess(''); }}
                  required className="olive-input">
                  <option value="">Choose account</option>
                  {accounts && (Array.isArray(accounts) ? accounts : [accounts]).map(a => (
                    <option key={a?.id || a?.accountNumber} value={a?.accountNumber}>
                      {a?.accountType || 'Savings'} — {a?.accountNumber}
                    </option>
                  ))}
                </select>

                {selectedAcc && (
                  <div style={{
                    marginTop: 10, padding: '10px 14px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 10,
                    display: 'flex', justifyContent: 'space-between',
                  }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                      Available Balance
                    </span>
                    <span style={{ color: '#f0c96a', fontWeight: 700, fontSize: 14 }}>
                      {fmt(selectedAcc.balance)}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 24 }}>
                <label className="field-label">Quick Select</label>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8,
                }}>
                  {QUICK_AMOUNTS.map(q => {
                    const disabled = selectedAcc &&
                      q > parseFloat(selectedAcc.balance);
                    return (
                      <button
                        key={q} type="button"
                        disabled={disabled}
                        onClick={() => setAmount(String(q))}
                        style={{
                          padding: '10px 8px', borderRadius: 10,
                          border: amount === String(q)
                            ? '2px solid #c9a84c'
                            : '1px solid rgba(255,255,255,0.08)',
                          background: amount === String(q)
                            ? 'rgba(201,168,76,0.12)'
                            : 'rgba(255,255,255,0.03)',
                          color: disabled
                            ? 'rgba(255,255,255,0.2)'
                            : amount === String(q)
                              ? '#f0c96a' : 'rgba(255,255,255,0.55)',
                          fontSize: 13, fontWeight: 500,
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          transition: 'all 0.15s',
                          opacity: disabled ? 0.4 : 1,
                        }}>
                        ₹{q.toLocaleString('en-IN')}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 28 }}>
                <label className="field-label">Or Enter Amount</label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 16, top: '50%',
                    transform: 'translateY(-50%)',
                    color: insufficient ? '#e07c7c' : '#c9a84c',
                    fontWeight: 700, fontSize: 18,
                  }}>₹</span>
                  <input
                    className="olive-input" type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    min="1" step="0.01" placeholder="0.00"
                    style={{
                      paddingLeft: 36, fontSize: 18, fontWeight: 600,
                      borderColor: insufficient
                        ? 'rgba(224,124,124,0.5)' : undefined,
                    }}
                  />
                </div>

                {/* Feedback messages */}
                {insufficient && (
                  <p style={{ color: '#e07c7c', fontSize: 12, marginTop: 6 }}>
                    ⚠ Insufficient balance
                  </p>
                )}
                {amount && !insufficient && selectedAcc && (
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 6 }}>
                    Balance after withdrawal:{' '}
                    <span style={{ color: '#7ec87e' }}>
                      {fmt(parseFloat(selectedAcc.balance) - parseFloat(amount))}
                    </span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !selected || !amount || insufficient}
                style={{
                  width: '100%', padding: 14, fontSize: 15,
                  background: insufficient
                    ? 'rgba(224,124,124,0.3)'
                    : 'linear-gradient(135deg,#c9a84c,#f0c96a)',
                  color: insufficient ? '#e07c7c' : '#1a2710',
                  fontWeight: 700, border: 'none', borderRadius: 12,
                  cursor: loading || !selected || !amount || insufficient
                    ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}>
                {loading ? 'Processing...' : '⬇️ Withdraw Now'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}