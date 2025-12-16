import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { authClient, User } from '../lib/auth/client';

export default function ProfilePage(): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUser = authClient.getCurrentUser();
        if (storedUser) {
          setUser(storedUser);
          // Verify session
          const session = await authClient.getSession();
          if (session.data?.user) {
            setUser(session.data.user);
          } else {
            // Session expired, redirect to sign in
            window.location.href = '/signin';
          }
        } else {
          // Not logged in, redirect to sign in
          window.location.href = '/signin';
        }
      } catch (error) {
        console.error('Error checking user session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    await authClient.signOut();
    window.location.href = '/';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Layout title="Profile">
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p>Loading profile...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout title="Profile">
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p>Please sign in to view your profile.</p>
          <Link to="/signin" className="button button--primary">
            Sign In
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Profile" description="View and manage your profile">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">{getInitials(user.name)}</div>
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-email">{user.email}</p>
          </div>

          <div className="profile-section">
            <h2 className="profile-section-title">Account Information</h2>
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <span className="profile-info-label">Full Name</span>
                <span className="profile-info-value">{user.name}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Email Address</span>
                <span className="profile-info-value">{user.email}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">User ID</span>
                <span className="profile-info-value profile-info-id">{user.id}</span>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h2 className="profile-section-title">Quick Links</h2>
            <div className="profile-links">
              <Link to="/dashboard" className="profile-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                View Dashboard
              </Link>
              <Link to="/docs/intro" className="profile-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                Continue Learning
              </Link>
            </div>
          </div>

          <div className="profile-section profile-section-danger">
            <h2 className="profile-section-title">Sign Out</h2>
            <p className="profile-section-description">
              Sign out of your account on this device.
            </p>
            <button
              className="profile-signout-button"
              onClick={handleSignOut}
              disabled={signingOut}
            >
              {signingOut ? 'Signing Out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .profile-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem 1rem 4rem;
        }

        .profile-card {
          background: var(--ifm-background-surface-color);
          border: 1px solid var(--ifm-color-emphasis-200);
          border-radius: 1rem;
          overflow: hidden;
        }

        .profile-header {
          text-align: center;
          padding: 2.5rem 2rem;
          background: linear-gradient(135deg, var(--ifm-color-primary), var(--ifm-color-primary-dark));
          color: white;
        }

        .profile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.75rem;
          margin: 0 auto 1rem;
          border: 3px solid rgba(255, 255, 255, 0.3);
        }

        .profile-name {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.25rem;
          color: white;
        }

        .profile-email {
          opacity: 0.9;
          margin: 0;
          font-size: 0.9375rem;
        }

        .profile-section {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--ifm-color-emphasis-200);
        }

        .profile-section:last-child {
          border-bottom: none;
        }

        .profile-section-title {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 1rem;
          color: var(--ifm-font-color-base);
        }

        .profile-section-description {
          color: var(--ifm-font-color-secondary);
          font-size: 0.875rem;
          margin: 0 0 1rem;
        }

        .profile-info-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .profile-info-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .profile-info-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--ifm-font-color-secondary);
        }

        .profile-info-value {
          font-size: 1rem;
          color: var(--ifm-font-color-base);
        }

        .profile-info-id {
          font-family: monospace;
          font-size: 0.875rem;
          color: var(--ifm-font-color-secondary);
        }

        .profile-links {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .profile-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          background: var(--ifm-color-emphasis-100);
          border-radius: 0.5rem;
          color: var(--ifm-font-color-base);
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s;
        }

        .profile-link:hover {
          background: var(--ifm-color-emphasis-200);
          text-decoration: none;
          color: var(--ifm-color-primary);
        }

        .profile-link svg {
          color: var(--ifm-font-color-secondary);
          flex-shrink: 0;
        }

        .profile-link:hover svg {
          color: var(--ifm-color-primary);
        }

        .profile-section-danger {
          background: rgba(239, 68, 68, 0.05);
        }

        .profile-signout-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .profile-signout-button:hover:not(:disabled) {
          background: #dc2626;
        }

        .profile-signout-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </Layout>
  );
}
