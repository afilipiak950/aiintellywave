
import { EmailAnalysis, AIPersona } from '@/types/persona';
import { predefinedStyles } from '@/utils/persona-utils';

export const aggregateAnalysisResults = (analyses: EmailAnalysis[]): any => {
  // Initialize accumulators
  const tones: Record<string, number> = {};
  const styles: Record<string, number> = {};
  const characteristics: Record<string, number> = {};
  const metrics = {
    formality: 0,
    persuasiveness: 0,
    clarity: 0
  };
  
  // Process each analysis
  analyses.forEach(analysis => {
    // Aggregate tones
    if (analysis.tone_analysis?.primary) {
      tones[analysis.tone_analysis.primary] = (tones[analysis.tone_analysis.primary] || 0) + 1;
    }
    
    // Aggregate styles
    if (analysis.style_metrics?.style?.primary) {
      styles[analysis.style_metrics.style.primary] = (styles[analysis.style_metrics.style.primary] || 0) + 1;
    }
    
    // Aggregate characteristics
    if (analysis.style_metrics?.style?.characteristics) {
      analysis.style_metrics.style.characteristics.forEach((characteristic: string) => {
        characteristics[characteristic] = (characteristics[characteristic] || 0) + 1;
      });
    }
    
    // Aggregate metrics
    if (analysis.style_metrics?.metrics) {
      metrics.formality += analysis.style_metrics.metrics.formality || 0;
      metrics.persuasiveness += analysis.style_metrics.metrics.persuasiveness || 0;
      metrics.clarity += analysis.style_metrics.metrics.clarity || 0;
    }
  });
  
  // Calculate averages for metrics
  const count = analyses.length;
  metrics.formality = metrics.formality / count;
  metrics.persuasiveness = metrics.persuasiveness / count;
  metrics.clarity = metrics.clarity / count;
  
  // Find dominant tone and style
  const dominantTone = Object.entries(tones).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Neutral';
  const dominantStyle = Object.entries(styles).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Casual';
  
  // Find top characteristics
  const topCharacteristics = Object.entries(characteristics)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);
  
  return {
    dominantTone,
    dominantStyle,
    topCharacteristics,
    metrics: {
      formality: Math.round(metrics.formality * 10) / 10,
      persuasiveness: Math.round(metrics.persuasiveness * 10) / 10,
      clarity: Math.round(metrics.clarity * 10) / 10
    },
    allTones: tones,
    allStyles: styles,
    allCharacteristics: characteristics,
    analysisCount: count,
  };
};

export const generateSuggestedPersona = (aggregatedAnalysis: any): Partial<AIPersona> => {
  // Map the dominant style to a predefined style option
  const matchedStyle = predefinedStyles.find(style => 
    style.name.toLowerCase().includes(aggregatedAnalysis.dominantStyle.toLowerCase()) ||
    style.tone.toLowerCase().includes(aggregatedAnalysis.dominantStyle.toLowerCase())
  )?.id || 'professional';
  
  // Generate a name based on style and tone
  const namePrefix = aggregatedAnalysis.metrics.formality > 7 ? 'Professional' : 
                  aggregatedAnalysis.metrics.formality > 4 ? 'Balanced' : 'Casual';
  
  // Select appropriate function based on metrics
  let suggestedFunction = 'follow-up';
  if (aggregatedAnalysis.metrics.persuasiveness > 7) {
    suggestedFunction = 'sales';
  } else if (aggregatedAnalysis.dominantStyle.toLowerCase().includes('formal')) {
    suggestedFunction = 'proposal';
  }
  
  // Create a comprehensive prompt based on analysis
  const generateAnalysisPrompt = () => {
    return `Act as a professional communicator with a ${aggregatedAnalysis.dominantTone.toLowerCase()} tone.
Your communication style should be ${aggregatedAnalysis.dominantStyle.toLowerCase()}, with these key characteristics:
${aggregatedAnalysis.topCharacteristics.map((c: string) => `- ${c}`).join('\n')}

Maintain a formality level of ${Math.round(aggregatedAnalysis.metrics.formality)}/10.
Focus on being clear (${Math.round(aggregatedAnalysis.metrics.clarity)}/10) and persuasive (${Math.round(aggregatedAnalysis.metrics.persuasiveness)}/10).

Adapt to the recipient's needs while maintaining consistency in tone and style across all communications.
This persona is designed based on the analysis of ${aggregatedAnalysis.analysisCount} email${aggregatedAnalysis.analysisCount !== 1 ? 's' : ''}.`;
  };
  
  const persona: Partial<AIPersona> = {
    name: `${namePrefix} ${aggregatedAnalysis.dominantTone} Communicator`,
    style: matchedStyle,
    function: suggestedFunction,
    prompt: generateAnalysisPrompt(),
  };
  
  return persona;
};
