import React from 'react';
import {
  Button,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/shared/ui';

const IMAGES = {
  ctaBg:
    'https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&q=80',
};

const faqs = [
  {
    q: 'What is CredVerify?',
    a: "CredVerify is India's national micro-credential aggregator that unifies all your certifications, courses, and skills from multiple platforms into one verified digital profile. We use blockchain technology to ensure authenticity and NSQF alignment for better recognition.",
  },
  {
    q: 'How does credential verification work?',
    a: 'We verify credentials through direct integration with partner institutions, blockchain validation, and DigiLocker connectivity. Each credential is mapped to NSQF levels and stored securely, ensuring employers can instantly verify authenticity without contacting multiple sources.',
  },
  {
    q: 'Is CredVerify free to use?',
    a: 'Yes! Creating a profile and aggregating your credentials is completely free for learners. Employers and institutions can access verification services through our various pricing plans tailored to their needs.',
  },
  {
    q: 'Which platforms does CredVerify support?',
    a: "We integrate with 500+ institutions including NPTEL, Coursera, Udemy, LinkedIn Learning, edX, universities, ITIs, skill centers, and government training programs. We're constantly adding more partners to expand coverage across India.",
  },
  {
    q: 'How secure is my data?',
    a: 'Your data is protected with enterprise-grade encryption, blockchain technology, and secure cloud infrastructure. We comply with all Indian data protection regulations and you maintain full control over who can view your credentials.',
  },
];

export function FAQSection({ onGetStarted }) {
  const [isVisible, setIsVisible] = React.useState(false);
  const sectionRef = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="relative py-24 overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={IMAGES.ctaBg}
          alt="FAQ Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/90" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-background mb-6 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-background/70 text-lg leading-relaxed font-light">
              Everything you need to know about CredVerify and how it works.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className={`overflow-hidden rounded-2xl border border-background/10 bg-background/5 backdrop-blur-sm transition-all duration-500 hover:bg-background/10 ${
                  isVisible
                    ? 'translate-x-0 opacity-100'
                    : 'translate-x-10 opacity-0'
                }`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <AccordionTrigger className="px-8 py-6 text-left text-lg font-medium text-background hover:no-underline">
                  {faq.q}
                </AccordionTrigger>

                <AccordionContent className="px-8 pb-8 text-background/70 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="text-center mt-12">
            <p className="text-background/70 mb-6">Still have questions?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={onGetStarted}>Get Started Now</Button>
              <Button variant="outline">Contact Support</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
