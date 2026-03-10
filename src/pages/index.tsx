import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';
import DomainTyper from '../components/DomainTyper/DomainTyper';

const STATS = [
  {value: '34', label: 'Domains Covered'},
  {value: 'Java 8 → 21', label: 'Version Coverage'},
  {value: '100+', label: 'Interview Questions'},
  {value: 'Free', label: 'Always & Forever'},
];

const DOMAINS = [
  {emoji: '☕', title: 'Core Java', desc: 'Variables, types, OOP fundamentals, control flow', to: '/docs/java/core-java/'},
  {emoji: '🧩', title: 'OOP & Design Patterns', desc: 'SOLID, GoF patterns, inheritance, polymorphism', to: '/docs/java/oops/'},
  {emoji: '🍃', title: 'Spring Boot', desc: 'Auto-config, starters, beans, AOP, DI', to: '/docs/spring-boot/'},
  {emoji: '🗄️', title: 'Spring Data & JPA', desc: 'Repositories, transactions, query methods', to: '/docs/spring-data/'},
  {emoji: '🔒', title: 'Spring Security', desc: 'Auth, OAuth2, JWT, filter chains', to: '/docs/spring-security/'},
  {emoji: '⚡', title: 'Multithreading', desc: 'Threads, concurrency, virtual threads (Java 21)', to: '/docs/java/multithreading/'},
  {emoji: '🌊', title: 'Streams & Lambdas', desc: 'Functional programming, method references', to: '/docs/java/functional-programming/'},
  {emoji: '🖥️', title: 'JVM Internals', desc: 'Memory, GC, class loading, JIT compilation', to: '/docs/java/jvm-internals/'},
  {emoji: '🐳', title: 'Docker & Kubernetes', desc: 'Containerization, orchestration, Helm', to: '/docs/docker/'},
  {emoji: '🧪', title: 'Testing', desc: 'JUnit 5, Mockito, Testcontainers', to: '/docs/testing/'},
  {emoji: '🏗️', title: 'System Design', desc: 'Microservices, SOLID, architecture patterns', to: '/docs/system-design/'},
  {emoji: '🎯', title: 'Interview Prep', desc: 'Curated Q&A by domain and difficulty', to: '/docs/interview-prep/'},
];

const PHILOSOPHY = [
  {
    icon: '🧱',
    title: 'First Principles',
    desc: 'Every topic starts with why before how. Understand the problem that motivated a solution before learning to use it.',
  },
  {
    icon: '📈',
    title: 'Progressive Depth',
    desc: 'Each note builds from basics to advanced on the same page — no hunting across separate beginner and advanced docs.',
  },
  {
    icon: '🎯',
    title: 'Interview-Ready',
    desc: 'Every domain includes Q&A at Beginner → Intermediate → Advanced, calibrated for real backend engineering interviews.',
  },
  {
    icon: '🔗',
    title: 'Zettelkasten Links',
    desc: 'Notes cross-link meaningfully. Follow the thread from Spring beans → IoC → DI → testing without losing context.',
  },
];

type CodePart = {text: string; color: string};
type CodeLine = {parts: CodePart[]};

const CODE_SNIPPET: CodeLine[] = [
  {parts: [{text: '@RestController', color: '#4ec9b0'}]},
  {parts: [
    {text: '@RequestMapping', color: '#4ec9b0'},
    {text: '(', color: '#d4d4d4'},
    {text: '"/api"', color: '#ce9178'},
    {text: ')', color: '#d4d4d4'},
  ]},
  {parts: [
    {text: 'public', color: '#569cd6'},
    {text: ' class ', color: '#d4d4d4'},
    {text: 'UserController', color: '#4ec9b0'},
    {text: ' {', color: '#d4d4d4'},
  ]},
  {parts: [{text: '', color: '#d4d4d4'}]},
  {parts: [
    {text: '  ', color: '#d4d4d4'},
    {text: '@Autowired', color: '#4ec9b0'},
  ]},
  {parts: [
    {text: '  private ', color: '#569cd6'},
    {text: 'UserService ', color: '#4ec9b0'},
    {text: 'userService;', color: '#d4d4d4'},
  ]},
  {parts: [{text: '', color: '#d4d4d4'}]},
  {parts: [
    {text: '  ', color: '#d4d4d4'},
    {text: '@GetMapping', color: '#4ec9b0'},
    {text: '(', color: '#d4d4d4'},
    {text: '"/users"', color: '#ce9178'},
    {text: ')', color: '#d4d4d4'},
  ]},
  {parts: [
    {text: '  public ', color: '#569cd6'},
    {text: 'List', color: '#4ec9b0'},
    {text: '<', color: '#d4d4d4'},
    {text: 'User', color: '#4ec9b0'},
    {text: '> ', color: '#d4d4d4'},
    {text: 'getAll', color: '#dcdcaa'},
    {text: '() {', color: '#d4d4d4'},
  ]},
  {parts: [
    {text: '    ', color: '#d4d4d4'},
    {text: '// returns all users', color: '#6a9955'},
  ]},
  {parts: [
    {text: '    return ', color: '#569cd6'},
    {text: 'userService', color: '#d4d4d4'},
    {text: '.', color: '#d4d4d4'},
    {text: 'findAll', color: '#dcdcaa'},
    {text: '();', color: '#d4d4d4'},
  ]},
  {parts: [{text: '  }', color: '#d4d4d4'}]},
  {parts: [{text: '}', color: '#d4d4d4'}]},
];

function CodeWindow(): ReactNode {
  return (
    <div className={styles.codeWindow}>
      <div className={styles.codeWindowBar}>
        <span className={styles.dotRed} />
        <span className={styles.dotYellow} />
        <span className={styles.dotGreen} />
        <span className={styles.codeWindowTab}>UserController.java</span>
      </div>
      <div className={styles.codeBody}>
        {CODE_SNIPPET.map((line, i) => (
          <div key={i} className={styles.codeLine}>
            <span className={styles.lineNum}>{i + 1}</span>
            <span className={styles.lineCode}>
              {line.parts.map((part, j) => (
                <span key={j} style={{color: part.color}}>{part.text}</span>
              ))}
              {i === CODE_SNIPPET.length - 1 && <span className={styles.cursor} />}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroSection(): ReactNode {
  return (
    <section className={styles.hero}>
      <div className={styles.heroBackground}>
        <div className={styles.heroGlow} />
        <div className={styles.heroGrid} />
      </div>
      <div className={clsx('container', styles.heroContent)}>
        <div className={styles.heroLeft}>
          <span className={styles.heroBadge}>
            <span className={styles.badgeDot} />
            Java · Spring · Cloud
          </span>
          <Heading as="h1" className={styles.heroTitle}>
            Master <span className={styles.heroAccent}>Java Backend</span>{' '}
            Engineering
          </Heading>
          <p className={styles.heroSubtitle}>
            A structured, interview-ready knowledge base for Java backend engineers.
            Built from first principles — core Java to cloud-native Spring Boot.
          </p>
          <div className={styles.heroButtons}>
            <Link className={clsx('button button--lg', styles.btnPrimary)} to="/docs/overviews/">
              Start Learning →
            </Link>
            <Link className={clsx('button button--lg', styles.btnGhost)} to="/docs/interview-prep/">
              Interview Prep
            </Link>
          </div>
        </div>
        <div className={styles.heroRight}>
          <CodeWindow />
        </div>
      </div>
    </section>
  );
}

function StatsBar(): ReactNode {
  return (
    <section className={styles.statsBar}>
      <div className="container">
        <div className={styles.statsGrid}>
          {STATS.map(({value, label}) => (
            <div key={label} className={styles.statItem}>
              <span className={styles.statValue}>{value}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DomainCard({emoji, title, desc, to}: {emoji: string; title: string; desc: string; to: string}): ReactNode {
  return (
    <Link to={to} className={styles.domainCard}>
      <span className={styles.domainEmoji}>{emoji}</span>
      <h3 className={styles.domainTitle}>{title}</h3>
      <p className={styles.domainDesc}>{desc}</p>
      <span className={styles.domainArrow}>→</span>
    </Link>
  );
}

function DomainsSection(): ReactNode {
  return (
    <section className={styles.domainsSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>What&apos;s Inside</Heading>
          <p className={styles.sectionSubtitle}>34 domains covering the full Java backend engineering stack</p>
        </div>
        <div className={styles.domainsGrid}>
          <div className={styles.domainTyperRow}>
            <DomainTyper domains={DOMAINS} />
          </div>
        </div>
        <div className={styles.browseAll}>
          <Link className={clsx('button button--lg', styles.btnOutline)} to="/docs/overviews/">
            Browse All 34 Domains →
          </Link>
        </div>
      </div>
    </section>
  );
}

function PhilosophySection(): ReactNode {
  return (
    <section className={styles.philosophySection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>How This Knowledge Base Works</Heading>
          <p className={styles.sectionSubtitle}>
            Designed to build deep, durable understanding — not just pass interviews
          </p>
        </div>
        <div className={styles.philosophyGrid}>
          {PHILOSOPHY.map(({icon, title, desc}) => (
            <div key={title} className={styles.philosophyItem}>
              <span className={styles.philosophyIcon}>{icon}</span>
              <h3 className={styles.philosophyTitle}>{title}</h3>
              <p className={styles.philosophyDesc}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Interview prep & knowledge base for Java backend engineers">
      <HeroSection />
      <StatsBar />
      <DomainsSection />
      <PhilosophySection />
    </Layout>
  );
}
