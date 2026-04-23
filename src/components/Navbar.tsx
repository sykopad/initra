"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const supabase = createClient();

  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // Initial theme sync
    const savedTheme = localStorage.getItem('initra-theme') as "light" | "dark" | null;
    const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initialTheme);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('initra-theme', newTheme);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      window.location.reload();
    } catch (err) {
      console.error("Logout failed:", err);
      // Fallback to client-side only if fetch fails
      await supabase.auth.signOut();
      window.location.reload();
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand">
          <img src="/initra-dark.svg" alt="Initra Logo" className="brand-logo logo-dark" height="55" />
          <img src="/initra-light.svg" alt="Initra Logo" className="brand-logo logo-light" height="55" />
        </Link>

        <ul className="navbar-links">
          <li>
            <Link href="/" className={pathname === "/" ? "active" : ""}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/wizard" className={pathname === "/wizard" ? "active" : ""}>
              Wizard
            </Link>
          </li>
          <li>
            <Link href="/community" className={pathname === "/community" ? "active" : ""}>
              Community
            </Link>
          </li>
          <li>
            <Link href="/knowledge" className={pathname === "/knowledge" ? "active" : ""}>
              Knowledge
            </Link>
          </li>

          <li className="navbar-divider"></li>

          <li>
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label="Toggle Theme"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === "light" ? (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </button>
          </li>

          {loading ? (
            <li className="nav-skeleton"></li>
          ) : user ? (
            <li className="user-menu-item">
              <div className="user-profile">
                <img
                  src={user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${user.user_metadata.full_name || 'User'}&background=7c3aed&color=fff`}
                  alt="Profile"
                  className="avatar"
                />
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <p className="user-name">{user.user_metadata.full_name || 'User'}</p>
                    <p className="user-email">{user.email}</p>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link href="/dashboard" className="dropdown-item">
                    Dashboard
                  </Link>
                  <Link href="/settings" className="dropdown-item">
                    Account Settings
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item logout">
                    Sign Out
                  </button>
                </div>
              </div>
            </li>
          ) : (
            <li>
              <Link href="/login" className="btn btn-primary btn-sm">
                Sign In
              </Link>
            </li>
          )}
        </ul>
      </div>

      <style jsx>{`
        .navbar-links {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          list-style: none;
        }

        .navbar-divider {
          width: 1px;
          height: 18px;
          background: var(--border-medium);
          margin: 0 0.25rem;
        }

        .navbar-links li a,
        .navbar-links li a:visited {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.9375rem;
          font-weight: 500;
          font-family: var(--font-heading);
          transition: all var(--transition-base);
        }

        .navbar-links li a:hover {
          color: var(--text-primary);
        }

        .active {
          color: var(--text-primary) !important;
          font-weight: 700 !important;
        }

        .theme-toggle {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-base);
        }

        .theme-toggle:hover {
          background: var(--bg-glass-hover);
          color: var(--text-primary);
        }

        .nav-skeleton {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-glass);
          animation: pulse 1.5s infinite;
        }

        .user-profile {
          position: relative;
          cursor: pointer;
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid transparent;
          transition: border-color 0.2s;
        }

        .user-profile:hover .avatar {
          border-color: var(--accent-primary);
        }

        .user-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 220px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-medium);
          border-radius: 12px;
          box-shadow: var(--shadow-lg);
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 100;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .user-profile:hover .user-dropdown {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .dropdown-header {
          padding: 1.25rem 1rem;
        }

        .user-name {
          font-weight: 600;
          font-size: 0.9375rem;
          margin-bottom: 0.125rem;
          color: var(--text-primary);
        }

        .user-email {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .dropdown-divider {
          height: 1px;
          background: var(--border-subtle);
        }

        .dropdown-item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 1rem 1.25rem;
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 0.9375rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none !important;
        }

        .dropdown-item:hover {
          background: var(--bg-glass-hover);
          color: var(--text-primary);
        }

        .logout {
          color: var(--accent-rose);
        }

        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
      `}</style>
    </nav>
  );
}
