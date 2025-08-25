'use client';

import React, { useState } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LayoutProvider from './LayoutProvider';

/**
 * TanstackProvider component that sets up the QueryClientProvider with default options
 * and includes the LayoutProvider and ReactQueryDevtools.
 *
 * @param {Object} props - The props object.
 * @param {React.ReactNode} props.children - The child components to be rendered within the provider.
 *
 * @returns {JSX.Element} The QueryClientProvider component wrapping the children with the specified configuration.
 */
const TanstackProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: false, // Disable automatic retries
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LayoutProvider>{children}</LayoutProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default TanstackProvider;
