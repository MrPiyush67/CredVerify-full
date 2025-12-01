import React from 'react';
import { Button } from '@/common/ui/Button';

const IMAGES = {
  ctaBg: "https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&q=80",
};

const faqs = [
  {
    q: 'What is CredVerify?',
    a: 'CredVerify is India\'s national micro-credential aggregator that unifies all your certifications, courses, and skills from multiple platforms into one verified digital profile. We use blockchain technology to ensure authenticity and NSQF alignment for better recognition.'
  },
  {
    q: 'How does credential verification work?',
    a: 'We verify credentials through direct integration with partner institutions, blockchain validation, and DigiLocker connectivity. Each credential is mapped to NSQF levels and stored securely, ensuring employers can instantly verify authenticity without contacting multiple sources.'
  },
  {
    q: 'Is CredVerify free to use?',
    a: 'Yes! Creating a profile and aggregating your credentials is completely free for learners. Employers and institutions can access verification services through our various pricing plans tailored to their needs.'
  },
  {
    q: 'Which platforms does CredVerify support?',
    a: 'We integrate with 500+ institutions including NPTEL, Coursera, Udemy, LinkedIn Learning, edX, universities, ITIs, skill centers, and government training programs. We\'re constantly adding more partners to expand coverage across India.'
  },
  {
    q: 'How secure is my data?',
    a: 'Your data is protected with enterprise-grade encryption, blockchain technology, and secure cloud infrastructure. We comply with all Indian data protection regulations and you maintain full control over who can view your credentials.'
  },
];

export function FAQSection({ onGetStarted }) {
  const [openFAQ, setOpenFAQ] = React.useState(null);

  return (
    <section id="faq" className="relative py-24 bg-slate-900 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-teal-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-slate-400 text-lg leading-relaxed font-light">
              Everything you need to know about CredVerify and how it works.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-300">
                <button
                  onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left group"
                >
                  <span className="text-lg font-medium text-white group-hover:text-teal-400 transition-colors">{faq.q}</span>
                  <span
                    className="text-2xl text-teal-500 transform transition-transform duration-300"
                    style={{ transform: openFAQ === idx ? 'rotate(45deg)' : 'rotate(0deg)' }}
                  >
                    +
                  </span>
                </button>
                <div
                  className={`px-8 text-slate-400 leading-relaxed transition-all duration-300 overflow-hidden ${openFAQ === idx ? 'max-h-48 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  {faq.a}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-slate-300 mb-6">Still have questions?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={onGetStarted}>Get Started Now</Button>
              <button className="px-6 py-2.5 rounded-lg font-medium text-white border border-white/20 hover:bg-white/10 transition-all backdrop-blur-sm">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
