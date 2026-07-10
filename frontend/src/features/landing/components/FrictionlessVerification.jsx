const FrictionlessVerification = () => (
  <section className="py-24 px-margin-desktop bg-white">
    <div className="max-w-container-max mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">Frictionless Verification</h2>
        <p className="text-on-surface-variant">
          Trust is built-in. Verifying a credential takes seconds, not weeks.
        </p>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
        <div className="bg-white border border-outline-variant/30 p-8 rounded-2xl flex flex-col items-center text-center flex-1 w-full">
          <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-on-surface-variant">
              document_scanner
            </span>
          </div>
          <h4 className="font-bold text-sm mb-1">Scan or Click</h4>
          <p className="text-[11px] text-on-surface-variant">
            Employer scans QR or clicks link.
          </p>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant/30 rotate-90 md:rotate-0">
          arrow_forward
        </span>
        <div className="bg-primary/5 border border-primary/30 p-8 rounded-2xl flex flex-col items-center text-center flex-1 w-full scale-105">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
            <span className="material-symbols-outlined">
              enhanced_encryption
            </span>
          </div>
          <h4 className="font-bold text-sm mb-1">Cryptographic Check</h4>
          <p className="text-[11px] text-on-surface-variant">
            System verifies issuer signature instantly.
          </p>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant/30 rotate-90 md:rotate-0">
          arrow_forward
        </span>
        <div className="bg-white border border-outline-variant/30 p-8 rounded-2xl flex flex-col items-center text-center flex-1 w-full">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-4 text-emerald-600">
            <span className="material-symbols-outlined">task_alt</span>
          </div>
          <h4 className="font-bold text-sm mb-1">Verified</h4>
          <p className="text-[11px] text-on-surface-variant">
            100% confidence in authenticity.
          </p>
        </div>
      </div>
    </div>
  </section>
);
export default FrictionlessVerification;