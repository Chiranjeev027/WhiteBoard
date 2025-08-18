import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Login.css';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    console.log('REACT_APP_BACKEND_URL:', process.env.REACT_APP_BACKEND_URL);
    console.log("Attempting login to:", `${process.env.REACT_APP_BACKEND_URL}/users/login`);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-sm">
      <div className="grid grid-2 gap-6" style={{ alignItems: 'center', minHeight: '80vh' }}>
        
        {/* Left side - Branding */}
        <div className="hide-mobile">
          <h2 className="section-title">Welcome back</h2>
          <p className="page-subtitle mt-3">
            Sign in to your account to continue where you left off.
          </p>
          <div className="flex gap-2 mt-6">
            <span className="badge badge-primary">🎯 Pick up where you left off</span>
            <span className="badge badge-primary">⚡ Lightning fast sync</span>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="card">
          <div className="card-body">
            <h3 className="section-title">Log in</h3>
            <p className="text-secondary text-sm mt-1">Enter your credentials to access your account.</p>

            {error && (
              <div className="alert alert-error mt-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6">
              <div className="form-group">
                <label className="label" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-lg mt-4"
                style={{ width: '100%' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>

              <div className="text-center text-sm text-secondary mt-4">
                Don't have an account?{' '}
                <a 
                  href="/signup" 
                  style={{ color: 'var(--primary)', textDecoration: 'none' }}
                >
                  Sign up
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;