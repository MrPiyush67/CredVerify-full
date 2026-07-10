import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router';
import { Toaster } from 'react-hot-toast';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { queryClient } from '@/shared/lib/query-client';
import AppRoutes from './routes.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {/* routes */}
          <AppRoutes />
          {/* toast */}
          <Toaster position="top-right" />
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
