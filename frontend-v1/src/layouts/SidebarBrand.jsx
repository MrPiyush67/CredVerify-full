import { Link } from 'react-router';
import { ShieldCheck } from 'lucide-react';

export default function SidebarBrand() {
  return (
    <div className="flex h-20 items-center gap-3 border-b border-border px-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <ShieldCheck className="h-5 w-5" />
      </div>

      <div className="flex flex-col">
        <Link
          to="/home"
          className="text-base font-semibold tracking-tight text-foreground"
        >
          CredVerify
        </Link>

        <span className="text-xs text-muted-foreground">
          Digital Credentials
        </span>
      </div>
    </div>
  );
}
