const ProblemSection = () => (
  <section
    id="verify"
    className="py-24 px-margin-desktop bg-surface-container-low"
  >
    <div className="max-w-container-max mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">The credential chaos</h2>
        <p className="text-on-surface-variant max-w-2xl mx-auto">
          Certificates are scattered across emails, PDFs, and proprietary
          portals. Verifying them takes days.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-2xl border border-outline-variant/30 card-shadow relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/20">
            <span className="font-bold text-error">Before CredVerify</span>
            <span className="material-symbols-outlined text-error">close</span>
          </div>
          <div className="space-y-6 opacity-40">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-surface-container rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/2 bg-surface-container rounded"></div>
                  <div className="h-2 w-1/3 bg-surface-container rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-primary/5 p-10 rounded-2xl border border-primary/20 card-shadow relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-primary/20">
            <span className="font-bold text-primary">With CredVerify</span>
            <span className="material-symbols-outlined text-primary">
              check
            </span>
          </div>
          <div className="bg-white p-6 rounded-xl border border-outline-variant/30 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">account_circle</span>
            </div>
            <div className="flex-1">
              <div className="h-3 w-32 bg-primary/20 rounded mb-2"></div>
              <div className="h-2 w-20 bg-primary/10 rounded"></div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-2 w-12 bg-primary/20 rounded"></div>
              <div className="h-2 w-8 bg-primary/10 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
export default ProblemSection;