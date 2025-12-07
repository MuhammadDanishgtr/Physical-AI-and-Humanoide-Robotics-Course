import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  courseSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Course Overview',
    },
    {
      type: 'category',
      label: 'Module 1: Foundations (Weeks 1-2)',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'module-1/lesson-1-1-intro',
          label: '1.1 Introduction to Physical AI',
        },
        {
          type: 'doc',
          id: 'module-1/lesson-1-2-hardware',
          label: '1.2 Hardware Fundamentals',
        },
        {
          type: 'doc',
          id: 'module-1/lesson-1-3-setup',
          label: '1.3 Software Environment Setup',
        },
      ],
    },
    {
      type: 'category',
      label: 'Module 2: Sensors (Weeks 3-4)',
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'module-2/lesson-2-1-sensors',
          label: '2.1 Sensor Types and Selection',
        },
        {
          type: 'doc',
          id: 'module-2/lesson-2-2-data',
          label: '2.2 Data Acquisition & Processing',
        },
        {
          type: 'doc',
          id: 'module-2/lesson-2-3-vision',
          label: '2.3 Computer Vision Basics',
        },
      ],
    },
    {
      type: 'category',
      label: 'Module 3: Actuators (Weeks 5-6)',
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'module-3/lesson-3-1-motors',
          label: '3.1 Motors and Servo Control',
        },
        {
          type: 'doc',
          id: 'module-3/lesson-3-2-kinematics',
          label: '3.2 Kinematics Fundamentals',
        },
        {
          type: 'doc',
          id: 'module-3/lesson-3-3-planning',
          label: '3.3 Motion Planning',
        },
      ],
    },
    {
      type: 'category',
      label: 'Module 4: Integration (Weeks 7-8)',
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'module-4/lesson-4-1-integration',
          label: '4.1 System Integration Patterns',
        },
        {
          type: 'doc',
          id: 'module-4/lesson-4-2-capstone',
          label: '4.2 Capstone Project',
        },
        {
          type: 'doc',
          id: 'module-4/lesson-4-3-next-steps',
          label: '4.3 Next Steps & Advanced Topics',
        },
      ],
    },
  ],
};

export default sidebars;
