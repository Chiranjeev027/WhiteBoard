import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

function Profile() {
  const [profile, setProfile] = useState(null);
  const [canvases, setCanvases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCanvasName, setNewCanvasName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [shareInputVisible, setShareInputVisible] = useState(null);
  const [shareEmail, setShareEmail] = useState('');
  const [theme, setTheme] = useState('system'); // 'light' | 'dark' | 'system'
  const navigate = useNavigate();

  // Load profile & canvases
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');
      try {
        const [prRes, cvRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users/profile`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/canvas`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (!prRes.ok || !cvRes.ok) throw new Error('Fetch failed');
        const pr = await prRes.json();
        const cv = await cvRes.json();
        setProfile(pr.user);
        setCanvases(cv.canvases);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Apply theme class on <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      root.classList.add(mq.matches ? 'dark' : 'light');
      const handler = (e) => {
        root.classList.remove('light', 'dark');
        root.classList.add(e.matches ? 'dark' : 'light');
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const handleCreateCanvas = async () => {
    if (!newCanvasName.trim()) return alert('Enter a canvas name');
    setCreateLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/canvas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newCanvasName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCanvases((p) => [...p, data.canvas]);
      setNewCanvasName('');
    } catch (err) {
      alert(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleShareCanvas = async (id) => {
    if (!shareEmail.trim()) return alert('Enter an email');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/canvas/share/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shared_with: shareEmail }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      alert('Canvas shared successfully!');
      setShareInputVisible(null);
      setShareEmail('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenCanvas = (id) => navigate(`/canvas/${id}`);

  if (loading) {
    return (
      <div className="container">
        <div className="mb-6">
          <div className="skeleton" style={{ height: '32px', width: '300px', marginBottom: '8px' }}></div>
          <div className="skeleton" style={{ height: '16px', width: '200px' }}></div>
        </div>
        <div className="skeleton mb-4" style={{ height: '60px' }}></div>
        <div className="grid grid-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '180px' }}></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="container"><div className="alert alert-error">{error}</div></div>;
  }

  return (
    <div className="container">
      {/* Theme Switcher */}
      <div className="flex justify-end mb-4">
        <select 
          value={theme} 
          onChange={(e) => setTheme(e.target.value)} 
          className="input" 
          style={{ width: 'auto', minWidth: '120px' }}
        >
          <option value="system">🌓 System</option>
          <option value="light">☀️ Light</option>
          <option value="dark">🌙 Dark</option>
        </select>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="section-title">
            Welcome back{profile ? `, ${profile.name}` : ''}!
          </h1>
          <p className="page-subtitle">
            Your canvases and shared boards • {canvases.length} total
          </p>
        </div>
      </div>

      {/* Create Canvas */}
      <div className="card mb-6">
        <div className="card-body">
          <h3 className="text-lg font-semibold mb-3">Create new canvas</h3>
          <div className="create-canvas-form">
            <input
              className="input"
              placeholder="Enter canvas name..."
              value={newCanvasName}
              onChange={(e) => setNewCanvasName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateCanvas()}
            />
            <button
              onClick={handleCreateCanvas}
              className="btn btn-primary"
              disabled={createLoading}
            >
              {createLoading ? (
                <>
                  <span className="spinner"></span>
                  Creating...
                </>
              ) : (
                '+ Create Canvas'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Grid */}
      <div className="grid grid-3 gap-4">
        {canvases.length === 0 ? (
          <div className="card hover-lift" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            <div className="card-body" style={{ padding: '48px 24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
              <h3 className="text-lg font-semibold text-secondary mb-2">No canvases yet</h3>
              <p className="text-sm text-muted">
                Create your first canvas to start sketching and collaborating with your team.
              </p>
            </div>
          </div>
        ) : (
          canvases.map((canvas) => (
            <div key={canvas._id} className="card hover-lift">
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ flex: 1 }}>
                  <h3 className="font-semibold text-lg mb-2">{canvas.name}</h3>
                  <p className="text-xs text-muted mb-3">
                    Updated {new Date(canvas.updatedAt).toLocaleDateString()}
                  </p>
                  <div className="mb-4">
                    <span className={`badge ${String(canvas.owner) === String(profile?._id) ? 'badge-primary' : 'badge-success'}`}>
                      {String(canvas.owner) === String(profile?._id) ? '👑 Owner' : '🤝 Shared'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenCanvas(canvas._id)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    Open
                  </button>
                  <button 
                    onClick={() => setShareInputVisible(shareInputVisible === canvas._id ? null : canvas._id)}
                    className="btn btn-outline btn-sm"
                  >
                    Share
                  </button>
                </div>

                {shareInputVisible === canvas._id && (
                  <div className="mt-3 p-3" style={{ background: 'var(--border-light)', borderRadius: '8px' }}>
                    <div className="flex gap-2">
                      <input
                        className="input"
                        style={{ flex: 1, fontSize: '13px', padding: '8px 12px' }}
                        placeholder="Enter email to share..."
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                      />
                      <button 
                        onClick={() => handleShareCanvas(canvas._id)}
                        className="btn btn-primary btn-sm"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Profile;