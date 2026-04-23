import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section style={{ paddingTop: '100px', textAlign: 'center', padding: '120px var(--space-md) var(--space-2xl)' }}>
      <div className="content-container">
        <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', color: 'var(--accent)', marginBottom: 'var(--space-sm)' }}>404</h1>
        <h2 style={{ marginTop: 0 }}>Page Not Found</h2>
        <p style={{ color: 'rgba(45,42,38,0.6)', marginBottom: 'var(--space-xl)' }}>
          This page doesn't exist. Maybe the wound healed and moved on.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn-primary">Go Home</Link>
          <Link to="/articles" style={{ display: 'inline-flex', alignItems: 'center', padding: '0.875rem 2rem', border: '2px solid var(--accent)', borderRadius: 'var(--border-radius)', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Browse Articles
          </Link>
        </div>
      </div>
    </section>
  );
}
