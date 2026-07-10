import React from 'react';

export function Footer() {
  return (
    <footer
      id="footer"
      className="bg-foreground text-background/70 border-t border-background/10 pt-20 pb-10"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6">
              <span className="text-2xl font-bold text-background tracking-tight">
                Cred<span className="text-[#0F766E]">Verify</span>
              </span>
            </div>
            <p className="text-background/70 max-w-sm leading-relaxed font-light">
              The national standard for micro-credential aggregation and
              verification. Enabling a skilled workforce for tomorrow through
              blockchain-verified trust.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-background mb-6 tracking-wide">
              Platform
            </h4>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors duration-300 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />{' '}
                  Learner Portal
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors duration-300 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />{' '}
                  Employer Portal
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors duration-300 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />{' '}
                  Verification API
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors duration-300 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />{' '}
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-background mb-6 tracking-wide">
              Resources
            </h4>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors duration-300 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />{' '}
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors duration-300 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />{' '}
                  NCVET Guidelines
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors duration-300 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />{' '}
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors duration-300 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />{' '}
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-background/50">
          <p>&copy; 2025 CredVerify. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-primary transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
