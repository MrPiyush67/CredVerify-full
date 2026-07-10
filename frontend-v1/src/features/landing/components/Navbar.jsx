import { Link } from "react-router";

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-outline-variant/30 h-20 flex items-center">
    <div className="max-w-container-max mx-auto px-margin-desktop w-full flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-xl fill-[1]">
            verified_user
          </span>
        </div>
        <span className="text-xl font-bold tracking-tight text-on-surface">
          CredVerify
        </span>
      </div>
      <div className="hidden md:flex items-center gap-10">
        <a
          href="#platform"
          className="text-sm font-semibold text-primary border-b-2 border-primary py-1"
        >
          Platform
        </a>
        <a
          href="#community"
          className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
        >
          Community
        </a>
        <a
          href="#verify"
          className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
        >
          Verify
        </a>
        <a
          href="#docs"
          className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
        >
          Documentation
        </a>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/login" className="text-sm font-semibold px-4 py-2 hover:text-primary transition-colors">
          Sign In
        </Link>
        <Link to="/signup" className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-[#0c6b5f] transition-all">
          Sign Up
        </Link>
      </div>
    </div>
  </nav>
);
export default Navbar;
