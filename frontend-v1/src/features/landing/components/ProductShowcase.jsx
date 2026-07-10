const ProductShowcase = () => (
  <section className="py-24 px-margin-desktop bg-surface-container-low">
    <div className="max-w-container-max mx-auto grid lg:grid-cols-2 gap-20 items-center">
      <div>
        <h2 className="text-[32px] font-bold leading-tight mb-6">
          Your Professional Identity, Unified.
        </h2>
        <p className="text-on-surface-variant text-lg mb-8 leading-relaxed">
          Manage your wallet, share specific credentials, and track who has
          verified your skills, all from an intuitive dashboard.
        </p>
        <ul className="space-y-4 mb-8">
          <li className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">
              check_circle
            </span>{' '}
            <span className="font-medium">Secure digital wallet</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">
              check_circle
            </span>{' '}
            <span className="font-medium">Customizable public profiles</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">
              check_circle
            </span>{' '}
            <span className="font-medium">Privacy-first sharing controls</span>
          </li>
        </ul>
        <button className="bg-primary text-white px-6 py-3 rounded font-semibold hover:bg-[#0c6b5f] transition-all">
          Explore Features
        </button>
      </div>
      <div className="relative">
        <div className="bg-white rounded-xl shadow-2xl border border-outline-variant/30 p-2 rotate-1">
          <div className="aspect-1.5/1 bg-surface-container-low rounded-lg overflow-hidden flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/20">
              dashboard
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default ProductShowcase;
