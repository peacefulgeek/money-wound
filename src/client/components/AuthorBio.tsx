import React from 'react';

const BUNNY_BASE = 'https://money-wound.b-cdn.net';

export default function AuthorBio() {
  return (
    <aside className="author-bio" aria-label="About the author">
      <img
        src={`${BUNNY_BASE}/images/kalesh-photo.webp`}
        alt="Kalesh - Consciousness Teacher and Writer"
        className="author-bio__photo"
        width="80"
        height="80"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='40' fill='%231A5F5A'/%3E%3Ctext x='40' y='46' text-anchor='middle' fill='white' font-size='24' font-family='serif'%3EK%3C/text%3E%3C/svg%3E`;
        }}
      />
      <div>
        <div className="author-bio__name">Kalesh</div>
        <div className="author-bio__title">Consciousness Teacher &amp; Writer</div>
        <p className="author-bio__text">
          Kalesh writes at the intersection of financial psychology and inner work.
          His teaching draws from Krishnamurti, Tara Brach, and the growing field of financial therapy.
          He believes your bank account is a mirror, not a scorecard.
          {' '}<a href="https://kalesh.love" target="_blank" rel="noopener noreferrer">Read more at kalesh.love</a>
        </p>
      </div>
    </aside>
  );
}
