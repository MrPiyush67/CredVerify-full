import React from 'react';
import { Button } from '@/shared/ui';

const IMAGES = {
  animation1: '/landing/animation1.png',
  animation2: '/landing/animation2.png',
};

export function AboutSection({ onGetStarted }) {
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
      id="about"
      className="relative overflow-hidden bg-foreground py-24 text-background"
    >
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-primary">
              About CredVerify
            </span>
          </div>
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            Transforming India's{' '}
            <span className="text-primary">Skill Ecosystem</span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-background/80">
            We're on a mission to bridge the gap between education and
            employment through verified digital credentials.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div
            className={`space-y-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
          >
            <div>
              <h3 className="flex items-center gap-3 text-2xl font-bold">
                <div className="h-8 w-1.5 rounded-full bg-primary" />
                Our Vision
              </h3>
              <p className="text-background/70 leading-relaxed text-lg font-light">
                CredVerify envisions a future where every skill, certification,
                and micro-credential earned by an individual is instantly
                verifiable, portable, and recognized across India. We're
                building the infrastructure that will power the next generation
                of workforce development.
              </p>
            </div>

            <div>
              <h3 className="flex items-center gap-3 text-2xl font-bold">
                <div className="h-8 w-1.5 rounded-full bg-primary" />
                The Problem We Solve
              </h3>
              <p className="text-background/70 leading-relaxed mb-4 text-lg font-light">
                India's learners earn credentials from hundreds of platforms -
                universities, MOOCs, skill centers, and training institutes.
                These achievements remain scattered, unverified, and difficult
                for employers to validate.
              </p>
              <p className="text-background/70 leading-relaxed text-lg font-light">
                CredVerify aggregates all credentials into one unified,
                blockchain-verified digital profile that's trusted by employers
                nationwide.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="rounded-lg border border-primary/10 bg-background/5 p-4 transition-colors hover:border-primary/40">
                <div className="mb-1 text-3xl font-bold text-primary">10K+</div>
                <div className="text-sm text-background/70">Active Users</div>
              </div>
              <div className="rounded-lg border border-primary/10 bg-background/5 p-4 transition-colors hover:border-primary/40">
                <div className="mb-1 text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-background/70">
                  Partner Institutions
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={onGetStarted}>Join Our Platform</Button>
            </div>
          </div>

          <div
            className={`relative flex items-center justify-center transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
          >
            <div className="relative max-w-md mx-auto group">
              <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-2xl transition-all duration-1200 group-hover:blur-3xl" />

              <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-primary/10">
                <img
                  src={IMAGES.animation1}
                  alt="Employer Verification Animation"
                  className="relative w-full h-auto rounded-2xl transition-all duration-1200 ease-in-out group-hover:opacity-0 group-hover:scale-110"
                />
                <img
                  src={IMAGES.animation2}
                  alt="Employer Verification Animation Hover"
                  className="absolute inset-0 w-full h-auto rounded-2xl opacity-0 scale-95 transition-all duration-1200 ease-in-out group-hover:opacity-100 group-hover:scale-100"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
