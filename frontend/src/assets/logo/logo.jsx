const Logo = (props) => {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/logo.svg"
        alt="Credify Logo"
        className="w-8 h-8 object-contain"
      />
      <span className="text-lg font-semibold tracking-tight">CredVerify</span>
    </div>
  );
};

export default Logo;
