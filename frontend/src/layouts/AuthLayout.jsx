import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-ink)] flex flex-col">
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

