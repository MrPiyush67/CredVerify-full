import React from 'react';
import { Award, Briefcase, Building, ShieldCheck } from 'lucide-react';
import { Button } from '@/common/ui/Button';
import { Card } from '@/common/ui/Card';

const IMAGES = {
  userSlide: "/landing/user-3.png",
  employerSlide: "/landing/employer.png",
  adminSlide: "/landing/admin-3.png",
};

const slides = [
  {
    role: 'learner',
    icon: Award,
    iconColor: 'text-[#0F766E]',
    bgColor: 'bg-teal-50',
    accentColor: 'bg-teal-50',
    image: IMAGES.userSlide,
    title: 'For Learners',
    heading: 'Build Your Digital Credential Portfolio',
    description: 'Access your unified dashboard to view all credentials, track verification status, and showcase your verified skills to employers. Manage certificates from universities, online platforms, and training institutes in one place.',
    features: [
      'Unified credential dashboard with verification badges',
      'DigiLocker integration for government-verified documents',
      'Track learning progress and skill endorsements',
      'Share verified credentials instantly with employers'
    ],
    ctaText: 'Get Started Free'
  },
  {
    role: 'employer',
    icon: Briefcase,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
    accentColor: 'bg-purple-50',
    image: IMAGES.employerSlide,
    title: 'For Employers',
    heading: 'Verify Candidates Instantly',
    description: 'Access comprehensive candidate profiles with verified credentials, skills assessment, and educational background. Review detailed analytics, certification status, and hire with complete confidence using our real-time verification system.',
    features: [
      'Real-time credential verification and skill validation',
      'Detailed candidate analytics and assessment reports',
      'Streamlined hiring with zero credential fraud'
    ],
    ctaText: 'Start Hiring'
  },
  {
    role: 'regulator',
    icon: Building,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    accentColor: 'bg-blue-50',
    image: IMAGES.adminSlide,
    title: 'For Institutions',
    heading: 'Manage & Issue Credentials',
    description: 'Comprehensive admin dashboard to manage institutional credentials, monitor verification processes, and track user analytics. Issue blockchain-secured certificates, oversee credential validation, and maintain complete control over your institution\'s digital credentialing system.',
    features: [
      'Centralized credential management and issuance',
      'Real-time analytics and verification tracking',
      'NCVET compliant with blockchain security'
    ],
    ctaText: 'Become a Partner'
  }
];

export function HowItWorksSection({ navigate }) {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const isScrollingRef = React.useRef(false);
  const sectionRef = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
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

  React.useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  React.useEffect(() => {
    const container = document.getElementById('slides-container');
    if (container) {
      isScrollingRef.current = true;
      const slideWidth = container.scrollWidth / 3;
      requestAnimationFrame(() => {
        container.scrollTo({ left: slideWidth * currentSlide, behavior: 'smooth' });
      });
      setTimeout(() => { isScrollingRef.current = false; }, 1000);
    }
  }, [currentSlide]);

  return (
    <section ref={sectionRef} id="how-it-works" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Designed for the Future of Work</h2>
          <p className="text-slate-600 leading-relaxed text-lg max-w-3xl mx-auto">
            Whether you are a student adding a new micro-credential, an employer looking for specific skill sets, or a regulator monitoring quality, CredVerify simplifies the entire lifecycle.
          </p>
        </div>

        <div className="relative">
          <div
            id="slides-container"
            className="flex gap-0 overflow-x-scroll snap-x snap-mandatory scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {slides.map((slide, idx) => (
              <div key={idx} className="min-w-full snap-center snap-always px-4">
                <Card className="bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 h-full">
                  <div className="grid lg:grid-cols-2 gap-0 lg:h-[600px]">
                    <div className={`relative h-[400px] lg:h-full ${slide.bgColor} flex items-center justify-center p-8`}>
                      <img src={slide.image} alt={`${slide.title} dashboard`} className="w-full max-h-[300px] object-contain drop-shadow-xl" />

                      <div className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 max-w-xs">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 ${slide.accentColor} rounded-lg ${slide.iconColor}`}>
                            <slide.icon className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-slate-900 text-sm">{slide.title === 'For Learners' ? 'Skill Verified' : slide.title === 'For Employers' ? 'Instant Verification' : 'NCVET Compliant'}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className={`bg-[#0F766E] w-full h-full`} />
                        </div>
                      </div>
                    </div>

                    <div className="p-8 lg:p-12 flex flex-col justify-center">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${slide.accentColor} ${slide.iconColor} text-sm font-bold mb-8 w-fit`}>
                        <slide.icon className="w-4 h-4" /> {slide.title}
                      </div>
                      <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">{slide.heading}</h3>
                      <p className="text-slate-600 mb-8 leading-relaxed text-lg font-light">
                        {slide.description}
                      </p>

                      <div className="space-y-4 mb-10">
                        {slide.features.map((feature, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-3 text-slate-700">
                            <div className={`w-6 h-6 rounded-full ${slide.accentColor} flex items-center justify-center ${slide.iconColor} font-bold shrink-0 text-xs`}>✓</div>
                            <span className="font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div>
                        <Button onClick={() => navigate(`/login?role=${slide.role}`)} className="h-12 px-8 text-base shadow-lg shadow-slate-200 hover:shadow-xl transition-all">
                          {slide.ctaText}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-3 mt-8 items-center">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setIsPaused(true);
                  setCurrentSlide(idx);
                  setTimeout(() => setIsPaused(false), 5000);
                }}
                className={`rounded-full transition-all duration-300 cursor-pointer hover:opacity-80 ${currentSlide === idx
                    ? 'bg-[#0F766E] w-12 h-3'
                    : 'bg-slate-200 w-3 h-3'
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
