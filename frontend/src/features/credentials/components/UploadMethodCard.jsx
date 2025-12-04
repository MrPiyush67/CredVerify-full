export default function UploadMethodCard({ method }) {
  return (
    <button
      onClick={method.onClick}
      className="text-left border rounded-lg p-6 hover:bg-gray-50 hover:border-[#116466] transition-all shadow-sm"
    >
      <div className="flex flex-col gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-[#116466] text-white">
          <method.icon className="h-6 w-6" />
        </span>
        <div>
          <div className="font-semibold text-lg mb-1">{method.title}</div>
          <div className="text-sm text-muted-foreground">{method.description}</div>
        </div>
      </div>
    </button>
  );
}
