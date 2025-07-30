// Frontend/whiteboard-frontend/src/pages/Profile.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNewSocket } from '../utils/socket';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [canvases, setCanvases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCanvasName, setNewCanvasName] = useState('');
  const [shareInputVisible, setShareInputVisible] = useState(null); // canvasId
  const [shareEmail, setShareEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileAndCanvases = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const profileRes = await fetch('http://localhost:5001/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const profileData = await profileRes.json();
        if (!profileRes.ok) throw new Error(profileData.message || 'Failed to fetch profile');
        setProfile(profileData.user);

        const canvasRes = await fetch('http://localhost:5001/canvas', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const canvasData = await canvasRes.json();
        if (!canvasRes.ok) throw new Error(canvasData.message || 'Failed to fetch canvases');
        setCanvases(canvasData.canvases);

        setLoading(false);
      } catch (err) {
        setError(err.message || 'An error occurred');
        navigate('/login');
      }
    };

    fetchProfileAndCanvases();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCreateCanvas = async () => {
    const token = localStorage.getItem('token');
    if (!newCanvasName.trim()) {
      alert('Canvas name cannot be empty');
      return;
    }

    try {
      const res = await fetch('http://localhost:5001/canvas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCanvasName }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to create canvas');

      setCanvases((prev) => [...prev, data.canvas]);
      setNewCanvasName('');
      alert('Canvas created!');
    } catch (error) {
      console.error(error);
      alert(error.message || 'Error creating canvas');
    }
  };

  const handleShareCanvas = async (canvasId) => {
    const token = localStorage.getItem('token');
    if (!shareEmail.trim()) {
      alert('Email cannot be empty');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5001/canvas/share/${canvasId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ shared_with: shareEmail }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to share canvas');

      alert('Canvas shared successfully!');
      setShareInputVisible(null);
      setShareEmail('');
    } catch (error) {
      console.error(error);
      alert(error.message || 'Error sharing canvas');
    }
  };


  const handleOpenCanvas = (canvasId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const socket = createNewSocket();

    // Set up event handlers first
    socket.on('connect', () => {
      console.log("Socket connected, authenticating...");
      socket.emit('authenticate', token);
    });

    socket.on('authenticationSuccess', () => {
      console.log("Authentication successful, joining canvas...");
      socket.emit('joinCanvas', { canvasId });
    });

    // Add these handlers
    socket.on('loadCanvas', (canvasData) => {
      navigate(`/canvas/${canvasId}`);
    });

    socket.on('canvasError', (err) => {
      alert(`Canvas error: ${err.message}`);
      console.error("Canvas error:", err);
    });

    // Connect socket
    socket.connect();
  };


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Welcome, {profile?.name}!</h2>

      <button onClick={handleLogout} style={styles.button}>Logout</button>

      <hr style={{ margin: '1.5rem 0' }} />

      <div style={styles.createCanvasSection}>
        <h3>Create New Canvas</h3>
        <input
          type="text"
          placeholder="Enter canvas name"
          value={newCanvasName}
          onChange={(e) => setNewCanvasName(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleCreateCanvas} style={styles.createButton}>
          Create Canvas
        </button>
      </div>

      <hr style={{ margin: '1.5rem 0' }} />

      <h3>Your Canvases:</h3>
      <div style={styles.canvasList}>
        {canvases.length === 0 ? (
          <p>No canvases found.</p>
        ) : (
          canvases.map((canvas) => (
            <div key={canvas._id} style={styles.canvasCard}>
              <h4>{canvas.name}</h4>
              <p><strong>Created:</strong> {new Date(canvas.createdAt).toLocaleString()}</p>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  onClick={() => handleOpenCanvas(canvas._id)}
                  style={styles.openButton}
                >
                  Open Canvas
                </button>
                <button
                  onClick={() => {
                    setShareInputVisible(
                      shareInputVisible === canvas._id ? null : canvas._id
                    );
                    setShareEmail('');
                  }}
                  style={styles.shareButton}
                >
                  Share
                </button>
              </div>

              {shareInputVisible === canvas._id && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                  <input
                    type="email"
                    placeholder="Enter user email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    style={{ flex: 1, padding: '6px' }}
                  />
                  <button
                    onClick={() => handleShareCanvas(canvas._id)}
                    style={{
                      padding: '6px 12px',
                      background: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Share Canvas
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '700px',
    margin: '2rem auto',
    padding: '2rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  },
  title: {
    marginBottom: '1rem',
  },
  button: {
    padding: '0.5rem 1rem',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '1rem',
  },
  createCanvasSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '1rem',
  },
  input: {
    padding: '6px',
    flex: 1,
  },
  createButton: {
    padding: '6px 12px',
    background: 'green',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  canvasList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '1rem',
  },
  canvasCard: {
    padding: '1rem',
    border: '1px solid #ccc',
    borderRadius: '6px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },
  openButton: {
    padding: '6px 12px',
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  shareButton: {
    padding: '6px 12px',
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Profile;
