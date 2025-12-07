import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

interface ProgressData {
  overallProgress: number;
  currentModule: number;
  currentLesson: string;
  lessonsCompleted: number;
  totalLessons: number;
  streak: number;
  recommendations: string[];
}

interface ModuleProgress {
  id: string;
  title: string;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

const defaultProgress: ProgressData = {
  overallProgress: 0,
  currentModule: 1,
  currentLesson: 'module-1/lesson-1-1-intro',
  lessonsCompleted: 0,
  totalLessons: 12,
  streak: 0,
  recommendations: [
    'Start with Lesson 1.1 to learn about Physical AI concepts',
    'Set up your development environment in Lesson 1.3',
    'Join our Discord community for support',
  ],
};

const modules: ModuleProgress[] = [
  {
    id: 'module-1',
    title: 'Module 1: Foundations',
    progress: 0,
    lessonsCompleted: 0,
    totalLessons: 3,
    status: 'not_started',
  },
  {
    id: 'module-2',
    title: 'Module 2: Sensors',
    progress: 0,
    lessonsCompleted: 0,
    totalLessons: 3,
    status: 'not_started',
  },
  {
    id: 'module-3',
    title: 'Module 3: Actuators',
    progress: 0,
    lessonsCompleted: 0,
    totalLessons: 3,
    status: 'not_started',
  },
  {
    id: 'module-4',
    title: 'Module 4: Integration',
    progress: 0,
    lessonsCompleted: 0,
    totalLessons: 3,
    status: 'not_started',
  },
];

export default function DashboardPage(): JSX.Element {
  const [progress, setProgress] = useState<ProgressData>(defaultProgress);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>(modules);
  const [userName, setUserName] = useState('Learner');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data and progress
    async function fetchData() {
      try {
        const [userRes, progressRes] = await Promise.all([
          fetch('/api/auth/session'),
          fetch('/api/progress'),
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.user?.name) {
            setUserName(userData.user.name.split(' ')[0]);
          }
        }

        if (progressRes.ok) {
          const progressData = await progressRes.json();
          setProgress(progressData);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'var(--progress-completed)';
      case 'in_progress':
        return 'var(--progress-in-progress)';
      default:
        return 'var(--progress-not-started)';
    }
  };

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="dashboard-container" style={{ textAlign: 'center', padding: '4rem' }}>
          <p>Loading your dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard" description="Your learning dashboard">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1 className="dashboard-header__greeting">
            {getGreeting()}, {userName}!
          </h1>
          <p className="dashboard-header__subtitle">
            Continue your robotics learning journey
          </p>
        </header>

        {/* Progress Overview */}
        <section className="dashboard-section">
          <div className="dashboard-grid">
            {/* Overall Progress Card */}
            <div className="dashboard-card">
              <h2 className="dashboard-card__title">Overall Progress</h2>
              <div className="progress-circle-container">
                <svg className="progress-circle" width="120" height="120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="var(--progress-not-started)"
                    strokeWidth="12"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="var(--ifm-color-primary)"
                    strokeWidth="12"
                    strokeDasharray={`${progress.overallProgress * 3.39} 339`}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="progress-circle-text">
                  <span className="progress-circle-value">{progress.overallProgress}%</span>
                  <span className="progress-circle-label">Complete</span>
                </div>
              </div>
              <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                {progress.lessonsCompleted} of {progress.totalLessons} lessons
              </p>
            </div>

            {/* Current Progress Card */}
            <div className="dashboard-card">
              <h2 className="dashboard-card__title">Continue Learning</h2>
              <div style={{ marginBottom: '1rem' }}>
                <span className="progress-badge progress-badge--in-progress">
                  In Progress
                </span>
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>Module {progress.currentModule}</h3>
              <p style={{ color: 'var(--ifm-font-color-secondary)', marginBottom: '1rem' }}>
                Pick up where you left off
              </p>
              <Link
                to={`/docs/${progress.currentLesson}`}
                className="button button--primary"
                style={{ width: '100%' }}
              >
                Continue Lesson
              </Link>
            </div>

            {/* Streak Card */}
            <div className="dashboard-card">
              <h2 className="dashboard-card__title">Learning Streak</h2>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '3rem' }}>
                  {progress.streak > 0 ? (
                    <span role="img" aria-label="fire">🔥</span>
                  ) : (
                    <span role="img" aria-label="target">🎯</span>
                  )}
                </span>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
                  {progress.streak} days
                </p>
                <p style={{ color: 'var(--ifm-font-color-secondary)' }}>
                  {progress.streak > 0
                    ? 'Keep up the great work!'
                    : 'Start learning today!'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Module Progress */}
        <section className="dashboard-section">
          <h2 style={{ marginBottom: '1rem' }}>Course Progress</h2>
          <div className="dashboard-grid">
            {moduleProgress.map((module) => (
              <div key={module.id} className="dashboard-card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.75rem',
                  }}
                >
                  <h3 className="dashboard-card__title" style={{ marginBottom: 0 }}>
                    {module.title}
                  </h3>
                  <span
                    className="progress-badge"
                    style={{ backgroundColor: getStatusColor(module.status) }}
                  >
                    {module.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar__fill"
                    style={{ width: `${module.progress}%` }}
                  />
                </div>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--ifm-font-color-secondary)',
                    marginTop: '0.5rem',
                  }}
                >
                  {module.lessonsCompleted} of {module.totalLessons} lessons completed
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Recommendations */}
        <section className="dashboard-section">
          <h2 style={{ marginBottom: '1rem' }}>Personalized Recommendations</h2>
          <div className="dashboard-card">
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              {progress.recommendations.map((rec, index) => (
                <li
                  key={index}
                  style={{
                    marginBottom: '0.75rem',
                    color: 'var(--ifm-font-color-base)',
                  }}
                >
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Quick Links */}
        <section className="dashboard-section">
          <h2 style={{ marginBottom: '1rem' }}>Quick Links</h2>
          <div className="dashboard-grid">
            <Link to="/docs/intro" className="dashboard-card" style={{ textDecoration: 'none' }}>
              <h3 className="dashboard-card__title">
                <span role="img" aria-label="book">📚</span> Course Content
              </h3>
              <p>Browse all lessons and modules</p>
            </Link>
            <Link to="/docs/module-1/lesson-1-2-hardware" className="dashboard-card" style={{ textDecoration: 'none' }}>
              <h3 className="dashboard-card__title">
                <span role="img" aria-label="tools">🔧</span> Hardware Guide
              </h3>
              <p>Components and setup instructions</p>
            </Link>
            <a href="https://discord.gg/robotics-course" className="dashboard-card" style={{ textDecoration: 'none' }}>
              <h3 className="dashboard-card__title">
                <span role="img" aria-label="chat">💬</span> Community
              </h3>
              <p>Get help on Discord</p>
            </a>
          </div>
        </section>
      </div>

      <style>{`
        .dashboard-section {
          margin-bottom: 2rem;
        }
        .progress-circle-container {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 0 auto;
        }
        .progress-circle-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }
        .progress-circle-value {
          display: block;
          font-size: 1.5rem;
          font-weight: bold;
        }
        .progress-circle-label {
          font-size: 0.75rem;
          color: var(--ifm-font-color-secondary);
        }
      `}</style>
    </Layout>
  );
}
