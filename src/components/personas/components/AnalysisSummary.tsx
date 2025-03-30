
import React from 'react';

interface AnalysisSummaryProps {
  aggregatedAnalysis: {
    dominantTone: string;
    dominantStyle: string;
    metrics: {
      formality: number;
      persuasiveness: number;
      clarity: number;
    };
    analysisCount: number;
  };
}

export function AnalysisSummary({ aggregatedAnalysis }: AnalysisSummaryProps) {
  return (
    <div className="bg-primary/10 p-4 rounded-md mb-6">
      <h3 className="font-semibold text-primary mb-2">Analysis Summary</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Dominant Tone:</span>
          <span className="font-medium">{aggregatedAnalysis.dominantTone}</span>
        </div>
        <div className="flex justify-between">
          <span>Writing Style:</span>
          <span className="font-medium">{aggregatedAnalysis.dominantStyle}</span>
        </div>
        <div className="flex justify-between">
          <span>Formality:</span>
          <span className="font-medium">{Math.round(aggregatedAnalysis.metrics.formality)}/10</span>
        </div>
        <div className="flex justify-between">
          <span>Persuasiveness:</span>
          <span className="font-medium">{Math.round(aggregatedAnalysis.metrics.persuasiveness)}/10</span>
        </div>
        <div className="flex justify-between">
          <span>Clarity:</span>
          <span className="font-medium">{Math.round(aggregatedAnalysis.metrics.clarity)}/10</span>
        </div>
      </div>
    </div>
  );
}
