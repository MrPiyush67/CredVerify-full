const BentoGrid = () => (
  <section className="py-24 px-margin-desktop bg-white">
    <div className="max-w-container-max mx-auto">
      <h2 className="text-3xl font-bold mb-12 text-center">
        Everything you need
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-150">
        <div className="md:col-span-2 md:row-span-1 bg-primary/5 border border-primary/20 rounded-2xl p-8 flex flex-col justify-between hover:bg-primary/10 transition-colors">
          <div>
            <h3 className="text-2xl font-bold mb-2">Unified Wallet</h3>
            <p className="text-on-surface-variant text-sm">
              Keep all your professional achievements in one place.
            </p>
          </div>
          <div className="mt-4">
            <span className="material-symbols-outlined text-5xl text-primary">
              account_balance_wallet
            </span>
          </div>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-8 flex flex-col items-center text-center justify-center hover:bg-surface-container transition-colors">
          <h3 className="text-2xl font-bold mb-2">Share Link & QR</h3>
          <p className="text-on-surface-variant text-sm mb-6">
            Easily share your verified profile anywhere.
          </p>
          <div className="bg-white p-4 rounded-xl border border-outline-variant/30 shadow-sm">
            <span className="material-symbols-outlined text-4xl">
              qr_code_2
            </span>
          </div>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-8 flex flex-col justify-between hover:bg-surface-container transition-colors">
          <h3 className="text-2xl font-bold mb-2">Instant Verification</h3>
          <p className="text-on-surface-variant text-sm">
            Cryptographic proof in milliseconds.
          </p>
          <div className="mt-4">
            <span className="material-symbols-outlined text-5xl text-primary">
              verified
            </span>
          </div>
        </div>
        <div className="md:col-span-2 md:row-span-1 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-8 flex items-center justify-between hover:bg-surface-container transition-colors">
          <div className="max-w-sm">
            <h3 className="text-2xl font-bold mb-2">Organization Portal</h3>
            <p className="text-on-surface-variant text-sm">
              Powerful tools for issuers to manage credentials at scale via UI
              or API.
            </p>
          </div>
          <span className="material-symbols-outlined text-7xl text-on-surface-variant/20 hidden sm:block">
            corporate_fare
          </span>
        </div>
      </div>
    </div>
  </section>
);

export default BentoGrid;
