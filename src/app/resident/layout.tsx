'use client';

import React from 'react';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-20 lg:pb-6">
      {children}
      <MobileBottomNav />
    </div>
  );
}
