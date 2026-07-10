const Footer = () => (
  <footer className="py-20 px-margin-desktop bg-white border-t border-outline-variant/30">
    <div className="max-w-container-max mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10 mb-16">
        <div className="col-span-2 lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl fill-[1]">
                verified_user
              </span>
            </div>
            <span className="text-xl font-bold tracking-tight">CredVerify</span>
          </div>
          <p className="text-sm text-on-surface-variant mb-6 max-w-xs leading-relaxed">
            Building the standard for verifiable professional identity. Secure,
            instant, and borderless.
          </p>
          <p className="text-xs text-on-surface-variant/60">
            © 2024 CredVerify Inc. All rights reserved.
          </p>
        </div>
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-widest text-primary mb-6">
            Product
          </h4>
          <ul className="space-y-4 text-xs font-bold text-on-surface-variant">
            <li>
              <a href="#" className="hover:text-primary">
                Platform
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary">
                Issuer Portal
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary">
                Wallet
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary">
                Pricing
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-widest text-primary mb-6">
            Resources
          </h4>
          <ul className="space-y-4 text-xs font-bold text-on-surface-variant">
            <li>
              <a href="#" className="hover:text-primary">
                Documentation
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary">
                Developers API
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary">
                Community
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary">
                Help Center
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-widest text-primary mb-6">
            Company
          </h4>
          <ul className="space-y-4 text-xs font-bold text-on-surface-variant">
            <li>
              <a href="#" className="hover:text-primary">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary">
                Careers
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary">
                Blog
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary">
                Contact
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-widest text-primary mb-6">
            Legal
          </h4>
          <ul className="space-y-4 text-xs font-bold text-on-surface-variant">
            <li>
              <a href="#" className="hover:text-primary">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary">
                Security
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;