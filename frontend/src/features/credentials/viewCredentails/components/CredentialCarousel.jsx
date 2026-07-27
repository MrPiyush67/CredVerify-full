import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

import { CredentialCard } from './CredentialCard.jsx';

export function CredentialCarousel({ title, credentials = [] }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction === 'left' ? -700 : 700,
      behavior: 'smooth',
    });
  };

  return (
    <section className="space-y-4">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>

          <Badge variant="secondary">{credentials.length}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" onClick={() => scroll('left')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button size="icon" variant="outline" onClick={() => scroll('right')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Cards */}

      <ScrollArea className="w-full whitespace-nowrap rounded-lg">
        <div ref={scrollRef} className="flex gap-6 pb-4">
          {credentials.map((credential) => (
            <CredentialCard key={credential.id} credential={credential} />
          ))}
        </div>

        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
