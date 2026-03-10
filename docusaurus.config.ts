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

  plugins: [
    [
      '@docusaurus/plugin-pwa',
      {
        debug: false,
        offlineModeActivationStrategies: ['appInstalled', 'standalone', 'queryString'],
        pwaHead: [
          { tagName: 'link', rel: 'icon', href: '/img/favicon.ico' },
          { tagName: 'link', rel: 'manifest', href: '/manifest.json' },
          { tagName: 'meta', name: 'theme-color', content: '#ffffff' },
        ],
      },
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
    docs: {    
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,        
      },
    },        
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      hideOnScroll: true,      
      title: 'DevReference',
      logo: {
        alt: 'DevReference Logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo-dark.svg',
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
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ['java', 'bash', 'yaml', 'json', 'markup', 'sql', 'docker'],
    },
    mermaid: {
      theme: { light: 'default', dark: 'dark' },
      options: {
        fontFamily: 'var(--ifm-font-family-base)',
        fontSize: 14,
      },
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
