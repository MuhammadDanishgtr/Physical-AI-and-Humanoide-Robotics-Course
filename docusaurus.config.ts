import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Physical AI & Humanoid Robotics Course',
  tagline: 'Learn robotics hands-on, from beginner to builder',
  favicon: 'img/favicon.ico',

  url: 'https://robotics-course.vercel.app',
  baseUrl: '/',

  organizationName: 'robotics-course',
  projectName: 'physical-ai-robotics',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
    localeConfigs: {
      en: {
        label: 'English',
        direction: 'ltr',
      },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/robotics-course/physical-ai-robotics/tree/main/',
          showLastUpdateTime: false,
          showLastUpdateAuthor: false,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.jpg',
    navbar: {
      title: 'Physical AI & Robotics',
      logo: {
        alt: 'Physical AI & Robotics Course Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'courseSidebar',
          position: 'left',
          label: 'Course Content',
        },
        {
          to: '/dashboard',
          label: 'Dashboard',
          position: 'left',
        },
        {
          to: '/signin',
          label: 'Sign In',
          position: 'right',
          className: 'navbar-signin-link',
        },
        {
          to: '/signup',
          label: 'Sign Up',
          position: 'right',
          className: 'navbar-signup-link button button--primary',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Course',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/intro',
            },
            {
              label: 'Module 1: Foundations',
              to: '/docs/module-1/lesson-1-1-intro',
            },
            {
              label: 'Module 2: Sensors',
              to: '/docs/module-2/lesson-2-1-sensors',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Hardware Guide',
              to: '/docs/module-1/lesson-1-2-hardware',
            },
            {
              label: 'Development Environment',
              to: '/docs/module-1/lesson-1-3-setup',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/robotics-course/physical-ai-robotics',
            },
            {
              label: 'Discord',
              href: 'https://discord.gg/robotics-course',
            },
          ],
        },
        {
          title: 'Account',
          items: [
            {
              label: 'Sign In',
              to: '/signin',
            },
            {
              label: 'Dashboard',
              to: '/dashboard',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Physical AI & Humanoid Robotics Course. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['python', 'cpp', 'arduino', 'bash', 'json'],
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: false,
      },
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
  } satisfies Preset.ThemeConfig,

  plugins: [],

  themes: [
    // Temporarily disabled for build - search plugin causing issues
    // [
    //   require.resolve('@easyops-cn/docusaurus-search-local'),
    //   {
    //     hashed: true,
    //     language: ['en'],
    //     highlightSearchTermsOnTargetPage: true,
    //     explicitSearchResultPath: true,
    //     docsRouteBasePath: '/docs',
    //     indexBlog: false,
    //   },
    // ],
  ],
};

export default config;
