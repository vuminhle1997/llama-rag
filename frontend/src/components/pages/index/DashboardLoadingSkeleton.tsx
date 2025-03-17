'use client';

import React from 'react';
import { useAppSelector } from '@/frontend/store/hooks/hooks';
import { selectAuthorized } from '@/frontend/store/reducer/app_reducer';

/**
 * A functional component that renders a loading skeleton for the dashboard.
 * It displays different skeletons based on the authentication status.
 *
 * @returns {JSX.Element} The loading skeleton for the dashboard.
 */
export default function DashboardLoadingSkeleton() {
  const authorized = useAppSelector(selectAuthorized);
  return (
    <div className="flex h-screen w-screen">
      {!authorized && <div className="w-[20rem] border-r animate-pulse">
        <div className="p-4">
          <div className="h-12 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-10 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 h-24 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border-t">
          <div className="max-w-3xl mx-auto">
            <div className="h-12 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
