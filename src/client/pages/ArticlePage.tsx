import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AuthorBio from '../components/AuthorBio';
import ScrollProgress from '../components/ScrollProgress';

const BUNNY_BASE = 'https://money-wound.b-cdn.net';

interface Article {
  slug: string;
  title: string;
  body: string;
  meta_description: string;
  category: string;
  tags: string[];
  image_url: string;
  image_alt: string;
  reading_time: number;
  published_at: string;
  word_count: number;
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const initData = typeof window !== 'undefined' ? (window as any).__INITIAL_DATA__ : {};
  const initArticle = initData?.article?.slug === slug ? initData.article : null;
  const [article, setArticle] = useState<Article | null>(initArticle);
  const [loading, setLoading] = useState(!initArticle);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    // If we already have the article from SSR, don't refetch
    if (article && article.slug === slug) return;
    setLoading(true);
    setNotFound(false);
    fetch(`/api/articles/${slug}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then(d => {
        if (d) setArticle(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div style={{ paddingTop: '80px' }}>
        <div className="loading">Loading article...</div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div style={{ paddingTop: '80px', textAlign: 'center', padding: 'var(--space-2xl) var(--space-md)' }}>
        <h1>Article Not Found</h1>
        <p>This article doesn't exist or has been moved.</p>
        <Link to="/articles" className="btn-primary" style={{ marginTop: 'var(--space-md)' }}>
          Browse All Articles
        </Link>
      </div>
    );
  }

  const imgSrc = article.image_url || `${BUNNY_BASE}/images/articles/${article.slug}.webp`;
  const date = new Date(article.published_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  // Insert author bio after 4th-5th section (after 4th </h2> or ~800 words in)
  const insertAuthorBio = (html: string): string => {
    let count = 0;
    return html.replace(/<\/h2>/gi, (match) => {
      count++;
      if (count === 4) return `${match}<!-- AUTHOR_BIO -->`;
      return match;
    });
  };

  const bodyWithBio = insertAuthorBio(article.body);
  const parts = bodyWithBio.split('<!-- AUTHOR_BIO -->');

  return (
    <>
      <ScrollProgress />

      {/* Article Hero */}
      <section className="article-hero" aria-label="Article hero image">
        <img
          src={imgSrc}
          alt={article.image_alt || article.title}
          className="article-hero__img"
          width="1200"
          height="630"
          onError={(e) => {
            e.currentTarget.src = `${BUNNY_BASE}/images/hero-articles.webp`;
          }}
        />
        <div className="article-hero__overlay" />
        <div className="article-hero__meta">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/articles">Articles</Link>
            <span>/</span>
            <span>{article.title}</span>
          </nav>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
            {article.category && (
              <span style={{ background: 'var(--accent)', padding: '0.2rem 0.75rem', borderRadius: '999px', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {article.category.replace(/-/g, ' ')}
              </span>
            )}
            <span>{date}</span>
            {article.reading_time && <span>{article.reading_time} min read</span>}
          </div>
        </div>
      </section>

      {/* Article Body */}
      <article className="article-body" itemScope itemType="https://schema.org/Article">
        <meta itemProp="author" content="Kalesh" />
        <meta itemProp="datePublished" content={article.published_at} />

        {/* Part 1 of article */}
        <div
          dangerouslySetInnerHTML={{ __html: parts[0] }}
          className="article-content"
        />

        {/* Author bio mid-article */}
        <AuthorBio />

        {/* Part 2 of article (if bio was inserted) */}
        {parts[1] && (
          <div
            dangerouslySetInnerHTML={{ __html: parts[1] }}
            className="article-content"
          />
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div style={{ marginTop: 'var(--space-xl)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {article.tags.map(tag => (
              <Link
                key={tag}
                to={`/articles?category=${tag}`}
                style={{
                  padding: '0.25rem 0.75rem',
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  border: 'none'
                }}
              >
                {tag.replace(/-/g, ' ')}
              </Link>
            ))}
          </div>
        )}

        {/* Bottom author bio */}
        <div style={{ marginTop: 'var(--space-xl)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-xl)' }}>
          <AuthorBio />
        </div>
      </article>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            description: article.meta_description,
            author: {
              '@type': 'Person',
              name: 'Kalesh',
              url: 'https://kalesh.love'
            },
            publisher: {
              '@type': 'Organization',
              name: 'The Money Wound',
              url: 'https://yourmoneywound.com'
            },
            datePublished: article.published_at,
            image: imgSrc,
            url: `https://yourmoneywound.com/articles/${article.slug}`
          })
        }}
      />
    </>
  );
}
