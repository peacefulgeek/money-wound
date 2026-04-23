import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const isHome = location.pathname === '/';

  return (
    <nav className={`site-nav${scrolled || !isHome ? ' scrolled' : ''}`} role="navigation" aria-label="Main navigation">
      <Link to="/" className="site-nav__logo" aria-label="The Money Wound - Home">
        The Money Wound
      </Link>
      <ul className={`site-nav__links${menuOpen ? ' open' : ''}`} role="list">
        <li><Link to="/articles">Articles</Link></li>
        <li><Link to="/tools">Toolkit</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>
      <button
        className="hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  );
}
