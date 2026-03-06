import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Java & Spring Boot Notes',
  tagline: 'Interview prep & knowledge base for Java backend engineers',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://become-java-springboot-expert-ai.pages.dev',
  baseUrl: '/',

  organizationName: 'dileep-hegde',
  projectName: 'become-java-springboot-expert-ai',

  onBrokenLinks: 'throw',

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/dileep-hegde/become-java-springboot-expert-ai/edit/main/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: false,
          tagsBasePath: 'tags',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    '@docusaurus/theme-mermaid',
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['en'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        indexDocs: true,
        indexBlog: false,
        docsRouteBasePath: '/docs',
      },
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'DevReference',
      logo: {
        alt: 'DevReference Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'siteSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/dileep-hegde/become-java-springboot-expert-ai',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [],
      copyright: `Built with Docusaurus`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['java', 'bash', 'yaml', 'json', 'markup'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
