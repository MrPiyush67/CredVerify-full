import { motion } from 'framer-motion';

export default function AuthLayout({ children }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.12),_transparent_55%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_16px_40px_-20px_rgba(15,35,32,0.45)]">
            <span className="material-symbols-outlined text-[28px]">
              verified_user
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            CredVerify
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Secure credential discovery and verification.
          </p>
        </div>

        {children}

        <div className="mt-6 text-center text-xs uppercase tracking-[0.24em] text-muted-foreground">
          Protected by trusted identity infrastructure
        </div>
      </motion.div>
    </main>
  );
}
