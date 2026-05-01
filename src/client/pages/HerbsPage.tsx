import React, { useState, useMemo } from 'react';
import { HERBS, HERBS_EXTRA, HERB_CATEGORIES, HerbItem } from '../data/herbs-data';

const ALL_HERBS: HerbItem[] = [...HERBS, ...HERBS_EXTRA];
const AMAZON_TAG = 'spankyspinola-20';

function getAmazonUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}`;
}

function getImageUrl(keyword: string): string {
  // Use Unsplash for herb images (free, no API key needed)
  const encoded = encodeURIComponent(keyword + ' herb plant medicine');
  return `https://source.unsplash.com/200x200/?${encoded}`;
}

function HerbCard({ herb }: { herb: HerbItem }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)';
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', paddingTop: '60%', background: '#f0ebe0', overflow: 'hidden' }}>
        {!imgError ? (
          <img
            src={getImageUrl(herb.imageKeyword)}
            alt={herb.name}
            onError={() => setImgError(true)}
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            loading="lazy"
          />
        ) : (
          <div style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #e8f4e8, #d4e8d4)',
            fontSize: '2.5rem',
          }}>
            🌿
          </div>
        )}
        <div style={{
          position: 'absolute',
          top: '0.5rem',
          left: '0.5rem',
          background: 'rgba(26, 95, 90, 0.85)',
          color: 'white',
          fontSize: '0.7rem',
          fontWeight: 600,
          padding: '0.2rem 0.5rem',
          borderRadius: '4px',
          backdropFilter: 'blur(4px)',
        }}>
          {herb.category}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.5rem', lineHeight: 1.3 }}>
          {herb.name}
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#555', lineHeight: 1.65, flex: 1, marginBottom: '1rem' }}>
          {herb.description}
        </p>
        <a
          href={getAmazonUrl(herb.asin)}
          target="_blank"
          rel="noopener noreferrer nofollow"
          style={{
            display: 'block',
            background: '#FF9900',
            color: 'white',
            textAlign: 'center',
            padding: '0.5rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = '#e68900'}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = '#FF9900'}
        >
          View on Amazon →
        </a>
      </div>
    </div>
  );
}

export default function HerbsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHerbs = useMemo(() => {
    return ALL_HERBS.filter(herb => {
      const matchesCategory = activeCategory === 'All' || herb.category === activeCategory;
      const matchesSearch = searchQuery === '' ||
        herb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        herb.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        herb.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: ALL_HERBS.length };
    ALL_HERBS.forEach(h => {
      counts[h.category] = (counts[h.category] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div style={{ background: '#faf8f4', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #2D6A4F 0%, #1A3D2B 100%)',
        padding: '4rem 1.5rem 3rem',
        textAlign: 'center',
      }}>
        <h1 style={{
          color: 'white',
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          fontFamily: 'Georgia, serif',
          marginBottom: '1rem',
          lineHeight: 1.2,
        }}>
          Herbs, TCM & Supplements
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.8)',
          fontSize: '1.1rem',
          maxWidth: '600px',
          margin: '0 auto 1.5rem',
          lineHeight: 1.7,
        }}>
          Over 200 plant medicines, mushrooms, and supplements for healing the nervous system, restoring vitality, and supporting the whole-person work of financial recovery.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
          {ALL_HERBS.length} remedies across {HERB_CATEGORIES.length} categories
        </p>
      </div>

      {/* Disclaimer */}
      <div style={{
        background: '#fff8e7',
        borderBottom: '1px solid #f0e0b0',
        padding: '0.75rem 1.5rem',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '0.8rem', color: '#7a6020', margin: 0 }}>
          <strong>Note:</strong> This page contains affiliate links. As an Amazon Associate, we earn from qualifying purchases. This information is for educational purposes only and is not medical advice. Please consult a qualified practitioner before starting any herbal protocol.
        </p>
      </div>

      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Search */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Search herbs, mushrooms, supplements..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: '2px solid #e0d8cc',
              fontSize: '0.95rem',
              outline: 'none',
              background: 'white',
              boxSizing: 'border-box',
            }}
            onFocus={e => (e.currentTarget as HTMLInputElement).style.borderColor = '#2D6A4F'}
            onBlur={e => (e.currentTarget as HTMLInputElement).style.borderColor = '#e0d8cc'}
          />
        </div>

        {/* Category Filter */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '2rem',
        }}>
          {['All', ...HERB_CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                background: activeCategory === cat ? '#2D6A4F' : 'white',
                color: activeCategory === cat ? 'white' : '#444',
                border: `2px solid ${activeCategory === cat ? '#2D6A4F' : '#e0d8cc'}`,
                borderRadius: '20px',
                padding: '0.4rem 0.9rem',
                fontSize: '0.82rem',
                fontWeight: activeCategory === cat ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {cat} ({categoryCounts[cat] || 0})
            </button>
          ))}
        </div>

        {/* Results count */}
        <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '1.5rem' }}>
          Showing {filteredHerbs.length} {filteredHerbs.length === 1 ? 'remedy' : 'remedies'}
          {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
          {searchQuery ? ` matching "${searchQuery}"` : ''}
        </p>

        {/* Grid */}
        {filteredHerbs.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}>
            {filteredHerbs.map(herb => (
              <HerbCard key={`${herb.name}-${herb.category}`} herb={herb} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#888' }}>
            <p style={{ fontSize: '1.1rem' }}>No remedies found matching your search.</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
              style={{ background: '#2D6A4F', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem', cursor: 'pointer', marginTop: '1rem', fontSize: '0.9rem' }}
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Bottom note */}
        <div style={{
          marginTop: '3rem',
          padding: '2rem',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.95rem', color: '#555', lineHeight: 1.8, maxWidth: '680px', margin: '0 auto' }}>
            Healing the money wound is whole-person work. The nervous system that carries financial trauma is the same nervous system that governs your health, your sleep, your digestion, and your capacity for joy. Supporting your body is not separate from healing your relationship with money - it is part of the same work.
          </p>
          <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '1rem', fontStyle: 'italic' }}>
            - Kalesh
          </p>
        </div>
      </div>
    </div>
  );
}
