import React, { useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { authClient } from '../lib/auth/client';
import BackgroundQuestionnaire from '../components/BackgroundQuestionnaire';

type SignupStep = 'credentials' | 'questionnaire' | 'complete';

export default function SignUpPage(): JSX.Element {
  const [step, setStep] = useState<SignupStep>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        setError(result.error.message || 'Failed to create account');
        return;
      }

      // Move to questionnaire step
      setStep('questionnaire');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionnaireComplete = () => {
    setStep('complete');
    // Redirect to dashboard after short delay
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 2000);
  };

  const renderCredentialsStep = () => (
    <div className="auth-card">
      <h1 className="auth-card__title">Create Your Account</h1>
      <p className="auth-card__subtitle">
        Join the Physical AI & Humanoid Robotics Course
      </p>

      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleCredentialsSubmit} className="auth-form">
        <div className="auth-form__field">
          <label htmlFor="name" className="auth-form__label">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="auth-form__input"
            placeholder="Enter your full name"
            autoComplete="name"
            required
          />
        </div>

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
            placeholder="Create a password (min. 8 characters)"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        <div className="auth-form__field">
          <label htmlFor="confirmPassword" className="auth-form__label">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="auth-form__input"
            placeholder="Confirm your password"
            autoComplete="new-password"
            required
          />
        </div>

        <button
          type="submit"
          className="auth-form__submit"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Continue'}
        </button>
      </form>

      <p className="auth-link">
        Already have an account?{' '}
        <Link to="/signin">Sign In</Link>
      </p>
    </div>
  );

  const renderQuestionnaireStep = () => (
    <div className="auth-card" style={{ maxWidth: '600px' }}>
      <h1 className="auth-card__title">Tell Us About Yourself</h1>
      <p className="auth-card__subtitle">
        Help us personalize your learning experience
      </p>
      <BackgroundQuestionnaire onComplete={handleQuestionnaireComplete} />
    </div>
  );

  const renderCompleteStep = () => (
    <div className="auth-card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
        <span role="img" aria-label="celebration">🎉</span>
      </div>
      <h1 className="auth-card__title">Welcome to the Course!</h1>
      <p className="auth-card__subtitle">
        Your account has been created successfully.
        Redirecting you to your dashboard...
      </p>
      <div className="progress-bar" style={{ marginTop: '2rem' }}>
        <div
          className="progress-bar__fill"
          style={{ width: '100%', animation: 'progress 2s linear' }}
        />
      </div>
    </div>
  );

  return (
    <Layout title="Sign Up" description="Create your account">
      <div className="auth-container">
        {step === 'credentials' && renderCredentialsStep()}
        {step === 'questionnaire' && renderQuestionnaireStep()}
        {step === 'complete' && renderCompleteStep()}
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
        @keyframes progress {
          from { width: 0; }
          to { width: 100%; }
        }
      `}</style>
    </Layout>
  );
}
