import React, { useState } from 'react';

interface Question {
  id: string;
  text: string;
  options: { value: string; label: string; score: number }[];
}

const questions: Question[] = [
  {
    id: 'q1',
    text: 'When you check your bank balance, your body\'s first reaction is:',
    options: [
      { value: 'a', label: 'Dread. I avoid it as long as possible.', score: 3 },
      { value: 'b', label: 'Mild anxiety, then I close the app.', score: 2 },
      { value: 'c', label: 'Neutral - it\'s just a number.', score: 1 },
      { value: 'd', label: 'Curious. I check it regularly without fear.', score: 0 },
    ]
  },
  {
    id: 'q2',
    text: 'When you earn more money than expected, you typically:',
    options: [
      { value: 'a', label: 'Find a way to spend or lose it quickly.', score: 3 },
      { value: 'b', label: 'Feel guilty, like you don\'t deserve it.', score: 3 },
      { value: 'c', label: 'Worry it won\'t last and hoard it anxiously.', score: 2 },
      { value: 'd', label: 'Feel good and make a plan for it.', score: 0 },
    ]
  },
  {
    id: 'q3',
    text: 'Talking about money with your partner or family feels:',
    options: [
      { value: 'a', label: 'Impossible. We never talk about it.', score: 3 },
      { value: 'b', label: 'Tense. It always turns into a fight.', score: 2 },
      { value: 'c', label: 'Uncomfortable but we manage.', score: 1 },
      { value: 'd', label: 'Normal. We have regular money conversations.', score: 0 },
    ]
  },
  {
    id: 'q4',
    text: 'Your relationship to charging for your work or asking for a raise is:',
    options: [
      { value: 'a', label: 'I consistently undercharge and can\'t ask for more.', score: 3 },
      { value: 'b', label: 'I know I should charge more but freeze up.', score: 2 },
      { value: 'c', label: 'It\'s uncomfortable but I do it sometimes.', score: 1 },
      { value: 'd', label: 'I know my worth and ask for it.', score: 0 },
    ]
  },
  {
    id: 'q5',
    text: 'When you think about your parents\' relationship with money, you feel:',
    options: [
      { value: 'a', label: 'Shame or sadness. It was chaotic or scarce.', score: 3 },
      { value: 'b', label: 'Complicated. Mixed messages about money.', score: 2 },
      { value: 'c', label: 'Mostly fine, though some patterns I\'ve had to unlearn.', score: 1 },
      { value: 'd', label: 'Grateful. They modeled healthy money habits.', score: 0 },
    ]
  },
  {
    id: 'q6',
    text: 'When you have debt, you:',
    options: [
      { value: 'a', label: 'Ignore it completely. The numbers feel crushing.', score: 3 },
      { value: 'b', label: 'Feel constant low-grade shame about it.', score: 2 },
      { value: 'c', label: 'Have a plan but it feels heavy.', score: 1 },
      { value: 'd', label: 'Treat it as a practical problem to solve.', score: 0 },
    ]
  },
  {
    id: 'q7',
    text: 'Spending money on yourself (not necessities) feels:',
    options: [
      { value: 'a', label: 'Wrong. I don\'t deserve it.', score: 3 },
      { value: 'b', label: 'Guilty, even when I can afford it.', score: 2 },
      { value: 'c', label: 'Fine in moderation, but I second-guess it.', score: 1 },
      { value: 'd', label: 'Natural. I can enjoy spending without guilt.', score: 0 },
    ]
  },
];

interface Result {
  title: string;
  description: string;
  articles: string[];
}

function getResult(score: number): Result {
  if (score >= 16) {
    return {
      title: 'Deep Money Wound',
      description: 'Your relationship with money carries significant emotional weight - likely inherited from early experiences or family patterns. The good news? You\'re here. That awareness is the beginning. The wound runs deep, but so does your capacity to heal it.',
      articles: ['what-is-a-money-wound', 'inherited-poverty-consciousness', 'financial-shame']
    };
  } else if (score >= 10) {
    return {
      title: 'Active Money Wound',
      description: 'You\'ve got real money patterns that are limiting you - some conscious, some not. You\'re aware enough to recognize them, which puts you ahead of most people. The work now is moving from awareness to actual change in how you relate to money.',
      articles: ['the-7-money-scripts', 'why-you-self-sabotage', 'underearning-as-trauma-response']
    };
  } else if (score >= 5) {
    return {
      title: 'Healing Money Wound',
      description: 'You\'ve done some work on your money relationship, and it shows. There are still patterns worth examining - most of us have them. You\'re in a good position to go deeper without it being overwhelming.',
      articles: ['how-to-create-a-financial-practice', 'the-scarcity-loop', 'conscious-investing']
    };
  } else {
    return {
      title: 'Healthy Money Relationship',
      description: 'You\'ve built a relatively healthy relationship with money - that\'s genuinely rare. You might still find value in the deeper psychological work here, particularly around generational patterns and the ethics of wealth.',
      articles: ['generational-wealth-vs-generational-trauma', 'the-ethics-of-wealth', 'conscious-investing']
    };
  }
}

export default function MoneyWoundQuiz() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const handleSelect = (questionId: string, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
  };

  const handleSubmit = () => {
    const total = Object.values(answers).reduce((sum, s) => sum + s, 0);
    setResult(getResult(total));
    setSubmitted(true);
  };

  const allAnswered = questions.every(q => answers[q.id] !== undefined);

  if (submitted && result) {
    return (
      <div className="quiz-container">
        <h2>Your Money Wound Assessment</h2>
        <div className="quiz-result">
          <h3>{result.title}</h3>
          <p>{result.description}</p>
          <p style={{ marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 600 }}>Start here:</p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {result.articles.map(slug => (
              <li key={slug} style={{ marginBottom: '0.5rem' }}>
                <a href={`/articles/${slug}`} style={{ color: 'var(--accent)', fontWeight: 500 }}>
                  {slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} &rarr;
                </a>
              </li>
            ))}
          </ul>
        </div>
        <button
          className="quiz-submit"
          style={{ marginTop: '1rem', background: 'transparent', color: 'var(--accent)', border: '2px solid var(--accent)' }}
          onClick={() => { setSubmitted(false); setAnswers({}); setResult(null); }}
        >
          Retake Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <h2>What's Your Money Wound?</h2>
      <p style={{ color: 'rgba(45,42,38,0.7)', marginBottom: 'var(--space-lg)' }}>
        Seven questions. No judgment. Just honest answers about how money actually feels in your body.
      </p>
      {questions.map((q, i) => (
        <div key={q.id} className="quiz-question">
          <p>{i + 1}. {q.text}</p>
          <div className="quiz-options">
            {q.options.map(opt => (
              <label key={opt.value} className={`quiz-option${answers[q.id] === opt.score && answers[q.id] !== undefined ? ' selected' : ''}`}>
                <input
                  type="radio"
                  name={q.id}
                  value={opt.value}
                  checked={answers[q.id] === opt.score}
                  onChange={() => handleSelect(q.id, opt.score)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button
        className="quiz-submit"
        onClick={handleSubmit}
        disabled={!allAnswered}
        style={{ opacity: allAnswered ? 1 : 0.5, cursor: allAnswered ? 'pointer' : 'not-allowed' }}
      >
        See My Results
      </button>
      {!allAnswered && (
        <p style={{ fontSize: '0.85rem', color: 'rgba(45,42,38,0.5)', marginTop: '0.5rem' }}>
          Answer all {questions.length} questions to see your results.
        </p>
      )}
    </div>
  );
}
