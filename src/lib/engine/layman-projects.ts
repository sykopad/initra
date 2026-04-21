import { ProjectCategory } from './types';

export interface LaymanProject {
  slug: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
  category: ProjectCategory;
  recommendedTemplate: string;
  recommendedPackages: string[];
  recommendedServices: string[];
  reasoning: Record<string, string>;
}

export const LAYMAN_PROJECTS: LaymanProject[] = [
  {
    slug: 'personal-site',
    name: 'Personal Website',
    description: 'A beautiful portfolio, resume, or personal blog to showcase your work.',
    difficulty: 'easy',
    icon: '👤',
    category: 'web-app',
    recommendedTemplate: 'nextjs',
    recommendedPackages: ['framer-motion', 'react-icons'],
    recommendedServices: ['vercel'],
    reasoning: {
      'nextjs': 'Fastest way to build a modern, high-performance website.',
      'framer-motion': 'Adds smooth animations that make your site feel premium.',
      'vercel': 'Free and easy hosting with one-click deployment.',
    }
  },
  {
    slug: 'business-site',
    name: 'Business Website',
    description: 'A professional landing page for your company or service with contact forms.',
    difficulty: 'easy',
    icon: '🏢',
    category: 'web-app',
    recommendedTemplate: 'nextjs',
    recommendedPackages: ['react-hook-form', 'zod'],
    recommendedServices: ['resend', 'vercel'],
    reasoning: {
      'nextjs': 'Optimized for search engines (SEO) so customers can find you.',
      'resend': 'Reliable service to receive inquiries from your contact forms.',
      'vercel': 'Reliable, global hosting for your business.',
    }
  },
  {
    slug: 'ecommerce-store',
    name: 'E-commerce Store',
    description: 'Sell products online with a shopping cart and secure checkout.',
    difficulty: 'medium',
    icon: '🛍️',
    category: 'web-app',
    recommendedTemplate: 'nextjs',
    recommendedPackages: ['zustand', 'shadcn-ui'],
    recommendedServices: ['stripe', 'supabase', 'vercel'],
    reasoning: {
      'stripe': 'World-class payment processing to handle credit cards safely.',
      'supabase': 'Stores your products, orders, and customer data securely.',
      'zustand': 'Keeps track of items in the customer\'s shopping cart.',
    }
  },
  {
    slug: 'blog-admin',
    name: 'Managed Blog',
    description: 'A full-featured blog with a dashboard for you to write and manage content.',
    difficulty: 'medium',
    icon: '✍️',
    category: 'web-app',
    recommendedTemplate: 'nextjs',
    recommendedPackages: ['lucide-react', 'date-fns'],
    recommendedServices: ['supabase', 'vercel'],
    reasoning: {
      'supabase': 'Powers your blog database and handles secure login for authors.',
      'lucide-react': 'Provides professional icons for your writing dashboard.',
    }
  },
  {
    slug: 'ai-chatbot',
    name: 'AI-Powered App',
    description: 'Build an application that uses AI to answer questions or generate content.',
    difficulty: 'hard',
    icon: '🤖',
    category: 'ai-ml',
    recommendedTemplate: 'nextjs',
    recommendedPackages: ['ai', 'lucide-react'],
    recommendedServices: ['openai', 'supabase', 'vercel'],
    reasoning: {
      'openai': 'The brain of your app—provides the latest AI reasoning capabilities.',
      'ai': 'Specialized tools to stream AI responses directly to the user.',
      'supabase': 'Saves conversation history and user preferences.',
    }
  }
];

export function getLaymanProject(slug: string): LaymanProject | undefined {
  return LAYMAN_PROJECTS.find(p => p.slug === slug);
}
