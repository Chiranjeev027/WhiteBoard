import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css'; // New dedicated CSS file

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

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store token and redirect
      localStorage.setItem('token', data.token);
      setSuccess(true);
      setTimeout(() => navigate('/profile'), 1500); // Smooth redirect
      
    } catch (err) {
      setError(err.message || 'An error occurred during registration');
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
    <div className="signup-container">
      <form onSubmit={handleSubmit} className="signup-form">
        <h2 className="signup-title">Create Your Account</h2>
        
        {success && (
          <div className="success-message">
            Account created successfully! Redirecting...
          </div>
        )}

        <div className="form-group">
          <label htmlFor="name" className="input-label">Full Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email" className="input-label">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            placeholder="your@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="input-label">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
            placeholder="At least 6 characters"
            minLength="6"
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button 
          type="submit" 
          className="submit-button"
          disabled={loading}
        >
          {loading ? (
            <span className="button-loader"></span>
          ) : 'Sign Up'}
        </button>

        <p className="login-redirect">
          Already have an account? <a href="/login" className="login-link">Log in</a>
        </p>
      </form>
    </div>
  );
}

export default Signup;