import { LoaderCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

function Loader({ size = 'size-4' }) {
  return <LoaderCircle className={cn('animate-spin', size)} />;
}

export { Loader };
