import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';

const BUNNY_BASE = 'https://money-wound.b-cdn.net';

const categories = [
  { value: '', label: 'All Topics' },
  { value: 'money-psychology', label: 'Money Psychology' },
  { value: 'financial-trauma', label: 'Financial Trauma' },
  { value: 'wealth-consciousness', label: 'Wealth Consciousness' },
  { value: 'relationships', label: 'Money & Relationships' },
  { value: 'healing', label: 'Healing Practice' },
  { value: 'spiritual', label: 'Spiritual & Somatic' },
];

interface Article {
  slug: string;
  title: string;
  meta_description: string;
  category: string;
  image_url: string;
  image_alt: string;
  reading_time: number;
  published_at: string;
}

export default function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initData = typeof window !== 'undefined' ? (window as any).__INITIAL_DATA__ : {};
  const [articles, setArticles] = useState<Article[]>(initData?.articles || []);
  const [total, setTotal] = useState<number>(initData?.total || 0);
  const [loading, setLoading] = useState(!(initData?.articles?.length > 0));
  const category = searchParams.get('category') || '';

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '30' });
    if (category) params.set('category', category);
    fetch(`/api/articles?${params}`)
      .then(r => r.json())
      .then(d => {
        setArticles(d.articles || []);
        setTotal(d.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category]);

  return (
    <>
      {/* Page Hero */}
      <section style={{
        position: 'relative',
        height: '40vh',
        minHeight: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${BUNNY_BASE}/images/hero-articles.webp)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,20,15,0.65)' }} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: 'white', padding: '0 var(--space-md)' }}>
          <div style={{ fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '0.75rem' }}>
            The Money Wound
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'white', marginBottom: '0.5rem' }}>
            All Articles
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem' }}>
            {total > 0 ? `${total} articles on money healing` : 'Long-form writing on money psychology and healing'}
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border-color)', padding: '1rem var(--space-md)', position: 'sticky', top: '60px', zIndex: 50 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => {
                if (cat.value) setSearchParams({ category: cat.value });
                else setSearchParams({});
              }}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '999px',
                border: '2px solid',
                borderColor: category === cat.value ? 'var(--accent)' : 'var(--border-color)',
                background: category === cat.value ? 'var(--accent)' : 'transparent',
                color: category === cat.value ? 'white' : 'var(--text-primary)',
                fontSize: '0.85rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minHeight: 'var(--tap-target-min)'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <section style={{ padding: 'var(--space-xl) var(--space-md)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {loading ? (
            <div className="loading">Loading articles...</div>
          ) : articles.length > 0 ? (
            <div className="articles-grid">
              {articles.map(a => (
                <ArticleCard
                  key={a.slug}
                  slug={a.slug}
                  title={a.title}
                  metaDescription={a.meta_description}
                  category={a.category}
                  imageUrl={a.image_url}
                  imageAlt={a.image_alt}
                  readingTime={a.reading_time}
                  publishedAt={a.published_at}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'rgba(45,42,38,0.5)' }}>
              <p>No articles found{category ? ` in "${category}"` : ''}.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
