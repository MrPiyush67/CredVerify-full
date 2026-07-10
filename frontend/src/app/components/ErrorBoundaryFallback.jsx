import React from 'react';

const ErrorBoundaryFallback = ({ error, resetErrorBoundary }) => (
  <div role="alert">
    <p>Something went wrong:</p>
    <pre>{getErrorMessage(error)}</pre>
    <button onClick={resetErrorBoundary}>Try again</button>
  </div>
);

export default ErrorBoundaryFallback;
