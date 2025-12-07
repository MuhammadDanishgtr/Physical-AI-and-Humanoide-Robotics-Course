import React, { useState, useEffect, useRef } from 'react';
import Link from '@docusaurus/Link';
import { authClient, User } from '../../lib/auth/client';
import styles from './styles.module.css';

export default function UserMenu(): JSX.Element | null {
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for logged in user
    const checkUser = async () => {
      try {
        const storedUser = authClient.getCurrentUser();
        if (storedUser) {
          setUser(storedUser);
          // Verify session is still valid
          const session = await authClient.getSession();
          if (session.data?.user) {
            setUser(session.data.user);
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error checking user session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut();
    setUser(null);
    setIsOpen(false);
    window.location.href = '/';
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return null;
  }

  // If no user, show sign in/sign up buttons
  if (!user) {
    return (
      <div className={styles.authButtons}>
        <Link to="/signin" className={styles.signInLink}>
          Sign In
        </Link>
        <Link to="/signup" className={`${styles.signUpButton} button button--primary`}>
          Sign Up
        </Link>
      </div>
    );
  }

  // User is logged in - show profile menu
  return (
    <div className={styles.userMenu} ref={menuRef}>
      <button
        className={styles.avatarButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className={styles.avatar}>{getInitials(user.name)}</div>
        <span className={styles.userName}>{user.name.split(' ')[0]}</span>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
        >
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <div className={styles.dropdownAvatar}>{getInitials(user.name)}</div>
            <div className={styles.dropdownInfo}>
              <span className={styles.dropdownName}>{user.name}</span>
              <span className={styles.dropdownEmail}>{user.email}</span>
            </div>
          </div>
          <div className={styles.dropdownDivider} />
          <Link to="/profile" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            My Profile
          </Link>
          <Link to="/dashboard" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Dashboard
          </Link>
          <div className={styles.dropdownDivider} />
          <button className={styles.dropdownItem} onClick={handleSignOut}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
