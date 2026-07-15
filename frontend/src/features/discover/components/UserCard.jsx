import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import React from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router';

const UserCard = ({ user }) => {
  return (
    <Card
      key={user?._id}
      className="transition-colors hover:border-primary min-h-[184px]"
    >
      <CardContent className="flex justify-between gap-6 min-h-[136px]">
        {/* Left */}
        <div className="flex flex-1 items-start gap-4">
          <Avatar className="size-12 shrink-0">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>{user?.name[0]}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-base font-semibold">{user?.name}</h2>

              <Badge variant="secondary" className="capitalize">
                {user?.role.replace('_', ' ')}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">@{user?.username}</p>

            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {user?.bio}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {user?.location && (
                <Badge variant="outline">📍 {user?.location}</Badge>
              )}

              {user?.education?.length > 0 && (
                <Badge variant="outline">
                  🎓 {user?.education[0].institution}
                </Badge>
              )}

              {user?.experience?.length > 0 && (
                <Badge variant="outline">
                  💼 {user?.experience[0].company}
                </Badge>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {user?.skills.slice(0, 5).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-[11px]">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex self-stretch w-36 shrink-0 flex-col justify-between items-center">
          <div className="space-y-2">
            <Button className="w-full" asChild>
              <Link to={`/profile/${user?.username}`}>View Profile</Link>
            </Button>

            <Button variant="outline" className="w-full" asChild>
              <Link onClick={() => toast('Coming Soon')}>Message</Link>
            </Button>
          </div>

          <div className="text-right text-xs text-muted-foreground">
            Joined:{' '}
            {user?.createdAt ? new Date(user?.createdAt).toDateString() : 'N/A'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
