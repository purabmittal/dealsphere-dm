'use client';

import { useState } from 'react';

export default function InfoDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-skyblue-dark sm:hidden"
      >
        Client Info
      </button>

      {/* Desktop: always visible as a right column */}
      <div className="hidden w-72 shrink-0 border-l border-gray-100 bg-white p-4 sm:block">
        {children}
      </div>

      {/* Mobile: bottom drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40 sm:hidden">
          <div className="max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-navy">Client Info</h3>
              <button onClick={() => setOpen(false)} className="text-navy/50">
                ✕
              </button>
            </div>
            {children}
          </div>
        </div>
      )}
    </>
  );
}
