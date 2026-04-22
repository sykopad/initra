# Next.js 16 Conventions

**Activation: Always On**

Enforce strict adherence to Next.js 16 (App Router) conventions, focusing on performance with Turbopack and modern React features.

## Core Directives

1. **App Router Only**: Do not use the legacy `pages/` directory. All routes must be in `app/`.
2. **Server Components by Default**: Favor Server Components. Only use `'use client'` for interactive elements or when using hooks.
3. **Turbopack Optimizations**: Ensure layouts and segments are optimized for fast incremental builds. Avoid complex barrel exports that can slow down compilation.
4. **Metadata API**: Use the `generateMetadata` function or the `metadata` object for SEO. Do not use legacy `<Head>` components.
5. **Data Fetching**: Use standard `async/await` in Server Components. Avoid `getServerSideProps` or `getStaticProps`.

## Component Structure

- **Layouts**: Use `layout.tsx` for shared UI.
- **Pages**: Use `page.tsx` for leaf routes.
- **Loading**: Implement `loading.tsx` for granular streaming.
- **Error Handling**: Use `error.tsx` for segment-level error boundaries.

## Performance & Style

- Use **Vanilla CSS** with the project's custom design system.
- Avoid utility-first CSS (Tailwind) unless explicitly requested.
- Ensure all components follow the premium, vibrant, and dynamic design aesthetics of Initra.
