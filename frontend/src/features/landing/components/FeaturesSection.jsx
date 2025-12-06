import React from 'react';
import { Layers, ShieldCheck, Briefcase, Award, Globe, FileText } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

const features = [
  {
    icon: Layers,
    title: "Centralized Aggregation",
    description: "Collect micro-credentials from universities, ed-tech platforms, and training centers into one cohesive dashboard."
  },
  {
    icon: ShieldCheck,
    title: "Blockchain Verification",
    description: "Tamper-proof credential validation using blockchain technology and DigiLocker integration."
  },
  {
    icon: Briefcase,
    title: "Employer Recognition",
    description: "Employers can instantly verify skill sets, reducing hiring time and ensuring trust in candidates."
  },
  {
    icon: Award,
    title: "NSQF Alignment",
    description: "Credentials are mapped to National Skills Qualifications Framework levels for better credit transfer."
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description: "Inclusive design with support for multiple regional languages to empower every learner."
  },
  {
    icon: FileText,
    title: "Smart CV Generation",
    description: "Automatically generate a verified, skill-based CV that highlights your proven competencies."
  }
];

export function FeaturesSection() {
  const [isVisible, setIsVisible] = React.useState(false);
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

  return (
    <section ref={sectionRef} id="features" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-teal-50/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-50/40 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block mb-6">
            <span className="text-sm font-semibold text-[#0F766E] uppercase tracking-wider px-4 py-1.5 bg-teal-50/50 rounded-full border border-teal-100 backdrop-blur-sm">
              Why CredVerify?
            </span>
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            A Unified Ecosystem for <span className="text-[#0F766E]">Skills</span>
          </h3>
          <p className="text-slate-600 leading-relaxed">
            We solve the fragmentation problem by bringing learners, training providers, and employers onto a single, trusted platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
