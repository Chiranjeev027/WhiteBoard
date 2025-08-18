import React from 'react';

function Navbar() {
  const token = localStorage.getItem('token');

  return (
    <div className="navbar">
      <div className="navbar-inner">
        <a href={token ? '/profile' : '/'} className="brand">
          <div className="brand-logo">🎨</div>
          <div className="brand-title">Whiteboard Pro</div>
        </a>
        <div className="nav-links">
          {token ? (
            <>
              <a href="/profile" className="nav-link">Dashboard</a>
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                }}
                className="btn btn-ghost btn-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="nav-link">Login</a>
              <a href="/signup" className="btn btn-primary btn-sm">
                Sign up
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
