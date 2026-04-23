import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  slug: string;
  title: string;
  metaDescription?: string;
  category?: string;
  imageUrl?: string;
  imageAlt?: string;
  readingTime?: number;
  publishedAt?: string;
}

const BUNNY_BASE = 'https://money-wound.b-cdn.net';

export default function ArticleCard({
  slug, title, metaDescription, category, imageUrl, imageAlt, readingTime, publishedAt
}: Props) {
  const imgSrc = imageUrl || `${BUNNY_BASE}/images/articles/${slug}.webp`;
  const categoryLabel = category ? category.replace(/-/g, ' ') : 'Money Healing';
  const date = publishedAt ? new Date(publishedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  }) : '';

  return (
    <Link to={`/articles/${slug}`} className="article-card" aria-label={`Read: ${title}`}>
      <img
        src={imgSrc}
        alt={imageAlt || title}
        className="article-card__image"
        loading="lazy"
        width="400"
        height="225"
        onError={(e) => {
          const img = e.currentTarget;
          img.style.display = 'none';
          const placeholder = img.nextElementSibling as HTMLElement;
          if (placeholder) placeholder.style.display = 'flex';
        }}
      />
      <div className="article-card__image img-placeholder" style={{ display: 'none', aspectRatio: '16/9' }}>
        {categoryLabel}
      </div>
      <div className="article-card__body">
        <div className="article-card__category">{categoryLabel}</div>
        <h3 className="article-card__title">{title}</h3>
        {metaDescription && (
          <p className="article-card__excerpt">{metaDescription}</p>
        )}
        <div className="article-card__meta">
          {date && <span>{date}</span>}
          {readingTime && <span>{readingTime} min read</span>}
        </div>
      </div>
    </Link>
  );
}
