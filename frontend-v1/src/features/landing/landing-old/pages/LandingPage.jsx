import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  LandingNav,
  HeroSection,
  StatsSection,
  FeaturesSection,
  HowItWorksSection,
  AboutSection,
  FAQSection,
  Footer,
  LoginModal,
} from '../components';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => setIsLoginOpen(true);

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <LandingNav
        scrolled={scrolled}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onLoginClick={handleGetStarted}
      />

      <HeroSection onGetStarted={handleGetStarted} />

      <StatsSection />

      <FeaturesSection />

      <HowItWorksSection />

      <AboutSection onGetStarted={handleGetStarted} />

      <FAQSection onGetStarted={handleGetStarted} />

      <Footer />

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
