import React, { useState, useEffect } from 'react';

interface Section {
  id: string;
  label: string;
}

interface Props {
  sections: Section[];
}

export default function DotNav({ sections }: Props) {
  const [active, setActive] = useState(sections[0]?.id || '');

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { threshold: 0.4 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(o => o.disconnect());
  }, [sections]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="dot-nav" aria-label="Page sections">
      {sections.map(({ id, label }) => (
        <button
          key={id}
          className={`dot-nav__dot${active === id ? ' active' : ''}`}
          data-label={label}
          onClick={() => scrollTo(id)}
          aria-label={`Jump to ${label}`}
        />
      ))}
    </nav>
  );
}
