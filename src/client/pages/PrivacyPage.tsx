import React from 'react';

export default function PrivacyPage() {
  return (
    <section style={{ paddingTop: '100px', paddingBottom: 'var(--space-2xl)', padding: '100px var(--space-md) var(--space-2xl)' }}>
      <div className="content-container">
        <h1>Privacy Policy</h1>
        <p style={{ color: 'rgba(45,42,38,0.6)', marginBottom: 'var(--space-xl)' }}>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <h2>Amazon Affiliate Disclosure</h2>
        <p>
          The Money Wound is a participant in the Amazon Services LLC Associates Program, an affiliate advertising
          program designed to provide a means for sites to earn advertising fees by advertising and linking to
          Amazon.com. Links marked "(paid link)" are affiliate links. As an Amazon Associate, I earn from
          qualifying purchases at no additional cost to you.
        </p>

        <h2>Information We Collect</h2>
        <p>
          This site does not collect personal information beyond standard server logs (IP addresses, browser type,
          pages visited) which are used solely for site administration and security. We do not sell, trade, or
          share any information with third parties.
        </p>

        <h2>Cookies</h2>
        <p>
          This site uses minimal cookies necessary for basic site functionality. No tracking cookies or
          advertising cookies are used. Amazon may set cookies when you click affiliate links - please refer
          to Amazon's privacy policy for details.
        </p>

        <h2>Third-Party Links</h2>
        <p>
          This site contains links to external websites including Amazon.com and kalesh.love. We are not
          responsible for the privacy practices of these sites. We encourage you to review their privacy policies.
        </p>

        <h2>Content Disclaimer</h2>
        <p>
          The content on The Money Wound is for educational and informational purposes only. Nothing here
          constitutes financial, legal, or therapeutic advice. Please consult qualified professionals for
          your specific situation.
        </p>

        <h2>Contact</h2>
        <p>
          For privacy-related questions, please contact us through{' '}
          <a href="https://kalesh.love" target="_blank" rel="noopener noreferrer">kalesh.love</a>.
        </p>
      </div>
    </section>
  );
}
