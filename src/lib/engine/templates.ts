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
    language: 'typescript',
    availableVersions: [
      { id: '16.2.4', label: 'Next.js 16 (Latest)', status: 'stable', major: 16 },
      { id: '15.0.0', label: 'Next.js 15', status: 'stable', major: 15 },
      { id: '14.0.0', label: 'Next.js 14', status: 'legacy', major: 14 }
    ],
    defaultStack: {
      version: '16.2.4',
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
          { value: '16.2.4', label: 'Next.js 16 (Latest)' },
          { value: '15.0.0', label: 'Next.js 15' },
          { value: '14.0.0', label: 'Next.js 14' },
        ],
        defaultValue: '16.2.4',
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
    boilerplateFiles: [
      {
        path: 'package.json',
        mergeType: 'package-json',
        content: JSON.stringify({
          name: '{{projectSlug}}',
          version: '0.1.0',
          private: true,
          scripts: {
            "dev": "next dev",
            "build": "next build",
            "start": "next start",
            "lint": "next lint"
          },
          dependencies: {
            "next": "16.2.4",
            "react": "19.2.4",
            "react-dom": "19.2.4"
          },
          devDependencies: {
            "typescript": "^5",
            "@types/node": "^20",
            "@types/react": "^19",
            "@types/react-dom": "^19",
            "postcss": "^8",
            "tailwindcss": "^3.4.1",
            "eslint": "^9",
            "eslint-config-next": "16.2.4"
          }
        })
      },
      {
        path: 'src/app/layout.tsx',
        content: `import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "{{projectName}}",
  description: "Generated by Initra",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* PROVIDER_SLOT */}
        {children}
      </body>
    </html>
  );
}`
      },
      {
        path: 'src/app/page.tsx',
        content: `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">{{projectName}}</h1>
        <p>Generated with Initra — The Agentic Stack</p>
      </div>
    </main>
  );
}`
      },
      {
        path: 'src/app/globals.css',
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
  {{#if brandColors}}
  /* Brand Palette */
  --primary-brand: {{brandColors}};
  {{/if}}
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}`
      },
      {
        path: 'next.config.ts',
        content: `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;`
      },
      {
        path: 'tsconfig.json',
        content: `{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`
      },
      {
        path: 'vitest.config.ts',
        condition: { field: 'testing', value: 'vitest' },
        content: `import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { join } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/__tests__/setup.ts',
  },
  resolve: {
    alias: {
      '@': join(__dirname, './src'),
    },
  },
})`
      },
      {
        path: 'src/__tests__/smoke.test.ts',
        condition: { field: 'testing', value: 'vitest' },
        content: `import { expect, test } from 'vitest'

test('The universe is functioning correctly', () => {
  expect(1 + 1).toBe(2)
})

test('Project name is correct', () => {
  expect("{{projectName}}").toBeDefined()
})`
      },
      {
        path: 'playwright.config.ts',
        condition: { field: 'testing', value: 'playwright' },
        content: `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});`
      },
      {
        path: 'e2e/smoke.spec.ts',
        condition: { field: 'testing', value: 'playwright' },
        content: `import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/{{projectName}}/);
});`
      }
    ]
  },
  {
    slug: 'nuxt',
    name: 'Nuxt 3',
    category: 'web-app',
    icon: '💚',
    description: 'The Intuitive Vue Framework — SSR, automatic routing, and hybrid rendering',
    language: 'typescript',
    availableVersions: [
      { id: '4.4.2', label: 'Nuxt 4 (Stable)', status: 'stable', major: 4 },
      { id: '3.13.0', label: 'Nuxt 3', status: 'stable', major: 3 }
    ],
    defaultStack: {
      version: '4.4.2',
      language: 'typescript',
      styling: 'tailwind',
      database: 'supabase',
      auth: 'supabase-auth',
      stateManagement: 'pinia',
      deployment: 'vercel',
      packageManager: 'npm',
    },
    stackOptions: [
      {
        fieldName: 'version',
        fieldLabel: 'Nuxt Version',
        fieldType: 'select',
        options: [
          { value: '4.4.2', label: 'Nuxt 4 (Stable)' },
          { value: '3.13.0', label: 'Nuxt 3' },
        ],
        defaultValue: '4.4.2',
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
          { value: 'uno-css', label: 'UnoCSS' },
          { value: 'none', label: 'None' },
        ],
        defaultValue: 'tailwind',
        isRequired: false,
        section: 'core',
      },
      {
        fieldName: 'stateManagement',
        fieldLabel: 'State Management',
        fieldType: 'select',
        options: [
          { value: 'pinia', label: 'Pinia (Recommended)' },
          { value: 'vuex', label: 'Legacy Vuex' },
          { value: 'none', label: 'None' },
        ],
        defaultValue: 'pinia',
        isRequired: false,
        section: 'core',
      },
    ],
    boilerplateFiles: [
      {
        path: 'package.json',
        mergeType: 'package-json',
        content: JSON.stringify({
          name: '{{projectSlug}}',
          private: true,
          type: 'module',
          scripts: {
            "build": "nuxt build",
            "dev": "nuxt dev",
            "generate": "nuxt generate",
            "preview": "nuxt preview",
            "postinstall": "nuxt prepare"
          },
          dependencies: {
            "nuxt": "^4.4.2",
            "vue": "latest",
            "vue-router": "latest"
          }
        })
      },
      {
        path: 'nuxt.config.ts',
        content: `// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    // MODULE_SLOT
  ]
})`
      },
      {
        path: 'app.vue',
        content: `<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>`
      },
      {
        path: 'pages/index.vue',
        content: `<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold">{{projectName}}</h1>
    <p class="mt-4">Welcome to your Nuxt 3 application.</p>
  </div>
</template>`
      }
    ]
  },

  // ── Mobile Applications ──────────────────────
  {
    slug: 'react-native',
    name: 'React Native (Expo)',
    category: 'mobile-app',
    icon: '📱',
    description: 'Cross-platform mobile apps with React Native and Expo',
    language: 'typescript',
    availableVersions: [
      { id: '0.85.1', label: 'v0.85 (Stable)', status: 'stable', major: 0 }
    ],
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
    language: 'python',
    availableVersions: [
      { id: '0.136.0', label: 'v0.136 (Stable)', status: 'stable', major: 0 }
    ],
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
  {
    slug: 'django',
    name: 'Django 6',
    category: 'api-backend',
    icon: '🎸',
    description: 'The web framework for perfectionists with deadlines',
    language: 'python',
    availableVersions: [
      { id: '6.0.4', label: 'Django 6 (Stable)', status: 'stable', major: 6 },
      { id: '5.1.0', label: 'Django 5.1', status: 'stable', major: 5 }
    ],
    defaultStack: {
      version: '6.0.4',
      language: 'python',
      database: 'postgresql',
      packageManager: 'poetry',
      auth: 'built-in',
      deployment: 'docker',
      testing: 'pytest',
    },
    stackOptions: [
      {
        fieldName: 'version',
        fieldLabel: 'Django Version',
        fieldType: 'select',
        options: [
          { value: '6.0.4', label: 'Django 6 (Stable)' },
          { value: '5.1.0', label: 'Django 5.1' },
        ],
        defaultValue: '6.0.4',
        isRequired: true,
        section: 'core',
      },
      {
        fieldName: 'packageManager',
        fieldLabel: 'Package Manager',
        fieldType: 'select',
        options: [
          { value: 'poetry', label: 'Poetry (Recommended)' },
          { value: 'pip', label: 'pip / requirements.txt' },
        ],
        defaultValue: 'poetry',
        isRequired: true,
        section: 'core',
      },
    ],
    boilerplateFiles: [
      {
        path: 'pyproject.toml',
        condition: { field: 'packageManager', value: 'poetry' },
        content: `[tool.poetry]
name = "{{projectSlug}}"
version = "0.1.0"
description = ""
authors = ["Initra User"]

[tool.poetry.dependencies]
python = "^3.12"
django = "^6.0.4"

[build-system]
requires = ["poetry-core>=1.0.0"]
build-backend = "poetry.core.masonry.api"`
      },
      {
        path: 'manage.py',
        content: `#!/usr/bin/env python
import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError("Couldn't import Django.") from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()`
      },
      {
        path: 'core/settings.py',
        content: `from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-initra-default-key')
DEBUG = True
ALLOWED_HOSTS = []

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # APP_SLOT
]

ROOT_URLCONF = 'core.urls'
WSGI_APPLICATION = 'core.wsgi.application'`
      },
      {
        path: 'core/urls.py',
        content: `from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.name),
    # ROUTE_SLOT
]`
      }
    ]
  },
  {
    slug: 'go-gin',
    name: 'Go (Gin)',
    category: 'api-backend',
    icon: '🐹',
    description: 'High-performance HTTP web framework in Go',
    language: 'go',
    availableVersions: [
      { id: '1.10.0', label: 'Gin v1.10 (Latest)', status: 'stable', major: 1 }
    ],
    defaultStack: {
      language: 'go',
      database: 'postgresql',
      orm: 'gorm',
      deployment: 'docker',
      testing: 'go-test',
    },
    stackOptions: [
      {
        fieldName: 'orm',
        fieldLabel: 'ORM',
        fieldType: 'select',
        options: [
          { value: 'gorm', label: 'GORM (Recommended)' },
          { value: 'ent', label: 'Ent' },
          { value: 'sqlx', label: 'Sqlx' },
          { value: 'none', label: 'None (database/sql)' },
        ],
        defaultValue: 'gorm',
        isRequired: true,
        section: 'core',
      },
    ],
    boilerplateFiles: [
      {
        path: 'go.mod',
        content: `module {{projectSlug}}

go 1.23

require (
	github.com/gin-gonic/gin v1.10.0
)`
      },
      {
        path: 'cmd/api/main.go',
        content: `package main

import (
	"github.com/gin-gonic/gin"
	"{{projectSlug}}/internal/router"
)

func main() {
	r := gin.Default()
	router.Setup(r)
	r.Run() // listen and serve on 0.0.0.0:8080
}`
      },
      {
        path: 'internal/router/router.go',
        content: `package router

import (
	"github.com/gin-gonic/gin"
)

func Setup(r *gin.Engine) {
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
}`
      }
    ]
  },

  // ── Flutter ─────────────────────────────────
  {
    slug: 'flutter',
    name: 'Flutter',
    category: 'mobile-app',
    icon: '🦋',
    description: 'Google\'s UI toolkit for cross-platform native apps',
    language: 'dart',
    availableVersions: [
      { id: '3.41', label: 'v3.41 (Stable)', status: 'stable', major: 3 }
    ],
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
    language: 'typescript',
    availableVersions: [
      { id: '5.0.0', label: 'v5.0 (Alpha)', status: 'canary', major: 5 },
      { id: '4.21.2', label: 'v4.21 (Stable)', status: 'stable', major: 4 }
    ],
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
    language: 'python',
    availableVersions: [
      { id: '1.0.0', label: 'Custom', status: 'stable', major: 1 }
    ],
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


  // ── MCP Server ──────────────────────────────
  {
    slug: 'mcp-server',
    name: 'MCP Server Starter',
    category: 'extension-plugin',
    icon: '🔌',
    description: 'Model Context Protocol (MCP) server to extend AI agent capabilities with custom tools',
    language: 'typescript',
    availableVersions: [
      { id: '1.0.0', label: 'MCP SDK (TypeScript)', status: 'stable', major: 1 }
    ],
    defaultStack: {
      packageManager: 'npm',
    },
    stackOptions: [],
    boilerplateFiles: [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: "{{projectSlug}}",
          version: "0.1.0",
          description: "MCP Server for custom tools",
          type: "module",
          bin: {
            "mcp-server": "./build/index.js"
          },
          scripts: {
            "build": "tsc",
            "start": "node build/index.js",
            "dev": "tsc --watch"
          },
          dependencies: {
            "@modelcontextprotocol/sdk": "^1.0.3"
          },
          devDependencies: {
            "@types/node": "^20.11.0",
            "typescript": "^5.3.3"
          }
        }, null, 2),
        mergeType: 'package-json'
      },
      {
        path: 'tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {
            target: "ES2022",
            module: "NodeNext",
            moduleResolution: "NodeNext",
            outDir: "./build",
            rootDir: "./src",
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true
          },
          include: ["src/**/*"]
        }, null, 2)
      },
      {
        path: 'src/index.ts',
        content: `#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from "fs";
import path from "path";

/**
 * INITRA — Generated MCP Server
 * Use this to extend your AI agent (Cursor, Claude, etc.) with custom tools.
 */

const server = new Server(
  {
    name: "{{projectName}}",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * 🛠️ Define Tools
 * Agents will see these tools in their interface.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_files",
        description: "Search for files in a directory matching a pattern",
        inputSchema: {
          type: "object",
          properties: {
            directory: { type: "string" },
            pattern: { type: "string" },
          },
          required: ["directory", "pattern"],
        },
      },
    ],
  };
});

/**
 * ⚙️ Tool Handlers
 * Logic for when an agent calls a tool.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "search_files") {
    const { directory, pattern } = args as { directory: string; pattern: string };
    try {
      const files = await fs.readdir(path.resolve(directory));
      const filtered = files.filter(f => f.includes(pattern));
      return {
        content: [{ type: "text", text: JSON.stringify(filtered, null, 2) }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: \`Error: \${error.message}\` }],
        isError: true,
      };
    }
  }

  throw new Error("Tool not found");
});

/**
 * 🚀 Start Server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("{{projectName}} MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
`
      },
      {
        path: 'README.md',
        content: `# 🔌 {{projectName}} — MCP Server

Generated by **Initra**. This is a Model Context Protocol (MCP) server that provides custom tools to your AI agent.

## 🚀 Getting Started

1. **Install Dependencies**:
   \`\`\`bash
   {{packageManager}} install
   \`\`\`

2. **Build the Server**:
   \`\`\`bash
   {{packageManager}} run build
   \`\`\`

3. **Run Locally**:
   \`\`\`bash
   {{packageManager}} start
   \`\`\`

## 🔗 IDE Integration

### Cursor
1. Open Cursor Settings -> Features -> MCP.
2. Click "+ Add New MCP Server".
3. Name: \`{{projectName}}\`
4. Type: \`command\`
5. Command: \`node \${path_to_project}/build/index.js\`

### Claude Desktop
Add to your \`claude_desktop_config.json\`:
\`\`\`json
{
  "mcpServers": {
    "{{projectSlug}}": {
      "command": "node",
      "args": ["\${path_to_project}/build/index.js"]
    }
  }
}
\`\`\`

## 🛠️ Adding Tools
Open \`src/index.ts\` and add new entries to \`ListToolsRequestSchema\` and \`CallToolRequestSchema\`.
`
      }
    ],
    agentInstructions: `## 🏗️ MCP Server Development Rules
You are building an MCP server for {{projectName}}.

1. **Protocol Compliance**: Always follow the Model Context Protocol spec.
2. **Tool Schemas**: Be precise with JSON Schema in ListTools.
3. **Error Handling**: Always wrap handlers in try/catch and return 'isError: true' for protocol errors.
4. **Logging**: Use console.error for logs (stdout is reserved for protocol messages).
5. **Security**: Validate all paths and inputs to prevent directory traversal.`,
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

export const WORKFLOW_OVERLAYS: import('./types').WorkflowOverlay[] = [
  {
    slug: 'security-hardening',
    name: 'Security Audit Protocol',
    description: 'Injects explicit guardrails for secret prevention, input sanitization, and dependency auditing.',
    icon: '🛡️',
    content: `## 🔍 Tactical Workflow: Security Audit
1. **Secret Scanning**: Check every tool call for potential hardcoded API keys or secrets.
2. **Input Validation**: Use Zod/equivalents for all entry points. Ensure all data is coerced and validated.
3. **Parametric Queries**: Never use string concatenation for SQL/NoSQL. Use typed builders.
4. **Auth Guards**: Verify that the current route/action has an explicit metadata-driven check.`,
  },
  {
    slug: 'v0-designer',
    name: 'Tailwind UI Protocol',
    icon: '🎨',
    description: 'Protocol for generating high-fidelity Tailwind components with ARIA accessibility tags.',
    content: `## 🎨 Tactical Workflow: Tailwind UI/UX
1. **Semantic Classes**: Use industry-standard Tailwind patterns. Favor 12-column grids for layouts.
2. **ARIA Injection**: Every interactive element MUST have proper ARIA attributes (roles, labels).
3. **Motion Blocks**: Implement Framer Motion transitions for all page entry/exit points.
4. **Style tokens**: Strictly adhere to the \`globals.css\` token registry for colors and spacing.`,
  },
  {
    slug: 'deep-reasoning',
    name: 'Logic Planning Protocol',
    icon: '🧠',
    description: 'Enforces a strict plan-first architecture for complex structural changes.',
    content: `## 🧠 Tactical Workflow: Logic Planning
1. **Codebase Indexing**: Search for all file references before suggesting a structural change.
2. **Dependency Mapping**: Map out the impact of your change across the component tree.
3. **Chain-of-Thought**: Write a brief technical justification in a log file/comment before execution.
4. **Incremental testing**: Verify each logic block independently before final assembly.`,
  },
  {
    slug: 'performance-opt',
    name: 'Runtime Optimization Protocol',
    icon: '⚡',
    description: 'Strict rules for code splitting, bundle size monitoring, and memoization tactics.',
    content: `## ⚡ Tactical Workflow: Runtime Optimization
1. **Lazy Loading**: Use dynamic imports (\`next/dynamic\`) for all heavy third-party libs.
2. **State Memoization**: Apply \`useMemo\` and \`useCallback\` to prevent unnecessary re-renders in leaf components.
3. **Asset Optimization**: Ensure all local images use responsive sizes and modern formats (WebP).
4. **Bundle Audit**: Analyze the impact of new dependencies on the final JS payload size.`,
  }
];

/** Get an overlay by slug */
export function getOverlay(slug: string) {
  return WORKFLOW_OVERLAYS.find(o => o.slug === slug);
}
