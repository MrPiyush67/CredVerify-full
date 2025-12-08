import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LandingNav,
  HeroSection,
  StatsSection,
  FeaturesSection,
  HowItWorksSection,
  AboutSection,
  FAQSection,
  Footer,
  LoginModal
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

      <HowItWorksSection navigate={navigate} />

      <AboutSection onGetStarted={handleGetStarted} />

      <FAQSection onGetStarted={handleGetStarted} />

      <Footer />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        navigate={navigate}
      />

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-left {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in-right {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scroll-smooth { scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
        .animate-fade-in-down { animation: fade-in-down 0.6s ease-out forwards; }
        .animate-fade-in-left { animation: fade-in-left 0.6s ease-out forwards; }
        .animate-fade-in-right { animation: fade-in-right 0.6s ease-out forwards; }
        .animate-scale-up { animation: scale-up 0.3s ease-out forwards; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
