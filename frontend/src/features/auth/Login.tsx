import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, Loader2, Database } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === 'string'
          ? detail
          : 'Incorrect email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
      width: '100%'
    }}>
      {/* Background Ambient Glow Blobs */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '20%',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167, 139, 250, 0.12) 0%, rgba(167, 139, 250, 0) 70%)',
        filter: 'blur(60px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '20%',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34, 211, 238, 0.12) 0%, rgba(34, 211, 238, 0) 70%)',
        filter: 'blur(60px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div 
        className="glass-card" 
        style={{
          width: '100%',
          maxWidth: '430px',
          padding: '2.75rem 2.25rem',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--card-border)',
          backgroundColor: 'var(--card-dark)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          zIndex: 1,
          position: 'relative',
          transition: 'var(--transition-smooth)',
          animation: 'fadeIn 0.5s ease-out'
        }}
      >
        {/* LOGO ICON */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            padding: '0.85rem',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)',
            transform: 'rotate(-5deg)'
          }}>
            <Database size={26} color="#fff" />
          </div>
        </div>

        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            background: 'linear-gradient(90deg, #a78bfa, #22d3ee)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
            letterSpacing: '-0.025em'
          }}>
            Welcome Back
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
            Sign in to access your inventory and order system
          </p>
        </div>

        {/* ERROR SUMMARY */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '10px',
            padding: '0.85rem 1.15rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'shake 0.3s ease-in-out'
          }}>
            <span style={{ fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
          {/* EMAIL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <label htmlFor="email" style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                <Mail size={16} />
              </div>
              <input
                id="email"
                type="email"
                placeholder="jane.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.65rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--card-border)',
                  color: 'var(--text-primary)',
                  fontSize: '0.925rem',
                  outline: 'none',
                  transition: 'var(--transition-smooth)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.15)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--card-border)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                }}
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <label htmlFor="password" style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                <Lock size={16} />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.85rem 2.65rem 0.85rem 2.65rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--card-border)',
                  color: 'var(--text-primary)',
                  fontSize: '0.925rem',
                  outline: 'none',
                  transition: 'var(--transition-smooth)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.15)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--card-border)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.975rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'var(--transition-smooth)',
              marginTop: '0.75rem',
              boxShadow: '0 6px 20px rgba(124, 58, 237, 0.25)'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.filter = 'brightness(1.08)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.35)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.filter = 'none';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.25)';
              }
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spinner" /> Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* BOTTOM LINKS */}
        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#c084fc', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#a78bfa'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#c084fc'}
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
