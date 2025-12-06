import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes.jsx';
import { store } from './store.js';
import ErrorBoundary from '../common/components/ErrorBoundary.jsx';
import { Loader } from '@common';


export default function App() {
  return (
    // redux store
    <Provider store={store}>
      {/* browser routing */}
      <BrowserRouter>
        <ErrorBoundary>
          {/* lazy loading handler */}
          <Suspense fallback={<Loader type="page" />}>

            <AppRoutes />

            <Toaster position="top-right" />
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </Provider>
  );
}
