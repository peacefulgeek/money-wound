import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer__grid">
        <div>
          <div className="site-footer__logo">The Money Wound</div>
          <p className="site-footer__tagline">
            Where personal finance meets shadow work. Healing the invisible wounds
            that keep you broke, terrified, or guilt-ridden about money.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
            Written by <a href="https://kalesh.love" target="_blank" rel="noopener noreferrer">Kalesh</a>,
            Consciousness Teacher &amp; Writer.
          </p>
        </div>
        <div>
          <h4>Explore</h4>
          <ul>
            <li><Link to="/articles">All Articles</Link></li>
            <li><Link to="/assessments">Money Assessments</Link></li>
            <li><Link to="/herbs">Herbs &amp; TCM</Link></li>
            <li><Link to="/tools">Money Healing Toolkit</Link></li>
            <li><Link to="/about">About Kalesh</Link></li>
          </ul>
        </div>
        <div>
          <h4>Topics</h4>
          <ul>
            <li><Link to="/articles?category=money-psychology">Money Psychology</Link></li>
            <li><Link to="/articles?category=financial-trauma">Financial Trauma</Link></li>
            <li><Link to="/articles?category=wealth-consciousness">Wealth Consciousness</Link></li>
            <li><Link to="/articles?category=relationships">Money &amp; Relationships</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="site-footer__bottom">
        <p>&copy; {year} The Money Wound. All rights reserved.</p>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
          As an Amazon Associate, I earn from qualifying purchases.
          Affiliate links are marked (paid link).
        </p>
      </div>
    </footer>
  );
}
