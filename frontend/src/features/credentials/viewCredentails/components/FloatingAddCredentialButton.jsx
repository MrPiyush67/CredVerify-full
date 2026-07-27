import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function FloatingAddCredentialButton() {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            className="
              fixed
              bottom-8
              right-8
              z-50
              h-12
              w-12
              rounded-2xl
              shadow-lg
              transition-all
              duration-200
              hover:scale-105
              active:scale-95
            "
          >
            <Plus className="h-5 w-5" />
          </Button>
        </TooltipTrigger>

        <TooltipContent side="left">Add Credential</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
