import React, { useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { authClient } from '../lib/auth/client';

export default function SignInPage(): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password');
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || 'Invalid email or password');
        return;
      }

      // Redirect to dashboard on success
      window.location.href = '/dashboard';
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Sign In" description="Sign in to your account">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-card__title">Welcome Back</h1>
          <p className="auth-card__subtitle">
            Sign in to continue your learning journey
          </p>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form__field">
              <label htmlFor="email" className="auth-form__label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-form__input"
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-form__field">
              <label htmlFor="password" className="auth-form__label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-form__input"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="auth-form__submit"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="auth-link">
            Don't have an account?{' '}
            <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
      <style>{`
        .auth-error {
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
          color: #ef4444;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }
      `}</style>
    </Layout>
  );
}
