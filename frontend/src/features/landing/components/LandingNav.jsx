import React from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/common/ui/Button';
import { cn } from '@/utils/helpers';

export function LandingNav({ scrolled, isMenuOpen, setIsMenuOpen, onLoginClick }) {
  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    if (sectionId === '') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        const offset = 80; // Account for fixed navbar
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    }
  };

  const navLinks = [
    { label: 'Home', href: '#', sectionId: '' },
    { label: 'Features', href: '#features', sectionId: 'features' },
    { label: 'How it Works', href: '#how-it-works', sectionId: 'how-it-works' },
    { label: 'About', href: '#about', sectionId: 'about' },
    { label: 'FAQ', href: '#faq', sectionId: 'faq' },
    { label: 'Contact Us', href: '#footer', sectionId: 'footer' },
  ];

  return (
    <nav className={cn(
      'fixed w-full z-40 transition-all duration-300',
      scrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/50 py-3' : 'bg-transparent py-6'
    )}>
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="CredVerify Logo" className="w-10 h-10" />
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Cred<span className="text-[#0F766E]">Verify</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => scrollToSection(e, link.sectionId)}
              className="text-slate-600 hover:text-[#0F766E] font-medium transition-colors text-sm tracking-wide"
            >
              {link.label}
            </a>
          ))}
          <Button onClick={onLoginClick} className="!bg-[#0F766E] !hover:bg-[#0F766E]/90 !text-white shadow-lg shadow-teal-900/20 hover:shadow-teal-900/30 transition-all">Login / Sign Up</Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-slate-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-lg border-t border-slate-100 p-4 flex flex-col gap-4 md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-slate-600 py-2"
              onClick={(e) => {
                scrollToSection(e, link.sectionId);
                setIsMenuOpen(false);
              }}
            >
              {link.label}
            </a>
          ))}
          <Button onClick={() => { onLoginClick(); setIsMenuOpen(false); }} className="!bg-[#0F766E] !hover:bg-[#0F766E]/90 !text-white w-full">Login</Button>
        </div>
      )}
    </nav>
  );
}
