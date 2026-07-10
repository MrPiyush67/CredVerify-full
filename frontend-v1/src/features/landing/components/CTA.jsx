const CTA = () => (
  <section id="start" className="py-24 px-margin-desktop bg-primary">
    <div className="max-w-container-max mx-auto text-center text-white">
      <h2 className="text-4xl font-bold mb-6">
        Ready to own your professional identity?
      </h2>
      <p className="text-primary-container text-lg mb-12 max-w-2xl mx-auto">
        Join over 500,000 professionals who have verified their skills with
        CredVerify.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <button className="bg-white text-primary px-10 py-4 rounded font-bold text-sm uppercase tracking-wider hover:bg-surface-container transition-all">
          Create Free Account
        </button>
        <button className="bg-transparent border-2 border-white/30 text-white px-10 py-4 rounded font-bold text-sm uppercase tracking-wider hover:bg-white/10 transition-all">
          Contact Sales
        </button>
      </div>
    </div>
  </section>
);
export default CTA;