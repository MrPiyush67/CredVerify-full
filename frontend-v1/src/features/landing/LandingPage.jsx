import { useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import TrustBar from './components/TrustBar.jsx';
import ProblemSection from './components/ProblemSection.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import ProductShowcase from './components/ProductShowcase.jsx';
import BentoGrid from './components/BentoGrid.jsx';
import ProfilePreview from './components/ProfilePreview.jsx';
import FrictionlessVerification from './components/FrictionlessVerification.jsx';
import CommunitySection from './components/CommunitySection.jsx';
import IssuerPortal from './components/IssuerPortal.jsx';
import Testimonials from './components/Testimonials.jsx';
import FAQ from './components/FAQ.jsx';
import CTA from './components/CTA.jsx';
import Footer from './components/Footer.jsx';

const LandingPage = () => {
  useEffect(() => {
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-in-up').forEach((el) => {
      el.classList.add(
        'transition-all',
        'duration-700',
        'opacity-0',
        'translate-y-10',
      );
      observer.observe(el);
    });
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <ProblemSection />
        <HowItWorks />
        <ProductShowcase />
        <BentoGrid />
        <ProfilePreview />
        <FrictionlessVerification />
        <CommunitySection />
        <IssuerPortal />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
