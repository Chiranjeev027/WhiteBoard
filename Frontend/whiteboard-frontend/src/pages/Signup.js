// Frontend/whiteboard-frontend/src/pages/Signup.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css'; 

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) return 'Invalid email format';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const validationError = validateForm();
  if (validationError) return setError(validationError);

  setLoading(true);
  setError('');
  setSuccess(false); // Reset success state

  try {
    // 1. Register User (this should create both user and profile)
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    // First check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Server returned ${response.status}: ${text.substring(0, 100)}`);
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // 2. Store Token and Update State
    localStorage.setItem('token', data.token);
    setSuccess(true);
    
    // 3. Immediate Redirect (no waiting)
    navigate('/profile', { 
      state: { newlyRegistered: true } 
    });

  } catch (err) {
    setError(err.message.includes('<!DOCTYPE') 
      ? 'Server error - please try again later' 
      : err.message);
  } finally {
    setLoading(false);
  }
};

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="container-sm">
      <div className="grid grid-2 gap-6" style={{ alignItems: 'center', minHeight: '80vh' }}>
        
        {/* Left side - Branding */}
        <div className="hide-mobile">
          <h2 className="section-title">Create, collaborate, and iterate—visually.</h2>
          <p className="page-subtitle mt-3">
            A real-time whiteboard for teams. Sketch ideas, share canvases, and stay in sync.
          </p>
          <div className="flex gap-2 mt-6">
            <span className="badge">✨ Real-time collaboration</span>
            <span className="badge">🎨 Unlimited canvases</span>
            <span className="badge">👥 Share with teammates</span>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="card">
          <div className="card-body">
            <h3 className="section-title">Create your account</h3>
            <p className="text-secondary text-sm mt-1">It only takes a moment.</p>

            {success && (
              <div className="alert alert-success mt-4">
                Account created successfully! Redirecting...
              </div>
            )}
            
            {error && (
              <div className="alert alert-error mt-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6">
              <div className="form-group">
                <label className="label" htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  className="input"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="input"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="input"
                  placeholder="At least 8 characters"
                  minLength={8}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <div className="text-xs text-muted mt-1">
                  Use 8+ characters for a strong password.
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-lg mt-4" 
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </button>

              <div className="text-center text-sm text-secondary mt-4">
                Already have an account?{' '}
                <a 
                  href="/login" 
                  style={{ color: 'var(--primary)', textDecoration: 'none' }}
                >
                  Log in
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;