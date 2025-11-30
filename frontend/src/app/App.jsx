import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes.jsx';
import { store } from './store.js';
import ErrorBoundary from '../common/components/ErrorBoundary.jsx';
import { Loader } from '@common';

function AppContent() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<Loader type="page" />}>
          <AppRoutes />
          <Toaster position="top-right" />
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
