import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { accountAPI, transactionAPI } from '../services/api';

const fmt = n =>
  '₹' + parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

export default function Transfer() {
  const { user } = useAuth(); 
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({
    fromAccount: '', toAccount: '', amount: '', description: '',
  });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState('');
  const [error, setError]       = useState('');

  // 1. Fetch user accounts dynamically using the direct response fix (r instead of r.data)
  useEffect(() => {
    if (user && user.id) {
      accountAPI.getByUser(user.id)
        .then(r => {
          // 🎯 FIXED: Direct wrapper conversion
          const cleanArray = Array.isArray(r) ? r : (r?.data ? r.data : []);
          setAccounts(cleanArray);
          
          if (cleanArray.length > 0) {
            setForm(prev => ({ ...prev, fromAccount: cleanArray[0].accountNumber }));
          }
        })
        .catch(() => {});
    }
  }, [user]); 

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const selectedAcc = accounts.find(a => String(a.accountNumber) === String(form.fromAccount));

  const onSubmit = async e => {
    e.preventDefault(); 
    
    if (!user?.id) {
      setError("Session loading, please try again in a second.");
      return;
    }

    setLoading(true); setError(''); setSuccess('');

    const activeAcc = accounts.find(a => String(a.accountNumber) === String(form.fromAccount));
    if (!activeAcc) {
      setError("Please select a valid 'From Account'");
      setLoading(false);
      return;
    }

    if (parseFloat(form.amount) > parseFloat(activeAcc.balance)) {
      setError("Insufficient balance in the selected account.");
      setLoading(false);
      return;
    }

    try {
      // 🚀 Clean Payload passing exact account numbers to Microservices
      await transactionAPI.transfer({
        senderAccountId:   form.fromAccount.trim(),          
        receiverAccountId: form.toAccount.trim(),      
        amount:            parseFloat(form.amount),
        currency:          "INR",                       
        type:              "TRANSFER",                  
        description:       form.description,
      });
      
      setSuccess('Transfer initiated successfully!');
      
      // Reset form fields but keep the default sender account selected
      setForm({ 
        fromAccount: accounts.length > 0 ? accounts[0].accountNumber : '', 
        toAccount: '', 
        amount: '', 
        description: '' 
      });

      // 🎯 FIXED: Re-fetching balance using direct response assignment 'r'
      if (user && user.id) {
        const r = await accountAPI.getByUser(user.id);
        setAccounts(r);
      }

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Transfer failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      <Navbar />
      <div style={{ maxWidth: 540, margin: '0 auto', padding: '48px 24px' }}>
        <div className="fade-in">
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
            Transfer Money
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 32 }}>
            Send money instantly between accounts
          </p>

          <div className="glass-card" style={{ padding: 32 }}>

            {success && (
              <div style={{
                background: 'rgba(126,200,126,0.1)',
                border: '1px solid rgba(126,200,126,0.25)',
                borderRadius: 10, padding: '12px 16px',
                color: '#7ec87e', fontSize: 13, marginBottom: 20,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>✓ {success}</div>
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
              <div style={{ marginBottom: 20 }}>
                <label className="field-label">From Account</label>
                <select
                  name="fromAccount" value={form.fromAccount}
                  onChange={onChange} required className="olive-input">
                  <option value="">Select your account</option>
                  {accounts && (Array.isArray(accounts) ? accounts : [accounts]).map(a => (
                    <option key={a?.id || a?.accountNumber} value={a?.accountNumber}>
                      {a?.accountNumber} — {fmt(a?.balance)}
                    </option>
                  ))}
                </select>
                {selectedAcc && (
                  <p style={{
                    color: '#c9a84c', fontSize: 12, marginTop: 6,
                  }}>
                    Available: {fmt(selectedAcc.balance)}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="field-label">To Account Number</label>
                <input
                  className="olive-input" type="text"
                  name="toAccount" value={form.toAccount}
                  onChange={onChange} required
                  placeholder="BNK1234567890"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="field-label">Amount</label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 16, top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#c9a84c', fontWeight: 700, fontSize: 16,
                  }}>₹</span>
                  <input
                    className="olive-input" type="number"
                    name="amount" value={form.amount}
                    onChange={onChange} required
                    min="1" step="0.01" placeholder="0.00"
                    style={{ paddingLeft: 36 }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 28 }}>
                <label className="field-label">Description (Optional)</label>
                <input
                  className="olive-input" type="text"
                  name="description" value={form.description}
                  onChange={onChange}
                  placeholder="Add a note..."
                />
              </div>

              {/* Summary */}
              {form.fromAccount && form.amount && (
                <div style={{
                  background: 'rgba(201,168,76,0.06)',
                  border: '1px solid rgba(201,168,76,0.2)',
                  borderRadius: 12, padding: 16, marginBottom: 24,
                }}>
                  <p style={{
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: 11, letterSpacing: 1, marginBottom: 12,
                  }}>TRANSFER SUMMARY</p>
                  {[
                    { l: 'Amount', v: fmt(form.amount || 0) },
                    { l: 'From',   v: form.fromAccount || '—' },
                    { l: 'To',     v: form.toAccount   || '—' },
                  ].map(r => (
                    <div key={r.l} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '6px 0',
                    }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                        {r.l}
                      </span>
                      <span style={{
                        color: '#fff', fontSize: 12,
                        fontWeight: 500, fontFamily: 'monospace',
                      }}>{r.v}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="gold-btn"
                style={{ width: '100%', padding: 14, fontSize: 15 }}>
                {loading ? 'Processing...' : '💸 Send Money'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}