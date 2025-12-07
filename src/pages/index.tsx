import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';

function HeroSection() {
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Physical AI & <br />
            <span className={styles.heroHighlight}>Humanoid Robotics</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Learn robotics hands-on, from beginner to builder. Master sensors,
            actuators, computer vision, and AI integration in 8 weeks.
          </p>
          <div className={styles.heroButtons}>
            <Link
              className="button button--primary button--lg"
              to="/signup"
            >
              Start Learning Free
            </Link>
            <Link
              className="button button--outline button--lg"
              to="/docs/intro"
            >
              Explore Course
            </Link>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>4</span>
              <span className={styles.statLabel}>Modules</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>12</span>
              <span className={styles.statLabel}>Lessons</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>8</span>
              <span className={styles.statLabel}>Weeks</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: '🔧',
      title: 'Hands-On Projects',
      description:
        'Build real robots with practical exercises in every lesson. Learn by doing.',
    },
    {
      icon: '🤖',
      title: 'AI-Powered Assistant',
      description:
        'Get instant help from our RAG chatbot trained on course materials.',
    },
    {
      icon: '🌐',
      title: 'Bilingual Content',
      description:
        'Access lessons in English or Urdu with AI-powered translation.',
    },
    {
      icon: '📊',
      title: 'Track Progress',
      description:
        'Personalized dashboard shows your progress and recommendations.',
    },
    {
      icon: '🎯',
      title: 'Beginner Friendly',
      description:
        'Start with the basics and build up to advanced topics at your pace.',
    },
    {
      icon: '🏆',
      title: 'Capstone Project',
      description:
        'Apply everything you learn in a real robotic system you design.',
    },
  ];

  return (
    <section className={styles.features}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Why Learn With Us?</h2>
        <div className={styles.featuresGrid}>
          {features.map((feature, idx) => (
            <div key={idx} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ModulesSection() {
  const modules = [
    {
      number: 1,
      title: 'Foundations',
      weeks: '1-2',
      lessons: [
        'Introduction to Physical AI',
        'Hardware Fundamentals',
        'Software Environment Setup',
      ],
    },
    {
      number: 2,
      title: 'Sensors',
      weeks: '3-4',
      lessons: [
        'Sensor Types and Selection',
        'Data Acquisition & Processing',
        'Computer Vision Basics',
      ],
    },
    {
      number: 3,
      title: 'Actuators',
      weeks: '5-6',
      lessons: [
        'Motors and Servo Control',
        'Kinematics Fundamentals',
        'Motion Planning',
      ],
    },
    {
      number: 4,
      title: 'Integration',
      weeks: '7-8',
      lessons: [
        'System Integration Patterns',
        'Capstone Project',
        'Next Steps & Advanced Topics',
      ],
    },
  ];

  return (
    <section className={styles.modules}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Course Curriculum</h2>
        <div className={styles.modulesGrid}>
          {modules.map((module) => (
            <div key={module.number} className={styles.moduleCard}>
              <div className={styles.moduleHeader}>
                <span className={styles.moduleNumber}>Module {module.number}</span>
                <span className={styles.moduleWeeks}>Weeks {module.weeks}</span>
              </div>
              <h3 className={styles.moduleTitle}>{module.title}</h3>
              <ul className={styles.moduleLessons}>
                {module.lessons.map((lesson, idx) => (
                  <li key={idx}>{lesson}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className={styles.cta}>
      <div className="container">
        <h2 className={styles.ctaTitle}>Ready to Build Your First Robot?</h2>
        <p className={styles.ctaDescription}>
          Join thousands of learners exploring Physical AI and humanoid robotics.
          Start your journey today.
        </p>
        <div className={styles.ctaButtons}>
          <Link className="button button--primary button--lg" to="/signup">
            Create Free Account
          </Link>
          <Link className="button button--outline button--lg" to="/docs/intro">
            View Course Content
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Learn Physical AI and Humanoid Robotics from beginner to builder"
    >
      <HeroSection />
      <main>
        <FeaturesSection />
        <ModulesSection />
        <CTASection />
      </main>
    </Layout>
  );
}
