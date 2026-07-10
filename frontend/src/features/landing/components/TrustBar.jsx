const TrustBar = () => {
  const logos = [
    'Google',
    'Microsoft',
    'AWS',
    'Coursera',
    'Oracle',
    'IBM',
    'Cisco',
    'Adobe',
  ];
  return (
    <section className="py-16 border-y border-outline-variant/30 bg-white overflow-hidden">
      <div className="max-w-container-max mx-auto px-margin-desktop mb-8 text-center text-xs font-bold text-on-surface-variant uppercase tracking-widest">
        Trusted by leading issuers and universities globally
      </div>
      <div className="flex whitespace-nowrap animate-infinite-scroll">
        {[...logos, ...logos].map((logo, idx) => (
          <div
            key={idx}
            className="mx-16 text-xl font-bold text-on-surface-variant/40"
          >
            {logo}
          </div>
        ))}
      </div>
    </section>
  );
};
export default TrustBar;
