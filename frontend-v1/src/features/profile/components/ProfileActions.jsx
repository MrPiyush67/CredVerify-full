import { ArrowRight, Pencil } from 'lucide-react';
import { Button } from '@/shared/ui';

export default function ProfileActions({ isOwner, onEdit }) {
  return (
    <div className="flex gap-3">
      <Button variant="outline">
        Share
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>

      {isOwner && (
        <Button onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      )}
    </div>
  );
}
