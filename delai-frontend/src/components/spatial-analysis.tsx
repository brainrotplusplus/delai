"use client";

import { AccessibilityAnalysis } from "./spatial-analysis/accessibility-analysis";
import { StopPlanning } from "./spatial-analysis/stop-planning";
import { DensityAnalysis } from "./spatial-analysis/density-analysis";
import { AccessibilityImprovements } from "./spatial-analysis/accessibility-improvements";

export function SpatialAnalysis() {
  return (
    <div className="space-y-8 overflow-hidden">
      <div className="space-y-3">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent animate-fade-in-up">
          Analiza Przestrzenna
        </h2>
        <p className="text-white/60 text-lg leading-relaxed animate-fade-in-up animation-delay-100">
          Analiza wzorców przestrzennych i optymalizacja rozmieszczenia
          infrastruktury transportowej
        </p>
      </div>

      <div className="space-y-8 overflow-y-hidden">
        <div className="animate-fade-in-up animation-delay-200">
          <AccessibilityAnalysis />
        </div>
        <div className="animate-fade-in-up animation-delay-300">
          <StopPlanning />
        </div>
        <div className="animate-fade-in-up animation-delay-400">
          <DensityAnalysis />
        </div>
        <div className="animate-fade-in-up animation-delay-500">
          <AccessibilityImprovements />
        </div>
      </div>
    </div>
  );
}
