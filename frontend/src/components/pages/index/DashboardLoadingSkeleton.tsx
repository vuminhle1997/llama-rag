'use client';

import React from 'react';
import { useAppSelector } from '@/frontend/store/hooks/hooks';
import { selectAuthorized } from '@/frontend/store/reducer/app_reducer';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * DashboardLoadingSkeleton
 * ChatGPT‑like loading layout with:
 * - (Desktop / md+) Left navigation skeleton (shown here when NOT authorized to preserve prior logic)
 * - Messages area (centered, variable width lines & avatars)
 * - Bottom chat input bar
 * - Mobile: stacked layout (no persistent sidebar) with a top bar + messages + input
 * - Tablet (md): compact sidebar
 * - Desktop (lg+): wider sidebar
 */
export default function DashboardLoadingSkeleton() {
  const authorized = useAppSelector(selectAuthorized);

  // Generate message skeleton metadata for varied widths & alignment.
  const messages = React.useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => ({
        id: i,
        align: i % 2 === 0 ? 'left' : 'right',
        width: `${60 + ((i * 13) % 30)}%`, // deterministic variance 60% -> 89%
        lines: (i % 3) + 1, // 1–3 lines
      })),
    []
  );

  return (
    <div
      className="flex h-dvh w-full flex-col md:flex-row bg-background text-foreground"
      aria-busy="true"
      aria-label="Loading dashboard"
      role="status"
    >
      {/* Sidebar (kept conditional like original: only when NOT authorized) */}
      {!authorized && (
        <aside
          className={cn(
            'hidden md:flex md:flex-col border-r border-border/60 shrink-0',
            'md:w-56 lg:w-64 xl:w-72 px-4 py-4 gap-4'
          )}
        >
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-6 flex-1" />
          </div>
          <div className="space-y-2 mt-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-5/6" />
          </div>
          <div className="pt-4 space-y-1 flex-1 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton
                  className="h-4 flex-1"
                  style={{ width: `${50 + ((i * 17) % 45)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="space-y-2 pt-2 border-t border-border/60">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-3/4" />
          </div>
        </aside>
      )}

      {/* Mobile top bar (only when sidebar hidden / mobile) */}
      {!authorized && (
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border/60">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-8 rounded-full ml-auto" />
        </div>
      )}

      {/* Main Chat Column */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6">
          <div className="mx-auto w-full max-w-3xl space-y-6">
            {messages.map(m => (
              <div
                key={m.id}
                className={cn(
                  'flex gap-4 items-start',
                  m.align === 'right' && 'flex-row-reverse'
                )}
              >
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div
                  className={cn(
                    'flex flex-col gap-2 rounded-xl p-4 bg-muted/30 border border-border/40 w-full max-w-[85%]',
                    m.align === 'right' && 'items-end'
                  )}
                  style={{ width: m.width }}
                >
                  {Array.from({ length: m.lines }).map((_, li) => (
                    <Skeleton
                      key={li}
                      className={cn(
                        'h-4 w-full',
                        li === m.lines - 1 && 'w-2/3'
                      )}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Chat Input Bar */}
        <div className="border-t border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 px-3 sm:px-6 py-4">
          <div className="mx-auto max-w-3xl w-full flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-10 rounded-md" />
            </div>
            <div className="flex justify-center">
              <Skeleton className="h-3 w-40 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
