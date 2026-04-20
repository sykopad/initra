// =============================================
// Initra — Framework Knowledge Base
// Rich, opinionated content blocks per framework
// Injected into IDE templates based on templateSlug
// =============================================

import { TemplateVariables } from './types';

export interface FrameworkKnowledge {
  /** File/directory tree showing idiomatic project structure */
  fileStructure: string;
  /** Critical anti-patterns to avoid (framework-specific pitfalls) */
  antiPatterns: string[];
  /** Preferred code patterns with snippets */
  codePatterns: string;
  /** Framework-specific conventions */
  conventions: string[];
  /** Database-specific patterns (if applicable) */
  databasePatterns?: string;
  /** Styling-specific rules (if applicable) */
  stylingPatterns?: string;
  /** Extra rules based on the stack config */
  getStackSpecificRules?: (vars: TemplateVariables) => string;
}

// ── Next.js ─────────────────────────────────────

const NEXTJS_KNOWLEDGE: FrameworkKnowledge = {
  fileStructure: `\`\`\`
src/
├── app/
│   ├── layout.tsx          # Root layout (required)
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles
│   ├── loading.tsx         # Loading UI (Suspense boundary)
│   ├── error.tsx           # Error boundary (must be client component)
│   ├── not-found.tsx       # 404 page
│   ├── (auth)/             # Route group (no URL segment)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx      # Nested layout
│   │   ├── page.tsx
│   │   └── settings/page.tsx
│   └── api/
│       └── [resource]/route.ts  # API route handler
├── components/
│   ├── ui/                 # Reusable UI primitives
│   └── features/           # Feature-specific components
├── lib/
│   ├── utils.ts            # Shared utilities
│   ├── constants.ts        # App-wide constants
│   └── [service].ts        # Service modules (db, auth, etc.)
├── hooks/                  # Custom React hooks
└── types/                  # TypeScript type definitions
\`\`\``,

  antiPatterns: [
    'NEVER use `getServerSideProps`, `getStaticProps`, or `getInitialProps` — these are Pages Router APIs. Use Server Components and `generateStaticParams` instead.',
    'NEVER use `useEffect` for data fetching in components that can be Server Components. Fetch data directly in the component body or use Server Actions.',
    'NEVER import `"use client"` components into Server Component render without a clear boundary. Understand the component tree split.',
    'NEVER use `router.push()` for navigation that could be an `<Link>` component — Links enable prefetching.',
    'NEVER put sensitive environment variables without the `NEXT_PUBLIC_` prefix in client code — they will be undefined.',
    'NEVER use `fetch()` with `no-store` as a default — Next.js caches by default; only opt out when needed.',
    'NEVER create API routes for operations that can be Server Actions — use `"use server"` functions instead.',
    'NEVER use `React.lazy()` — use `next/dynamic` for dynamic imports with SSR control.',
  ],

  codePatterns: `### Server Component (default — no directive needed)
\`\`\`tsx
// app/dashboard/page.tsx — Server Component by default
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase.from('projects').select('*');

  return (
    <main>
      <h1>Dashboard</h1>
      {projects?.map(p => <ProjectCard key={p.id} project={p} />)}
    </main>
  );
}
\`\`\`

### Client Component (interactive)
\`\`\`tsx
"use client";
// Only use "use client" when you need: useState, useEffect, event handlers, browser APIs

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;
}
\`\`\`

### Server Action
\`\`\`tsx
"use server";
// app/actions.ts — Server-side mutations
import { revalidatePath } from 'next/cache';

export async function createProject(formData: FormData) {
  const name = formData.get('name') as string;
  // Insert into DB...
  revalidatePath('/dashboard');
}
\`\`\`

### API Route Handler
\`\`\`ts
// app/api/projects/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '10';
  // Fetch data...
  return NextResponse.json({ data }, { status: 200 });
}

export async function POST(request: Request) {
  const body = await request.json();
  // Validate and insert...
  return NextResponse.json({ created: true }, { status: 201 });
}
\`\`\``,

  conventions: [
    'All pages in `app/` are Server Components by default — only add `"use client"` when needed.',
    'Use `next/image` for all images — never raw `<img>` tags.',
    'Use `next/link` for all internal navigation — never `<a>` tags for internal links.',
    'Use `next/font` for font loading — never external `<link>` tags for Google Fonts.',
    'Use Metadata API (`export const metadata`) for SEO — never manual `<head>` tags.',
    'Use route groups `(groupName)` for organization without affecting URL structure.',
    'Use `loading.tsx` for Suspense boundaries — one per route segment.',
    'Use `error.tsx` for error boundaries — must be a client component.',
    'Colocate related files: page.tsx, loading.tsx, error.tsx in the same directory.',
  ],

  getStackSpecificRules: (vars) => {
    const rules: string[] = [];

    // Supabase-specific
    if (vars.database === 'supabase') {
      rules.push(`### Supabase Patterns
- Use \`@supabase/ssr\` for both browser and server clients.
- Server components: use \`createServerClient\` with cookie handling.
- Client components: use \`createBrowserClient\`.
- Always enable RLS on every table — never rely on application-level auth alone.
- Use \`extensions.uuid_generate_v4()\` for UUIDs (Supabase extension schema).
- Run \`npx supabase db push\` to apply migrations.`);
    }

    // Prisma-specific
    if (vars.database === 'prisma-postgres' || vars.orm === 'prisma') {
      rules.push(`### Prisma Patterns
- Keep a single \`PrismaClient\` instance in \`lib/prisma.ts\` (prevent connection exhaustion).
- Use \`prisma.$transaction()\` for multi-step operations.
- Run \`npx prisma db push\` for development, \`npx prisma migrate deploy\` for production.
- Generate types after schema changes: \`npx prisma generate\`.`);
    }

    // Drizzle-specific
    if (vars.database === 'drizzle-postgres' || vars.orm === 'drizzle') {
      rules.push(`### Drizzle Patterns
- Define schema in \`src/db/schema.ts\` using Drizzle table builders.
- Use \`drizzle-kit push\` for development, \`drizzle-kit migrate\` for production.
- Prefer Drizzle's type-safe query builder over raw SQL.`);
    }

    // Tailwind-specific
    if (vars.styling === 'tailwind') {
      rules.push(`### Tailwind CSS Patterns
- Use utility classes directly — avoid \`@apply\` except in base component styles.
- Extract repeated patterns into components, NOT into custom CSS classes.
- Use \`cn()\` utility (clsx + tailwind-merge) for conditional class names.
- Keep \`tailwind.config.ts\` for theme extensions only — avoid overriding defaults.`);
    }

    // CSS Modules-specific
    if (vars.styling === 'css-modules') {
      rules.push(`### CSS Modules Patterns
- Name files \`Component.module.css\` — colocated with components.
- Import as \`import styles from './Component.module.css'\`.
- Use \`composes\` for style composition, not \`@extend\`.`);
    }

    // Zustand-specific
    if (vars.stateManagement === 'zustand') {
      rules.push(`### Zustand State Management
- One store per domain/feature — avoid a single monolithic store.
- Use selectors to prevent unnecessary re-renders: \`const count = useStore(s => s.count)\`.
- Use \`immer\` middleware for complex nested state updates.
- Keep stores in \`src/stores/\` directory.`);
    }

    // Testing-specific
    if (vars.testing === 'vitest') {
      rules.push(`### Vitest Testing
- Colocate tests: \`Component.tsx\` → \`Component.test.tsx\`.
- Use \`@testing-library/react\` for component tests.
- Mock external services, never real API calls in tests.
- Aim for behavior testing, not implementation testing.`);
    }

    if (vars.testing === 'playwright') {
      rules.push(`### Playwright E2E Testing
- Keep E2E tests in \`e2e/\` directory.
- Use Page Object Model pattern for reusable page interactions.
- Run \`npx playwright test\` — tests run in real browsers.`);
    }

    return rules.join('\n\n');
  },
};

// ── React Native (Expo) ─────────────────────────

const REACT_NATIVE_KNOWLEDGE: FrameworkKnowledge = {
  fileStructure: `\`\`\`
app/
├── (tabs)/
│   ├── _layout.tsx         # Tab navigator layout
│   ├── index.tsx            # Home tab
│   ├── explore.tsx          # Explore tab
│   └── profile.tsx          # Profile tab
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   └── register.tsx
├── _layout.tsx              # Root layout with providers
├── +not-found.tsx           # 404 screen
└── [id].tsx                 # Dynamic route
components/
├── ui/                      # Design system primitives
├── forms/                   # Form components
└── navigation/              # Navigation components
lib/
├── api.ts                   # API client
├── storage.ts               # AsyncStorage helpers
└── constants.ts             # App config
hooks/                       # Custom hooks
assets/                      # Images, fonts, etc.
\`\`\``,

  antiPatterns: [
    'NEVER use `<div>`, `<span>`, `<p>` — use `<View>`, `<Text>`, `<Pressable>` from React Native.',
    'NEVER use CSS — use `StyleSheet.create()` or NativeWind for styling.',
    'NEVER use `window`, `document`, or other browser APIs — they do not exist in React Native.',
    'NEVER use `onClick` — use `onPress` for touch handlers.',
    'NEVER store sensitive data in AsyncStorage — use `expo-secure-store`.',
    'NEVER use inline styles in lists — always use `StyleSheet.create()` for performance.',
    'NEVER block the JS thread with heavy computation — use `InteractionManager` or workers.',
  ],

  codePatterns: `### Screen Component
\`\`\`tsx
// app/(tabs)/index.tsx
import { View, Text, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';

export default function HomeScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: () => api.getPosts(),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
      />
    </View>
  );
}
\`\`\`

### Navigation (Expo Router)
\`\`\`tsx
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{
        title: 'Home',
        tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
      }} />
    </Tabs>
  );
}
\`\`\``,

  conventions: [
    'Use Expo Router (file-based routing) — organize screens in `app/` directory.',
    'Use `<FlatList>` or `<FlashList>` for lists — never `.map()` inside `<ScrollView>`.',
    'Use `expo-image` for optimized image loading — avoid raw `<Image>` for network images.',
    'Use `expo-haptics` for tactile feedback on user actions.',
    'Test on both iOS and Android — behavior differs between platforms.',
    'Use `Platform.select()` or `Platform.OS` for platform-specific code.',
    'Keep navigation state minimal — avoid deeply nested navigators.',
  ],

  getStackSpecificRules: (vars) => {
    const rules: string[] = [];
    if (vars.styling === 'nativewind') {
      rules.push(`### NativeWind (Tailwind for RN)
- Use \`className\` prop for styling (NativeWind transforms to StyleSheet).
- Configure in \`tailwind.config.js\` — same as web Tailwind.
- Use \`dark:\` prefix for dark mode styles.`);
    }
    if (vars.database === 'supabase') {
      rules.push(`### Supabase + React Native
- Use \`@supabase/supabase-js\` with \`expo-secure-store\` for auth token storage.
- Initialize client: \`createClient(url, anonKey, { auth: { storage: ExpoSecureStore } })\`.
- Use Supabase Realtime for live updates.`);
    }
    return rules.join('\n\n');
  },
};

// ── FastAPI ─────────────────────────────────────

const FASTAPI_KNOWLEDGE: FrameworkKnowledge = {
  fileStructure: `\`\`\`
app/
├── main.py                 # FastAPI app entry + lifespan
├── config.py               # Settings via pydantic-settings
├── database.py             # DB engine, session, Base
├── dependencies.py         # Dependency injection (get_db, get_current_user)
├── models/                 # SQLAlchemy / ORM models
│   ├── __init__.py
│   └── user.py
├── schemas/                # Pydantic request/response schemas
│   ├── __init__.py
│   └── user.py
├── routers/                # API route modules
│   ├── __init__.py
│   ├── auth.py
│   └── users.py
├── services/               # Business logic layer
│   └── user_service.py
├── middleware/              # Custom middleware
├── utils/                  # Helpers and utilities
tests/
├── conftest.py             # Shared fixtures
├── test_auth.py
└── test_users.py
alembic/                    # Database migrations
├── versions/
└── env.py
\`\`\``,

  antiPatterns: [
    'NEVER define business logic inside route handlers — extract to service modules.',
    'NEVER use synchronous database calls in async endpoints — use `async` drivers or run_in_executor.',
    'NEVER hardcode configuration — use `pydantic-settings` with environment variables.',
    'NEVER return raw SQLAlchemy models — always convert to Pydantic schemas (response_model).',
    'NEVER skip input validation — always use Pydantic models for request bodies.',
    'NEVER catch broad `Exception` — catch specific exceptions and use FastAPI error handlers.',
    'NEVER store plaintext passwords — always use `passlib` with bcrypt.',
  ],

  codePatterns: `### Route with Dependency Injection
\`\`\`python
# routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db, get_current_user
from app.schemas.user import UserResponse, UserUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserResponse)
async def get_me(current_user = Depends(get_current_user)):
    return current_user

@router.patch("/me", response_model=UserResponse)
async def update_me(
    update: UserUpdate,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await UserService(db).update_user(current_user.id, update)
\`\`\`

### Pydantic Schema
\`\`\`python
# schemas/user.py
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str = Field(min_length=1, max_length=100)

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    model_config = {"from_attributes": True}
\`\`\``,

  conventions: [
    'Use `async def` for all route handlers — FastAPI is async-first.',
    'Use dependency injection (`Depends()`) for DB sessions, auth, and services.',
    'Separate concerns: routers → services → models.',
    'Use `response_model` on every endpoint for automatic serialization + docs.',
    'Use `alembic` for database migrations — never modify tables manually.',
    'Use `lifespan` context manager for startup/shutdown (not deprecated `on_startup`).',
    'Use Python 3.10+ type hints (`X | None` instead of `Optional[X]`).',
  ],

  getStackSpecificRules: (vars) => {
    const rules: string[] = [];
    if (vars.orm === 'sqlalchemy') {
      rules.push(`### SQLAlchemy Async Patterns
- Use \`AsyncSession\` with \`async_sessionmaker\`.
- Always call \`await session.commit()\` explicitly — no autocommit.
- Use \`selectinload()\` for eager loading relationships.
- Define models with \`DeclarativeBase\` (SQLAlchemy 2.0 style).`);
    }
    if (vars.auth === 'jwt') {
      rules.push(`### JWT Auth Pattern
- Use \`python-jose\` for JWT encoding/decoding.
- Store access token in response, refresh token in HTTP-only cookie.
- Always validate token expiry and signature.
- Use \`OAuth2PasswordBearer\` as the security scheme.`);
    }
    return rules.join('\n\n');
  },
};

// ── Flutter ─────────────────────────────────────

const FLUTTER_KNOWLEDGE: FrameworkKnowledge = {
  fileStructure: `\`\`\`
lib/
├── main.dart               # App entry, MaterialApp/router config
├── app/
│   ├── router.dart         # GoRouter / navigation config
│   └── theme.dart          # ThemeData definitions
├── features/
│   ├── auth/
│   │   ├── screens/        # Auth screens
│   │   ├── widgets/        # Auth-specific widgets
│   │   ├── providers/      # Auth state (Riverpod)
│   │   └── models/         # Auth data models
│   └── home/
│       ├── screens/
│       ├── widgets/
│       └── providers/
├── shared/
│   ├── widgets/            # Reusable UI components
│   ├── models/             # Shared data classes
│   ├── services/           # API, storage, etc.
│   └── utils/              # Helpers
test/
├── unit/
├── widget/
└── integration/
\`\`\``,

  antiPatterns: [
    'NEVER put business logic in widgets — use providers/blocs/services.',
    'NEVER use `setState()` for global or shared state — use a state management solution.',
    'NEVER create deeply nested widget trees — extract sub-widgets into their own classes.',
    'NEVER hardcode strings — use constants or localization.',
    'NEVER use `print()` for logging — use `dart:developer log()` or a logging package.',
    'NEVER ignore `dispose()` — always clean up controllers, streams, and animation controllers.',
  ],

  codePatterns: `### Feature Screen with Riverpod
\`\`\`dart
// features/home/screens/home_screen.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final projects = ref.watch(projectsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Home')),
      body: projects.when(
        data: (data) => ListView.builder(
          itemCount: data.length,
          itemBuilder: (_, i) => ProjectTile(project: data[i]),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: \$e')),
      ),
    );
  }
}
\`\`\`

### Data Model with Freezed
\`\`\`dart
import 'package:freezed_annotation/freezed_annotation.dart';
part 'project.freezed.dart';
part 'project.g.dart';

@freezed
class Project with _\$Project {
  const factory Project({
    required String id,
    required String name,
    String? description,
    @Default(false) bool isCompleted,
  }) = _Project;

  factory Project.fromJson(Map<String, dynamic> json) => _\$ProjectFromJson(json);
}
\`\`\``,

  conventions: [
    'Use `const` constructors wherever possible for widget performance.',
    'Follow feature-first directory structure (`features/auth/`, `features/home/`).',
    'Use `freezed` + `json_serializable` for immutable data models.',
    'Use `go_router` for declarative routing with deep linking support.',
    'Keep widget build methods under 50 lines — extract sub-widgets.',
    'Use `ThemeData` and `Theme.of(context)` — never hardcode colors or text styles.',
    'Test widget behavior with `flutter_test` — use `pumpWidget()` and `find.byType()`.',
  ],

  getStackSpecificRules: (vars) => {
    const rules: string[] = [];
    if (vars.stateManagement === 'riverpod') {
      rules.push(`### Riverpod State Management
- Use \`@riverpod\` annotation with code generation (riverpod_generator).
- Prefer \`AsyncNotifierProvider\` for async state.
- Use \`ref.watch()\` in build, \`ref.read()\` in callbacks.
- Keep providers in feature-specific \`providers/\` directories.`);
    }
    if (vars.stateManagement === 'bloc') {
      rules.push(`### BLoC Pattern
- One BLoC per feature — named \`FeatureBloc\` / \`FeatureCubit\`.
- Events are past-tense (\`ProjectCreated\`), states are adjectives (\`ProjectLoading\`).
- Use \`BlocProvider\` at the appropriate scope — not the root unless global.
- Test BLoCs with \`bloc_test\` package.`);
    }
    return rules.join('\n\n');
  },
};

// ── Express.js ──────────────────────────────────

const EXPRESS_KNOWLEDGE: FrameworkKnowledge = {
  fileStructure: `\`\`\`
src/
├── index.ts                # App bootstrap + server.listen()
├── app.ts                  # Express app setup + middleware
├── config/
│   ├── env.ts              # Environment validation (zod/envalid)
│   └── database.ts         # DB connection setup
├── routes/
│   ├── index.ts            # Route aggregator
│   ├── auth.routes.ts
│   └── users.routes.ts
├── controllers/            # Request handlers
│   ├── auth.controller.ts
│   └── users.controller.ts
├── services/               # Business logic
│   └── user.service.ts
├── models/                 # DB models / schemas
│   └── user.model.ts
├── middleware/
│   ├── auth.ts             # JWT verification
│   ├── validate.ts         # Request validation (zod)
│   └── error-handler.ts    # Global error handler
├── utils/
│   └── api-error.ts        # Custom error class
└── types/
    └── express.d.ts        # Extended Express types
tests/
├── setup.ts
└── routes/
    └── auth.test.ts
\`\`\``,

  antiPatterns: [
    'NEVER put business logic in route handlers — extract to controllers/services.',
    'NEVER use `console.log` for logging — use a structured logger (winston/pino).',
    'NEVER use `any` for request/response types — extend Express types properly.',
    'NEVER skip error handling middleware — always have a global error handler as the last middleware.',
    'NEVER store sessions/state in memory for production — use Redis or a database.',
    'NEVER trust `req.body` without validation — always validate with zod or joi.',
    'NEVER use synchronous file I/O in request handlers.',
  ],

  codePatterns: `### Controller + Service Pattern
\`\`\`typescript
// controllers/users.controller.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { ApiError } from '../utils/api-error';

export class UsersController {
  constructor(private userService: UserService) {}

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.findById(req.params.id);
      if (!user) throw new ApiError(404, 'User not found');
      res.json({ data: user });
    } catch (err) {
      next(err);
    }
  };
}
\`\`\`

### Validation Middleware (Zod)
\`\`\`typescript
// middleware/validate.ts
import { z, AnyZodObject } from 'zod';

export const validate = (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({ body: req.body, query: req.query, params: req.params });
      next();
    } catch (err) {
      res.status(400).json({ errors: (err as z.ZodError).issues });
    }
  };
\`\`\``,

  conventions: [
    'Separate app setup (`app.ts`) from server bootstrap (`index.ts`).',
    'Use the handler chain: Route → Validate → Controller → Service → Model.',
    'Use `express-async-errors` or wrap handlers to catch async errors.',
    'Register the error handler as the LAST middleware.',
    'Use environment validation at startup — fail fast on missing config.',
    'Use `helmet()` for security headers, `cors()` for cross-origin, `compression()` for gzip.',
    'Use graceful shutdown: listen for SIGTERM, close DB connections, stop accepting requests.',
  ],
};

// ── Python ML ───────────────────────────────────

const PYTHON_ML_KNOWLEDGE: FrameworkKnowledge = {
  fileStructure: `\`\`\`
project/
├── data/
│   ├── raw/                # Original, immutable data
│   ├── processed/          # Cleaned, transformed data
│   └── external/           # Third-party data sources
├── notebooks/
│   ├── 01_exploration.ipynb
│   ├── 02_feature_engineering.ipynb
│   └── 03_model_training.ipynb
├── src/
│   ├── __init__.py
│   ├── data/               # Data loading + preprocessing
│   │   ├── dataset.py
│   │   └── transforms.py
│   ├── models/             # Model architectures
│   │   └── model.py
│   ├── training/           # Training loops + callbacks
│   │   ├── trainer.py
│   │   └── callbacks.py
│   ├── evaluation/         # Metrics + evaluation
│   │   └── metrics.py
│   └── utils/
│       └── config.py       # Hydra/pydantic config
├── configs/                # Experiment configs (YAML)
│   ├── train.yaml
│   └── model/
│       └── resnet.yaml
├── scripts/                # CLI scripts
│   ├── train.py
│   └── evaluate.py
├── tests/
├── pyproject.toml
└── README.md
\`\`\``,

  antiPatterns: [
    'NEVER commit data files to git — use `.gitignore` and DVC or cloud storage.',
    'NEVER hardcode hyperparameters — use config files (YAML/hydra/pydantic).',
    'NEVER train without setting random seeds — results must be reproducible.',
    'NEVER use a single script for everything — separate data, model, training, evaluation.',
    'NEVER ignore memory management — use generators for large datasets, clear CUDA cache.',
    'NEVER skip experiment tracking — log every run with hyperparameters and metrics.',
  ],

  codePatterns: `### PyTorch Training Loop
\`\`\`python
# src/training/trainer.py
import torch
from torch.utils.data import DataLoader

class Trainer:
    def __init__(self, model, optimizer, criterion, device='cuda'):
        self.model = model.to(device)
        self.optimizer = optimizer
        self.criterion = criterion
        self.device = device

    def train_epoch(self, dataloader: DataLoader) -> float:
        self.model.train()
        total_loss = 0.0

        for batch in dataloader:
            inputs = batch['input'].to(self.device)
            targets = batch['target'].to(self.device)

            self.optimizer.zero_grad()
            outputs = self.model(inputs)
            loss = self.criterion(outputs, targets)
            loss.backward()
            self.optimizer.step()

            total_loss += loss.item()

        return total_loss / len(dataloader)
\`\`\`

### Experiment Config
\`\`\`python
# src/utils/config.py
from pydantic import BaseModel

class TrainConfig(BaseModel):
    batch_size: int = 32
    learning_rate: float = 1e-3
    epochs: int = 100
    seed: int = 42
    model_name: str = "resnet50"
    data_dir: str = "data/processed"
\`\`\``,

  conventions: [
    'Use `pyproject.toml` for project metadata and dependencies.',
    'Separate raw data from processed data — raw data is immutable.',
    'Set random seeds everywhere: `torch.manual_seed()`, `numpy.random.seed()`, `random.seed()`.',
    'Use `tqdm` for progress bars in training loops.',
    'Log metrics to experiment tracker (W&B, MLflow) — never just print.',
    'Use `torch.no_grad()` for evaluation — saves memory and is faster.',
    'Save model checkpoints with optimizer state for resume capability.',
    'Use type hints everywhere — especially for tensor shapes in docstrings.',
  ],

  getStackSpecificRules: (vars) => {
    const rules: string[] = [];
    if (vars.framework === 'pytorch') {
      rules.push(`### PyTorch Specific
- Use \`nn.Module\` for all model architectures.
- Use \`DataLoader\` with \`num_workers > 0\` and \`pin_memory=True\` for GPU training.
- Use mixed precision (\`torch.cuda.amp\`) for faster training on modern GPUs.
- Profile with \`torch.profiler\` before optimizing.`);
    }
    if (vars.tracking === 'wandb') {
      rules.push(`### W&B Integration
- Initialize at script start: \`wandb.init(project="project-name")\`.
- Log metrics every step: \`wandb.log({"loss": loss, "epoch": epoch})\`.
- Log model artifacts: \`wandb.log_artifact(model_path)\`.
- Use sweep configs for hyperparameter search.`);
    }
    return rules.join('\n\n');
  },
};

// ── Knowledge Registry ──────────────────────────

const KNOWLEDGE_REGISTRY: Record<string, FrameworkKnowledge> = {
  'nextjs': NEXTJS_KNOWLEDGE,
  'react-native': REACT_NATIVE_KNOWLEDGE,
  'fastapi': FASTAPI_KNOWLEDGE,
  'flutter': FLUTTER_KNOWLEDGE,
  'express': EXPRESS_KNOWLEDGE,
  'python-ml': PYTHON_ML_KNOWLEDGE,
};

/**
 * Get framework-specific knowledge blocks for a template slug.
 * Returns undefined if no knowledge is registered for the slug.
 */
export function getFrameworkKnowledge(slug: string): FrameworkKnowledge | undefined {
  return KNOWLEDGE_REGISTRY[slug];
}
