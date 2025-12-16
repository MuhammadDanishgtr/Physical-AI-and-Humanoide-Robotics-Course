import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { authClient, User } from '../lib/auth/client';

interface ProgressData {
  overallProgress: number;
  currentModule: number;
  currentLesson: string;
  lessonsCompleted: number;
  totalLessons: number;
  streak: number;
  recommendations: string[];
}

interface BackgroundProfile {
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  programmingLanguages: string[];
  hasRoboticsExperience: boolean;
  primaryGoals: string[];
  availableHardware: string[];
  weeklyHoursAvailable: number;
  preferredLanguage: 'en' | 'ur';
}

interface StudySchedule {
  hoursPerWeek: number;
  hoursPerDay: number;
  daysPerWeek: number;
  estimatedCompletionWeeks: number;
  dailyLessons: number;
  weeklyLessons: number;
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
    'Use the Course Assistant chatbot for help',
  ],
};

const defaultModules: ModuleProgress[] = [
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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return '#10b981';
    case 'in_progress':
      return '#fbbf24';
    default:
      return '#d1d5db';
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'in_progress':
      return 'In Progress';
    default:
      return 'Not Started';
  }
}

// Calculate study schedule based on weekly hours
function calculateStudySchedule(weeklyHours: number, totalLessons: number, lessonsCompleted: number): StudySchedule {
  const remainingLessons = totalLessons - lessonsCompleted;
  const hoursPerLesson = 1.5; // Average 1.5 hours per lesson
  const totalHoursNeeded = remainingLessons * hoursPerLesson;

  // Calculate days per week based on hours (assume 1-2 hours per study session)
  let daysPerWeek: number;
  let hoursPerDay: number;

  if (weeklyHours <= 3) {
    daysPerWeek = 2;
    hoursPerDay = weeklyHours / 2;
  } else if (weeklyHours <= 7) {
    daysPerWeek = 3;
    hoursPerDay = weeklyHours / 3;
  } else if (weeklyHours <= 12) {
    daysPerWeek = 4;
    hoursPerDay = weeklyHours / 4;
  } else {
    daysPerWeek = 5;
    hoursPerDay = weeklyHours / 5;
  }

  const lessonsPerWeek = Math.max(1, Math.floor(weeklyHours / hoursPerLesson));
  const lessonsPerDay = Math.max(1, Math.round(lessonsPerWeek / daysPerWeek * 10) / 10);
  const estimatedWeeks = Math.ceil(remainingLessons / lessonsPerWeek);

  return {
    hoursPerWeek: weeklyHours,
    hoursPerDay: Math.round(hoursPerDay * 10) / 10,
    daysPerWeek,
    estimatedCompletionWeeks: estimatedWeeks,
    dailyLessons: lessonsPerDay,
    weeklyLessons: lessonsPerWeek,
  };
}

// Generate personalized recommendations based on profile
function getPersonalizedRecommendations(
  profile: BackgroundProfile | null,
  progress: ProgressData,
  schedule: StudySchedule | null
): string[] {
  const recommendations: string[] = [];

  if (!profile) {
    return [
      'Start with Lesson 1.1 to learn about Physical AI concepts',
      'Set up your development environment in Lesson 1.3',
      'Use the Course Assistant chatbot for help',
    ];
  }

  // Based on experience level
  if (profile.experienceLevel === 'beginner') {
    recommendations.push('Take your time with the fundamentals - they are the foundation for everything else');
  } else if (profile.experienceLevel === 'advanced') {
    recommendations.push('Feel free to skip familiar concepts and focus on advanced integration topics');
  }

  // Based on weekly hours
  if (schedule) {
    if (schedule.hoursPerWeek <= 3) {
      recommendations.push(`With ${schedule.hoursPerWeek} hours/week, focus on one concept at a time for better retention`);
    } else if (schedule.hoursPerWeek >= 10) {
      recommendations.push(`Great commitment! ${schedule.hoursPerWeek} hours/week will help you complete the course in ${schedule.estimatedCompletionWeeks} weeks`);
    } else {
      recommendations.push(`Study ${schedule.daysPerWeek} days/week, about ${schedule.hoursPerDay} hours each session for best results`);
    }
  }

  // Based on goals
  if (profile.primaryGoals.includes('career')) {
    recommendations.push('Focus on hands-on projects to build your portfolio for career opportunities');
  }
  if (profile.primaryGoals.includes('hobby')) {
    recommendations.push('Explore creative projects in Module 4 to bring your hobby ideas to life');
  }

  // Based on hardware
  if (profile.availableHardware.includes('none')) {
    recommendations.push('Check Lesson 1.2 for recommended starter hardware kits');
  } else if (profile.availableHardware.includes('raspberrypi')) {
    recommendations.push('Your Raspberry Pi is perfect for the computer vision lessons in Module 2');
  }

  // Progress-based
  if (progress.lessonsCompleted === 0) {
    recommendations.push('Start with Lesson 1.1 - Introduction to Physical AI');
  } else if (progress.overallProgress > 50) {
    recommendations.push('Great progress! You\'re ready for advanced integration topics');
  }

  return recommendations.slice(0, 4); // Return max 4 recommendations
}

// Dashboard content component that only runs in browser
function DashboardContent(): JSX.Element {
  const [progress, setProgress] = useState<ProgressData>(defaultProgress);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>(defaultModules);
  const [userName, setUserName] = useState('Learner');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [profile, setProfile] = useState<BackgroundProfile | null>(null);
  const [studySchedule, setStudySchedule] = useState<StudySchedule | null>(null);

  useEffect(() => {
    // Check authentication first
    const checkAuth = async () => {
      try {
        const storedUser = authClient.getCurrentUser();
        if (storedUser) {
          setUser(storedUser);
          setUserName(storedUser.name?.split(' ')[0] || 'Learner');

          // Verify session with server
          const session = await authClient.getSession();
          if (session.data?.user) {
            setUser(session.data.user);
            setUserName(session.data.user.name?.split(' ')[0] || 'Learner');
          } else {
            // Session expired, redirect to sign in
            window.location.href = '/signin';
            return;
          }
        } else {
          // Not logged in, redirect to sign in
          window.location.href = '/signin';
          return;
        }
      } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/signin';
        return;
      } finally {
        setAuthChecked(true);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Only load progress after auth is confirmed
    if (!authChecked || !user) return;

    // Load progress from localStorage
    let currentProgress = defaultProgress;
    try {
      const storedProgress = localStorage.getItem('course_progress');
      if (storedProgress) {
        const progressData = JSON.parse(storedProgress);
        currentProgress = { ...currentProgress, ...progressData };
        setProgress(currentProgress);

        if (progressData.completedLessons && Array.isArray(progressData.completedLessons)) {
          const updatedModules = defaultModules.map(module => {
            const moduleNum = module.id.split('-')[1];
            const moduleLessons = progressData.completedLessons.filter(
              (l: string) => l.startsWith(`module-${moduleNum}`)
            );
            const completed = moduleLessons.length;
            return {
              ...module,
              lessonsCompleted: completed,
              progress: Math.round((completed / module.totalLessons) * 100),
              status: completed === module.totalLessons
                ? 'completed' as const
                : completed > 0
                  ? 'in_progress' as const
                  : 'not_started' as const,
            };
          });
          setModuleProgress(updatedModules);
        }
      }
    } catch {
      // Ignore errors
    }

    // Fetch user's background profile from API
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        const response = await fetch('/api/profile/background', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.profile) {
            setProfile(data.profile);

            // Calculate study schedule based on weekly hours
            const schedule = calculateStudySchedule(
              data.profile.weeklyHoursAvailable || 5,
              currentProgress.totalLessons,
              currentProgress.lessonsCompleted
            );
            setStudySchedule(schedule);
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, [authChecked, user]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  // If auth check is done but no user, show nothing (redirect is happening)
  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p>Redirecting to sign in...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          {getGreeting()}, {userName}!
        </h1>
        <p style={{ color: 'var(--ifm-font-color-secondary)' }}>
          Continue your robotics learning journey
        </p>
      </header>

      {/* Progress Overview */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Overall Progress Card */}
          <div style={{
            background: 'var(--ifm-card-background-color)',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Overall Progress</h2>
            <div style={{
              position: 'relative',
              width: '120px',
              height: '120px',
              margin: '0 auto'
            }}>
              <svg width="120" height="120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#e5e7eb"
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
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'block' }}>
                  {progress.overallProgress}%
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--ifm-font-color-secondary)' }}>
                  Complete
                </span>
              </div>
            </div>
            <p style={{ textAlign: 'center', marginTop: '1rem' }}>
              {progress.lessonsCompleted} of {progress.totalLessons} lessons
            </p>
          </div>

          {/* Continue Learning Card */}
          <div style={{
            background: 'var(--ifm-card-background-color)',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Continue Learning</h2>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{
                background: '#fbbf24',
                color: '#000',
                padding: '0.25rem 0.75rem',
                borderRadius: '1rem',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
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
              style={{ width: '100%', textAlign: 'center' }}
            >
              Continue Lesson
            </Link>
          </div>

          {/* Study Schedule Card */}
          <div style={{
            background: 'var(--ifm-card-background-color)',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Your Study Plan</h2>
            {studySchedule ? (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  background: 'var(--ifm-color-primary-lightest)',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>📅</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--ifm-color-primary-darkest)' }}>
                      {studySchedule.hoursPerWeek} hours/week
                    </p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--ifm-color-primary-dark)' }}>
                      {studySchedule.daysPerWeek} days × {studySchedule.hoursPerDay}h each
                    </p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{
                    padding: '0.75rem',
                    background: 'var(--ifm-background-surface-color)',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>
                      {studySchedule.weeklyLessons}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--ifm-font-color-secondary)' }}>
                      lessons/week
                    </p>
                  </div>
                  <div style={{
                    padding: '0.75rem',
                    background: 'var(--ifm-background-surface-color)',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>
                      ~{studySchedule.estimatedCompletionWeeks}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--ifm-font-color-secondary)' }}>
                      weeks to complete
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '2rem' }}>📚</span>
                <p style={{ color: 'var(--ifm-font-color-secondary)', margin: '0.5rem 0' }}>
                  Complete your profile to see your personalized study plan
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Streak Section */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--ifm-color-primary) 0%, var(--ifm-color-primary-dark) 100%)',
          borderRadius: '12px',
          padding: '1.5rem',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '3rem' }}>
              {progress.streak > 0 ? '🔥' : '🎯'}
            </span>
            <div>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                {progress.streak} Day Streak
              </p>
              <p style={{ margin: 0, opacity: 0.9 }}>
                {progress.streak > 0 ? 'Keep up the great work!' : 'Start your streak today!'}
              </p>
            </div>
          </div>
          {studySchedule && (
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>Next session</p>
              <p style={{ margin: 0, fontWeight: 'bold' }}>
                {studySchedule.hoursPerDay}h today
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Module Progress */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Course Progress</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {moduleProgress.map((module) => (
            <div key={module.id} style={{
              background: 'var(--ifm-card-background-color)',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem'
              }}>
                <h3 style={{ fontSize: '1rem', margin: 0 }}>{module.title}</h3>
                <span style={{
                  background: getStatusColor(module.status),
                  color: module.status === 'not_started' ? '#374151' : '#fff',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}>
                  {getStatusText(module.status)}
                </span>
              </div>
              <div style={{
                height: '8px',
                background: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${module.progress}%`,
                  background: 'var(--ifm-color-primary)',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--ifm-font-color-secondary)',
                marginTop: '0.5rem'
              }}>
                {module.lessonsCompleted} of {module.totalLessons} lessons completed
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Recommendations */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Personalized Recommendations</h2>
        <div style={{
          background: 'var(--ifm-card-background-color)',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none' }}>
            {getPersonalizedRecommendations(profile, progress, studySchedule).map((rec, index) => (
              <li key={index} style={{
                marginBottom: '0.75rem',
                padding: '0.75rem 1rem',
                background: 'var(--ifm-background-surface-color)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                <span style={{
                  background: 'var(--ifm-color-primary)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  {index + 1}
                </span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Quick Links */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Quick Links</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          <Link to="/docs/intro" style={{
            textDecoration: 'none',
            background: 'var(--ifm-card-background-color)',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'block'
          }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
              📚 Course Content
            </h3>
            <p style={{ color: 'var(--ifm-font-color-secondary)', margin: 0 }}>
              Browse all lessons and modules
            </p>
          </Link>
          <Link to="/docs/module-1/lesson-1-2-hardware" style={{
            textDecoration: 'none',
            background: 'var(--ifm-card-background-color)',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'block'
          }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
              🔧 Hardware Guide
            </h3>
            <p style={{ color: 'var(--ifm-font-color-secondary)', margin: 0 }}>
              Components and setup instructions
            </p>
          </Link>
          <Link to="/docs/module-2/lesson-2-1-sensors" style={{
            textDecoration: 'none',
            background: 'var(--ifm-card-background-color)',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'block'
          }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
              📡 Sensors Guide
            </h3>
            <p style={{ color: 'var(--ifm-font-color-secondary)', margin: 0 }}>
              Learn about different sensors
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}

// Main Dashboard Page with BrowserOnly wrapper
export default function DashboardPage(): JSX.Element {
  return (
    <Layout title="Dashboard" description="Your learning dashboard">
      <BrowserOnly fallback={
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
          <p>Loading your dashboard...</p>
        </div>
      }>
        {() => <DashboardContent />}
      </BrowserOnly>
    </Layout>
  );
}
