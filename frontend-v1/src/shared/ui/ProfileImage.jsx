import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './Avatar.jsx';

const getInitials = (name = '') => {
  const trimmed = name.trim();
  if (!trimmed) return 'U';

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export default function ProfileImage({
  src,
  name,
  title,
  className = '',
  fallbackClassName = '',
  imageClassName = '',
  alt,
}) {
  const fallbackLabel = title || name || 'User';
  const initials = getInitials(name || fallbackLabel);

  return (
    <Avatar className={className}>
      {src ? (
        <AvatarImage
          src={src}
          alt={alt || fallbackLabel}
          className={imageClassName}
        />
      ) : null}
      <AvatarFallback className={fallbackClassName}>{initials}</AvatarFallback>
    </Avatar>
  );
}
