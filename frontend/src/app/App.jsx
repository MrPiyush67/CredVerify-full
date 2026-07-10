import React from 'react';
import { BrowserRouter } from 'react-router';
import { Toaster } from 'react-hot-toast';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from 'react-error-boundary';

import ErrorBoundaryFallback from './components/ErrorBoundaryFallback.jsx';
import { queryClient } from '@/lib/queryClient';
import AppRoutes from './routes.jsx';
// import Test from './test.jsx';

export default function App() {
  return (
    <>
      <ErrorBoundary fallbackRender={<ErrorBoundaryFallback />} />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>

          <AppRoutes />
          {/* <Test /> */}

        </BrowserRouter>
          <Toaster position="top-right" />
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      </QueryClientProvider>
    </>
  );
}
