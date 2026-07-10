import React from 'react';
import { Award, Briefcase, Building } from 'lucide-react';
import { Button, Card } from '@/shared/ui';
import { useNavigate } from 'react-router';

const slides = [
  {
    role: 'learner',
    icon: Award,
    image: '/landing/user-3.png',
    title: 'For Learners',
    heading: 'Build Your Digital Credential Portfolio',
    description:
      'Access your unified dashboard to view all credentials, track verification status, and showcase your verified skills to employers. Manage certificates from universities, online platforms, and training institutes in one place.',
    features: [
      'Unified credential dashboard with verification badges',
      'DigiLocker integration for government-verified documents',
      'Track learning progress and skill endorsements',
      'Share verified credentials instantly with employers',
    ],
    ctaText: 'Get Started Free',
  },
  {
    role: 'employer',
    icon: Briefcase,
    image: '/landing/employer.png',
    title: 'For Employers',
    heading: 'Verify Candidates Instantly',
    description:
      'Access comprehensive candidate profiles with verified credentials, skills assessment, and educational background. Review detailed analytics, certification status, and hire with complete confidence using our real-time verification system.',
    features: [
      'Real-time credential verification and skill validation',
      'Detailed candidate analytics and assessment reports',
      'Streamlined hiring with zero credential fraud',
    ],
    ctaText: 'Start Hiring',
  },
  {
    role: 'regulator',
    icon: Building,
    image: '/landing/admin-3.png',
    title: 'For Institutions',
    heading: 'Manage & Issue Credentials',
    description:
      "Comprehensive admin dashboard to manage institutional credentials, monitor verification processes, and track user analytics. Issue blockchain-secured certificates, oversee credential validation, and maintain complete control over your institution's digital credentialing system.",
    features: [
      'Centralized credential management and issuance',
      'Real-time analytics and verification tracking',
      'NCVET compliant with blockchain security',
    ],
    ctaText: 'Become a Partner',
  },
];

export function HowItWorksSection() {
  const navigate = useNavigate();

  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
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

    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  React.useEffect(() => {
    const container = document.getElementById('slides-container');

    if (!container) return;

    const slideWidth = container.scrollWidth / slides.length;

    requestAnimationFrame(() => {
      container.scrollTo({
        left: slideWidth * currentSlide,
        behavior: 'smooth',
      });
    });
  }, [currentSlide]);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="overflow-hidden bg-background py-24"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div
          className={`mb-12 text-center transition-all duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Designed for the Future of Work
          </h2>

          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground">
            Whether you are a student adding a new micro-credential, an employer
            looking for specific skill sets, or a regulator monitoring quality,
            CredVerify simplifies the entire lifecycle.
          </p>
        </div>

        <div className="relative">
          <div
            id="slides-container"
            className="scrollbar-hide flex snap-x snap-mandatory gap-0 overflow-x-scroll scroll-smooth"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {slides.map((slide, idx) => {
              const Icon = slide.icon;

              return (
                <div
                  key={idx}
                  className="min-w-full snap-center snap-always px-4"
                >
                  <Card className="h-full border border-border bg-card shadow-sm transition-all duration-500 hover:shadow-lg">
                    <div className="grid gap-0 lg:h-[600px] lg:grid-cols-2">
                      {/* Image Side */}
                      <div className="relative flex h-[400px] items-center justify-center bg-muted p-8 lg:h-full">
                        <img
                          src={slide.image}
                          alt={`${slide.title} dashboard`}
                          className="max-h-[300px] w-full object-contain drop-shadow-xl"
                        />

                        <div className="absolute bottom-8 right-8 max-w-xs rounded-2xl border border-border bg-card/90 p-4 shadow-lg backdrop-blur-md">
                          <div className="mb-2 flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2 text-primary">
                              <Icon className="h-5 w-5" />
                            </div>

                            <span className="text-sm font-bold text-foreground">
                              {slide.title === 'For Learners'
                                ? 'Skill Verified'
                                : slide.title === 'For Employers'
                                  ? 'Instant Verification'
                                  : 'NCVET Compliant'}
                            </span>
                          </div>

                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div className="h-full w-full bg-primary" />
                          </div>
                        </div>
                      </div>

                      {/* Content Side */}
                      <div className="flex flex-col justify-center p-8 lg:p-12">
                        <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
                          <Icon className="h-4 w-4" />
                          {slide.title}
                        </div>

                        <h3 className="mb-6 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                          {slide.heading}
                        </h3>

                        <p className="mb-8 text-lg font-light leading-relaxed text-muted-foreground">
                          {slide.description}
                        </p>

                        <div className="mb-10 space-y-4">
                          {slide.features.map((feature, featureIdx) => (
                            <div
                              key={featureIdx}
                              className="flex items-center gap-3 text-foreground"
                            >
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                ✓
                              </div>

                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>

                        <div>
                          <Button
                            size="lg"
                            onClick={() =>
                              navigate(`/login?role=${slide.role}`)
                            }
                          >
                            {slide.ctaText}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setIsPaused(true);
                  setCurrentSlide(idx);

                  setTimeout(() => {
                    setIsPaused(false);
                  }, 5000);
                }}
                className={`cursor-pointer rounded-full transition-all duration-300 ${
                  currentSlide === idx
                    ? 'h-3 w-12 bg-primary'
                    : 'h-3 w-3 bg-muted'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
