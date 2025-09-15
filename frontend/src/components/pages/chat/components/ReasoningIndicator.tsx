'use client';

import React from 'react';

/**
 * Displays a visual indicator that the AI agent is currently reasoning or processing.
 *
 * This component shows an animated spinner, a status label ("Agent denkt"),
 * and three animated bouncing dots to indicate activity.
 * It is intended to be used in chat interfaces to inform users that the agent is thinking.
 *
 * @returns {JSX.Element} The reasoning indicator UI element.
 */
export default function ReasoningIndicator() {
  return (
    <div
      className="flex items-center justify-start pl-2 py-2 text-xs text-muted-foreground select-none pointer-events-none"
      aria-live="polite"
      aria-label="Der KI-Agent denkt gerade"
    >
      {/* Animated spinner */}
      <svg
        className="h-4 w-4 mr-2 animate-spin text-primary/70"
        viewBox="0 0 24 24"
        role="img"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-90"
          fill="currentColor"
          d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
        />
      </svg>
      <span className="tracking-wide font-medium uppercase mr-3">
        Agent denkt
      </span>
      <div className="flex items-center space-x-1">
        <span
          className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce"
          style={{ animationDelay: '0ms' }}
        ></span>
        <span
          className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce"
          style={{ animationDelay: '150ms' }}
        ></span>
        <span
          className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce"
          style={{ animationDelay: '300ms' }}
        ></span>
      </div>
    </div>
  );
}
