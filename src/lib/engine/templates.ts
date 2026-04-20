// =============================================
// Initra — Project Templates Registry
// Each template powers the wizard form dynamically
// =============================================

import { ProjectTemplate } from './types';

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  // ── Web Applications ──────────────────────────
  {
    slug: 'nextjs',
    name: 'Next.js',
    category: 'web-app',
    icon: '▲',
    description: 'Full-stack React framework with SSR, API routes, and App Router',
    defaultStack: {
      version: '15',
      language: 'typescript',
      styling: 'tailwind',
      database: 'supabase',
      auth: 'supabase-auth',
      deployment: 'vercel',
      testing: 'vitest',
      stateManagement: 'zustand',
      packageManager: 'npm',
    },
    stackOptions: [
      {
        fieldName: 'version',
        fieldLabel: 'Next.js Version',
        fieldType: 'select',
        options: [
          { value: '15', label: 'Next.js 15 (Latest)' },
          { value: '14', label: 'Next.js 14' },
          { value: '13', label: 'Next.js 13' },
        ],
        defaultValue: '15',
        isRequired: true,
        section: 'core',
      },
      {
        fieldName: 'language',
        fieldLabel: 'Language',
        fieldType: 'select',
        options: [
          { value: 'typescript', label: 'TypeScript' },
          { value: 'javascript', label: 'JavaScript' },
        ],
        defaultValue: 'typescript',
        isRequired: true,
        section: 'core',
      },
      {
        fieldName: 'styling',
        fieldLabel: 'Styling',
        fieldType: 'select',
        options: [
          { value: 'tailwind', label: 'Tailwind CSS' },
          { value: 'css-modules', label: 'CSS Modules' },
          { value: 'vanilla-css', label: 'Vanilla CSS' },
          { value: 'styled-components', label: 'Styled Components' },
          { value: 'sass', label: 'Sass / SCSS' },
        ],
        defaultValue: 'tailwind',
        isRequired: true,
        section: 'core',
      },
      {
        fieldName: 'database',
        fieldLabel: 'Database',
        fieldType: 'select',
        options: [
          { value: 'supabase', label: 'Supabase (PostgreSQL)' },
          { value: 'prisma-postgres', label: 'Prisma + PostgreSQL' },
          { value: 'drizzle-postgres', label: 'Drizzle + PostgreSQL' },
          { value: 'mongodb', label: 'MongoDB' },
          { value: 'none', label: 'None' },
        ],
        defaultValue: 'supabase',
        isRequired: false,
        section: 'core',
      },
      {
        fieldName: 'auth',
        fieldLabel: 'Authentication',
        fieldType: 'select',
        options: [
          { value: 'supabase-auth', label: 'Supabase Auth' },
          { value: 'nextauth', label: 'NextAuth / Auth.js' },
          { value: 'clerk', label: 'Clerk' },
          { value: 'custom', label: 'Custom Auth' },
          { value: 'none', label: 'None' },
        ],
        defaultValue: 'supabase-auth',
        isRequired: false,
        section: 'core',
      },
      {
        fieldName: 'deployment',
        fieldLabel: 'Deployment',
        fieldType: 'select',
        options: [
          { value: 'vercel', label: 'Vercel' },
          { value: 'netlify', label: 'Netlify' },
          { value: 'docker', label: 'Docker' },
          { value: 'aws', label: 'AWS' },
          { value: 'self-hosted', label: 'Self-hosted' },
        ],
        defaultValue: 'vercel',
        isRequired: false,
        section: 'advanced',
      },
      {
        fieldName: 'testing',
        fieldLabel: 'Testing Framework',
        fieldType: 'select',
        options: [
          { value: 'vitest', label: 'Vitest' },
          { value: 'jest', label: 'Jest' },
          { value: 'playwright', label: 'Playwright (E2E)' },
          { value: 'none', label: 'None' },
        ],
        defaultValue: 'vitest',
        isRequired: false,
        section: 'advanced',
      },
      {
        fieldName: 'stateManagement',
        fieldLabel: 'State Management',
        fieldType: 'select',
        options: [
          { value: 'zustand', label: 'Zustand' },
          { value: 'jotai', label: 'Jotai' },
          { value: 'redux', label: 'Redux Toolkit' },
          { value: 'context', label: 'React Context' },
          { value: 'none', label: 'None / Server State' },
        ],
        defaultValue: 'zustand',
        isRequired: false,
        section: 'advanced',
      },
      {
        fieldName: 'packageManager',
        fieldLabel: 'Package Manager',
        fieldType: 'select',
        options: [
          { value: 'npm', label: 'npm' },
          { value: 'pnpm', label: 'pnpm' },
          { value: 'yarn', label: 'yarn' },
          { value: 'bun', label: 'bun' },
        ],
        defaultValue: 'npm',
        isRequired: false,
        section: 'advanced',
      },
    ],
  },

  // ── Mobile Applications ──────────────────────
  {
    slug: 'react-native',
    name: 'React Native (Expo)',
    category: 'mobile-app',
    icon: '📱',
    description: 'Cross-platform mobile apps with React Native and Expo',
    defaultStack: {
      framework: 'expo',
      language: 'typescript',
      navigation: 'expo-router',
      stateManagement: 'zustand',
      database: 'supabase',
      styling: 'nativewind',
      testing: 'jest',
    },
    stackOptions: [
      {
        fieldName: 'framework',
        fieldLabel: 'Framework',
        fieldType: 'select',
        options: [
          { value: 'expo', label: 'Expo (Recommended)' },
          { value: 'bare', label: 'Bare React Native' },
        ],
        defaultValue: 'expo',
        isRequired: true,
        section: 'core',
      },
      {
        fieldName: 'language',
        fieldLabel: 'Language',
        fieldType: 'select',
        options: [
          { value: 'typescript', label: 'TypeScript' },
          { value: 'javascript', label: 'JavaScript' },
        ],
        defaultValue: 'typescript',
        isRequired: true,
        section: 'core',
      },
      {
        fieldName: 'navigation',
        fieldLabel: 'Navigation',
        fieldType: 'select',
        options: [
          { value: 'expo-router', label: 'Expo Router' },
          { value: 'react-navigation', label: 'React Navigation' },
        ],
        defaultValue: 'expo-router',
        isRequired: true,
        section: 'core',
      },
      {
        fieldName: 'stateManagement',
        fieldLabel: 'State Management',
        fieldType: 'select',
        options: [
          { value: 'zustand', label: 'Zustand' },
          { value: 'redux', label: 'Redux Toolkit' },
          { value: 'jotai', label: 'Jotai' },
          { value: 'context', label: 'React Context' },
        ],
        defaultValue: 'zustand',
        isRequired: false,
        section: 'core',
      },
      {
        fieldName: 'database',
        fieldLabel: 'Backend / Database',
        fieldType: 'select',
        options: [
          { value: 'supabase', label: 'Supabase' },
          { value: 'firebase', label: 'Firebase' },
          { value: 'custom-api', label: 'Custom REST API' },
          { value: 'none', label: 'None' },
        ],
        defaultValue: 'supabase',
        isRequired: false,
        section: 'core',
      },
      {
        fieldName: 'styling',
        fieldLabel: 'Styling',
        fieldType: 'select',
        options: [
          { value: 'nativewind', label: 'NativeWind (Tailwind)' },
          { value: 'stylesheet', label: 'StyleSheet API' },
          { value: 'styled-components', label: 'Styled Components' },
        ],
        defaultValue: 'nativewind',
        isRequired: false,
        section: 'advanced',
      },
      {
        fieldName: 'testing',
        fieldLabel: 'Testing',
        fieldType: 'select',
        options: [
          { value: 'jest', label: 'Jest' },
          { value: 'detox', label: 'Detox (E2E)' },
          { value: 'none', label: 'None' },
        ],
        defaultValue: 'jest',
        isRequired: false,
        section: 'advanced',
      },
    ],
  },

  // ── API / Backend ────────────────────────────
  {
    slug: 'fastapi',
    name: 'FastAPI',
    category: 'api-backend',
    icon: '⚡',
    description: 'Modern Python API framework with automatic OpenAPI docs',
    defaultStack: {
      language: 'python',
      database: 'postgresql',
      orm: 'sqlalchemy',
      auth: 'jwt',
      deployment: 'docker',
      testing: 'pytest',
    },
    stackOptions: [
      {
        fieldName: 'database',
        fieldLabel: 'Database',
        fieldType: 'select',
        options: [
          { value: 'postgresql', label: 'PostgreSQL' },
          { value: 'mysql', label: 'MySQL' },
          { value: 'mongodb', label: 'MongoDB' },
          { value: 'sqlite', label: 'SQLite' },
          { value: 'none', label: 'None' },
        ],
        defaultValue: 'postgresql',
        isRequired: false,
        section: 'core',
      },
      {
        fieldName: 'orm',
        fieldLabel: 'ORM / ODM',
        fieldType: 'select',
        options: [
          { value: 'sqlalchemy', label: 'SQLAlchemy' },
          { value: 'tortoise', label: 'Tortoise ORM' },
          { value: 'mongoengine', label: 'MongoEngine' },
          { value: 'raw', label: 'Raw SQL / Queries' },
        ],
        defaultValue: 'sqlalchemy',
        isRequired: false,
        section: 'core',
      },
      {
        fieldName: 'auth',
        fieldLabel: 'Authentication',
        fieldType: 'select',
        options: [
          { value: 'jwt', label: 'JWT (PyJWT)' },
          { value: 'oauth2', label: 'OAuth2' },
          { value: 'session', label: 'Session-based' },
          { value: 'none', label: 'None' },
        ],
        defaultValue: 'jwt',
        isRequired: false,
        section: 'core',
      },
      {
        fieldName: 'deployment',
        fieldLabel: 'Deployment',
        fieldType: 'select',
        options: [
          { value: 'docker', label: 'Docker' },
          { value: 'aws-lambda', label: 'AWS Lambda' },
          { value: 'railway', label: 'Railway' },
          { value: 'self-hosted', label: 'Self-hosted' },
        ],
        defaultValue: 'docker',
        isRequired: false,
        section: 'advanced',
      },
      {
        fieldName: 'testing',
        fieldLabel: 'Testing',
        fieldType: 'select',
        options: [
          { value: 'pytest', label: 'pytest' },
          { value: 'unittest', label: 'unittest' },
          { value: 'none', label: 'None' },
        ],
        defaultValue: 'pytest',
        isRequired: false,
        section: 'advanced',
      },
    ],
  },

  // ── Flutter ─────────────────────────────────
  {
    slug: 'flutter',
    name: 'Flutter',
    category: 'mobile-app',
    icon: '🦋',
    description: 'Google\'s UI toolkit for cross-platform native apps',
    defaultStack: {
      language: 'dart',
      stateManagement: 'riverpod',
      database: 'supabase',
      navigation: 'go-router',
      testing: 'flutter-test',
    },
    stackOptions: [
      {
        fieldName: 'stateManagement',
        fieldLabel: 'State Management',
        fieldType: 'select',
        options: [
          { value: 'riverpod', label: 'Riverpod' },
          { value: 'bloc', label: 'BLoC / Cubit' },
          { value: 'provider', label: 'Provider' },
          { value: 'getx', label: 'GetX' },
        ],
        defaultValue: 'riverpod',
        isRequired: true,
        section: 'core',
      },
      {
        fieldName: 'database',
        fieldLabel: 'Backend',
        fieldType: 'select',
        options: [
          { value: 'supabase', label: 'Supabase' },
          { value: 'firebase', label: 'Firebase' },
          { value: 'appwrite', label: 'Appwrite' },
          { value: 'custom-api', label: 'Custom REST API' },
        ],
        defaultValue: 'supabase',
        isRequired: false,
        section: 'core',
      },
      {
        fieldName: 'navigation',
        fieldLabel: 'Navigation',
        fieldType: 'select',
        options: [
          { value: 'go-router', label: 'go_router' },
          { value: 'auto-route', label: 'AutoRoute' },
          { value: 'navigator-2', label: 'Navigator 2.0' },
        ],
        defaultValue: 'go-router',
        isRequired: false,
        section: 'core',
      },
      {
        fieldName: 'testing',
        fieldLabel: 'Testing',
        fieldType: 'select',
        options: [
          { value: 'flutter-test', label: 'Flutter Test' },
          { value: 'integration', label: 'Integration Tests' },
          { value: 'none', label: 'None' },
        ],
        defaultValue: 'flutter-test',
        isRequired: false,
        section: 'advanced',
      },
    ],
  },

  // ── Express.js ──────────────────────────────
  {
    slug: 'express',
    name: 'Express.js',
    category: 'api-backend',
    icon: '🚀',
    description: 'Minimal Node.js web framework for APIs and web services',
    defaultStack: {
      language: 'typescript',
      database: 'postgresql',
      orm: 'prisma',
      auth: 'jwt',
      deployment: 'docker',
      testing: 'jest',
    },
    stackOptions: [
      {
        fieldName: 'language',
        fieldLabel: 'Language',
        fieldType: 'select',
        options: [
          { value: 'typescript', label: 'TypeScript' },
          { value: 'javascript', label: 'JavaScript' },
        ],
        defaultValue: 'typescript',
        isRequired: true,
        section: 'core',
      },
      {
        fieldName: 'database',
        fieldLabel: 'Database',
        fieldType: 'select',
        options: [
          { value: 'postgresql', label: 'PostgreSQL' },
          { value: 'mongodb', label: 'MongoDB' },
          { value: 'mysql', label: 'MySQL' },
          { value: 'sqlite', label: 'SQLite' },
          { value: 'none', label: 'None' },
        ],
        defaultValue: 'postgresql',
        isRequired: false,
        section: 'core',
      },
      {
        fieldName: 'orm',
        fieldLabel: 'ORM',
        fieldType: 'select',
        options: [
          { value: 'prisma', label: 'Prisma' },
          { value: 'drizzle', label: 'Drizzle' },
          { value: 'typeorm', label: 'TypeORM' },
          { value: 'mongoose', label: 'Mongoose' },
          { value: 'raw', label: 'Raw SQL' },
        ],
        defaultValue: 'prisma',
        isRequired: false,
        section: 'core',
      },
      {
        fieldName: 'auth',
        fieldLabel: 'Authentication',
        fieldType: 'select',
        options: [
          { value: 'jwt', label: 'JWT (jsonwebtoken)' },
          { value: 'passport', label: 'Passport.js' },
          { value: 'session', label: 'Express Sessions' },
          { value: 'none', label: 'None' },
        ],
        defaultValue: 'jwt',
        isRequired: false,
        section: 'core',
      },
      {
        fieldName: 'deployment',
        fieldLabel: 'Deployment',
        fieldType: 'select',
        options: [
          { value: 'docker', label: 'Docker' },
          { value: 'railway', label: 'Railway' },
          { value: 'render', label: 'Render' },
          { value: 'aws', label: 'AWS (ECS/Lambda)' },
        ],
        defaultValue: 'docker',
        isRequired: false,
        section: 'advanced',
      },
      {
        fieldName: 'testing',
        fieldLabel: 'Testing',
        fieldType: 'select',
        options: [
          { value: 'jest', label: 'Jest + Supertest' },
          { value: 'vitest', label: 'Vitest' },
          { value: 'mocha', label: 'Mocha + Chai' },
          { value: 'none', label: 'None' },
        ],
        defaultValue: 'jest',
        isRequired: false,
        section: 'advanced',
      },
    ],
  },

  // ── Python ML ───────────────────────────────
  {
    slug: 'python-ml',
    name: 'Python ML Project',
    category: 'ai-ml',
    icon: '🧠',
    description: 'Machine learning project with Python, standard ML/DL frameworks',
    defaultStack: {
      framework: 'pytorch',
      environment: 'conda',
      tracking: 'wandb',
      deployment: 'docker',
      testing: 'pytest',
      dataProcessing: 'pandas',
    },
    stackOptions: [
      {
        fieldName: 'framework',
        fieldLabel: 'ML Framework',
        fieldType: 'select',
        options: [
          { value: 'pytorch', label: 'PyTorch' },
          { value: 'tensorflow', label: 'TensorFlow / Keras' },
          { value: 'sklearn', label: 'Scikit-learn' },
          { value: 'langchain', label: 'LangChain (RAG/Agents)' },
          { value: 'huggingface', label: 'Hugging Face Transformers' },
        ],
        defaultValue: 'pytorch',
        isRequired: true,
        section: 'core',
      },
      {
        fieldName: 'environment',
        fieldLabel: 'Environment',
        fieldType: 'select',
        options: [
          { value: 'conda', label: 'Conda / Mamba' },
          { value: 'venv', label: 'venv + pip' },
          { value: 'poetry', label: 'Poetry' },
          { value: 'uv', label: 'uv' },
        ],
        defaultValue: 'conda',
        isRequired: true,
        section: 'core',
      },
      {
        fieldName: 'tracking',
        fieldLabel: 'Experiment Tracking',
        fieldType: 'select',
        options: [
          { value: 'wandb', label: 'Weights & Biases' },
          { value: 'mlflow', label: 'MLflow' },
          { value: 'tensorboard', label: 'TensorBoard' },
          { value: 'none', label: 'None' },
        ],
        defaultValue: 'wandb',
        isRequired: false,
        section: 'core',
      },
      {
        fieldName: 'dataProcessing',
        fieldLabel: 'Data Processing',
        fieldType: 'select',
        options: [
          { value: 'pandas', label: 'Pandas' },
          { value: 'polars', label: 'Polars' },
          { value: 'dask', label: 'Dask' },
        ],
        defaultValue: 'pandas',
        isRequired: false,
        section: 'advanced',
      },
      {
        fieldName: 'deployment',
        fieldLabel: 'Deployment',
        fieldType: 'select',
        options: [
          { value: 'docker', label: 'Docker' },
          { value: 'sagemaker', label: 'AWS SageMaker' },
          { value: 'vertex', label: 'Google Vertex AI' },
          { value: 'replicate', label: 'Replicate' },
        ],
        defaultValue: 'docker',
        isRequired: false,
        section: 'advanced',
      },
      {
        fieldName: 'testing',
        fieldLabel: 'Testing',
        fieldType: 'select',
        options: [
          { value: 'pytest', label: 'pytest' },
          { value: 'none', label: 'None' },
        ],
        defaultValue: 'pytest',
        isRequired: false,
        section: 'advanced',
      },
    ],
  },
];

/** Get templates grouped by category */
export function getTemplatesByCategory(): Record<string, ProjectTemplate[]> {
  const groups: Record<string, ProjectTemplate[]> = {};
  for (const template of PROJECT_TEMPLATES) {
    if (!groups[template.category]) {
      groups[template.category] = [];
    }
    groups[template.category].push(template);
  }
  return groups;
}

/** Get a specific template by slug */
export function getTemplate(slug: string): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find((t) => t.slug === slug);
}

/** Category metadata for display */
export const PROJECT_CATEGORIES = [
  { slug: 'web-app', name: 'Web Application', icon: '🌐', description: 'Full-stack web apps with SSR, SPAs, and static sites' },
  { slug: 'mobile-app', name: 'Mobile App', icon: '📱', description: 'Cross-platform and native mobile applications' },
  { slug: 'api-backend', name: 'API / Backend', icon: '🔧', description: 'REST APIs, GraphQL, microservices, and servers' },
  { slug: 'ai-ml', name: 'AI / ML Project', icon: '🤖', description: 'Machine learning, deep learning, and AI agents' },
  { slug: 'game-dev', name: 'Game Development', icon: '🎮', description: 'Unity, Unreal, Godot, and Roblox games' },
  { slug: 'library-package', name: 'Library / Package', icon: '📦', description: 'Open-source libraries, SDKs, and packages' },
  { slug: 'infrastructure', name: 'Infrastructure', icon: '🏗️', description: 'IaC, CI/CD, containers, and cloud setups' },
  { slug: 'extension-plugin', name: 'Extension / Plugin', icon: '🧩', description: 'Browser, IDE, and platform extensions' },
];
