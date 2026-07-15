import { Button } from '@/components/ui/button.jsx';
import React from 'react';
import { Link } from 'react-router';

const NotFound = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-start p-10">
      <img src="/404.svg" alt="404_image" className="w-100" />
      <div className="text-4xl font-bold pr-1">404</div>
      <div className="text-lg">Page not found or not authorized</div>
      <Button variant="secondary" className="mt-4" asChild>
        <Link to="/">Go back</Link>
      </Button>
    </div>
  );
};

export default NotFound;
