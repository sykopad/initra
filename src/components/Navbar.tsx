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

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand">
          <span className="logo-icon">⚡</span>
          <span className="brand-text">Initra</span>
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
          
          <li className="navbar-divider"></li>
          
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
          gap: 1.5rem;
          list-style: none;
        }

        .navbar-divider {
          width: 1px;
          height: 20px;
          background: rgba(255,255,255,0.1);
          margin: 0 0.5rem;
        }

        .active {
          color: var(--primary-light) !important;
        }

        .nav-skeleton {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
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
          border-color: var(--primary);
        }

        .user-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 200px;
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 100;
        }

        .user-profile:hover .user-dropdown {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .dropdown-header {
          padding: 1rem;
        }

        .user-name {
          font-weight: 600;
          font-size: 0.875rem;
          margin-bottom: 0.125rem;
        }

        .user-email {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .dropdown-divider {
          height: 1px;
          background: rgba(255,255,255,0.1);
        }

        .dropdown-item {
          width: 100%;
          text-align: left;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 0.875rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .dropdown-item:hover {
          background: rgba(255,255,255,0.05);
          color: white;
        }

        .logout {
          color: var(--danger-light);
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
