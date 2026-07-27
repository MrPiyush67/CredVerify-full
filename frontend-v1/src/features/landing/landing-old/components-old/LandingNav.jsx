import React from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/shared/ui';
import { cn } from '@/shared/utils/cn';

export function LandingNav({
  scrolled,
  isMenuOpen,
  setIsMenuOpen,
  onLoginClick,
}) {
  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    if (sectionId === '') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        const offset = 80; // Account for fixed navbar
        const elementPosition =
          element.getBoundingClientRect().top + window.pageYOffset;
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
    <nav
      className={cn(
        'fixed w-full z-40 transition-all duration-300',
        scrolled
          ? 'bg-background/90 backdrop-blur-md border-b border-border py-3'
          : 'bg-transparent py-6',
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="CredVerify Logo" className="w-10 h-10" />
          <span className="text-2xl font-bold tracking-tight text-foreground">
            Cred<span className="text-primary">Verify</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => scrollToSection(e, link.sectionId)}
              className="text-muted-foreground hover:text-primary font-medium transition-colors text-sm tracking-wide"
            >
              {link.label}
            </a>
          ))}
          <Button onClick={onLoginClick}>Login / Sign Up</Button>
        </div>

        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-background shadow-md border-t border-border p-4 flex flex-col gap-4 md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-muted-foreground py-2 hover:text-primary"
              onClick={(e) => {
                scrollToSection(e, link.sectionId);
                setIsMenuOpen(false);
              }}
            >
              {link.label}
            </a>
          ))}
          <Button
            onClick={() => {
              onLoginClick();
              setIsMenuOpen(false);
            }}
          >
            Login
          </Button>
        </div>
      )}
    </nav>
  );
}
