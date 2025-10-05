'use client';

import dynamic from 'next/dynamic';
import { IncidentReportButton } from '@/components/features/incident';

const MapBackground = dynamic(() => import('@/components/features/map/MapBackground'), {
  ssr: false,
});

const SidePanel = dynamic(() => import('@/components/layout/SidePanel'), {
  ssr: false,
});

export default function ClientLayout() {
  return (
    <>
      <MapBackground />
      <SidePanel
        width={400}
        left={10}
        background="rgba(255, 255, 255, 0.95)"
        pointerEvents="auto"
      />
      <IncidentReportButton />
    </>
  );
}