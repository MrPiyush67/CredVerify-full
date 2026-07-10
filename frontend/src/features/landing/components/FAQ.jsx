import { useState } from "react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const faqs = [
    {
      q: 'Is CredVerify free for individuals?',
      a: 'Yes, maintaining a digital wallet and public profile is 100% free for individual professionals.',
    },
    {
      q: 'How do employers verify my credentials?',
      a: 'Employers can click the verification link on your public profile or scan your personalized QR code to instantly verify authenticity.',
    },
    {
      q: 'What if an issuer is not on CredVerify?',
      a: 'You can manually upload certificates and request verification, which will ping the issuer to confirm via email or organizational portal.',
    },
    {
      q: 'How secure is the platform?',
      a: 'We use state-of-the-art cryptographic signatures to ensure credentials cannot be tampered with or forged.',
    },
    {
      q: 'Can I control who sees my profile?',
      a: 'Absolutely. You have granular control over public visibility, and can generate unique, time-expiring sharing links.',
    },
    {
      q: 'Does it integrate with LinkedIn?',
      a: 'Yes, you can add your CredVerify public profile link to your LinkedIn, and we offer one-click exporting to LinkedIn Licenses & Certifications.',
    },
    {
      q: 'How much does it cost for issuers?',
      a: 'Pricing for organizations depends on volume. Check out our Pricing page for detailed tiers starting from small startups to enterprise.',
    },
    {
      q: 'Is there an API available?',
      a: 'Yes, a robust REST API is available for issuers to fully automate the credential lifecycle from their own internal systems.',
    },
  ];

  return (
    <section id="docs" className="py-24 px-margin-desktop bg-white">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-outline-variant/30 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-5 text-left flex items-center justify-between font-bold hover:bg-surface-container-low transition-colors"
              >
                <span className="text-sm">{faq.q}</span>
                <span
                  className={`material-symbols-outlined transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}
                >
                  expand_more
                </span>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-6 text-sm text-on-surface-variant leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;