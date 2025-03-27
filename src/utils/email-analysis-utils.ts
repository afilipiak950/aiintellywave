
import { EmailAnalysis, AIPersona } from '@/types/persona';
import { predefinedStyles } from '@/utils/persona-utils';

export const aggregateAnalysisResults = (analyses: EmailAnalysis[]): any => {
  // Simple aggregation logic - can be enhanced based on requirements
  const tones: Record<string, number> = {};
  const styles: Record<string, number> = {};
  const metrics = {
    formality: 0,
    persuasiveness: 0,
    clarity: 0
  };
  
  analyses.forEach(analysis => {
    // Aggregate tones
    if (analysis.tone_analysis?.primary) {
      tones[analysis.tone_analysis.primary] = (tones[analysis.tone_analysis.primary] || 0) + 1;
    }
    
    // Aggregate styles
    if (analysis.style_metrics?.style?.primary) {
      styles[analysis.style_metrics.style.primary] = (styles[analysis.style_metrics.style.primary] || 0) + 1;
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
  
  return {
    dominantTone,
    dominantStyle,
    metrics,
    allTones: tones,
    allStyles: styles,
    analysisCount: count,
  };
};

export const generateSuggestedPersona = (aggregatedAnalysis: any): Partial<AIPersona> => {
  // Map the dominant style to a predefined style option
  const matchedStyle = predefinedStyles.find(style => 
    style.name.toLowerCase().includes(aggregatedAnalysis.dominantStyle.toLowerCase()) ||
    style.tone.toLowerCase().includes(aggregatedAnalysis.dominantStyle.toLowerCase())
  )?.id || 'professional';
  
  // Select a function based on analysis or default to 'follow-up'
  const suggestedFunction = 'follow-up'; // Default function
  
  // Generate a name based on style
  const namePrefix = aggregatedAnalysis.metrics.formality > 7 ? 'Professional' : 
                   aggregatedAnalysis.metrics.formality > 4 ? 'Balanced' : 'Casual';
  
  const persona: Partial<AIPersona> = {
    name: `${namePrefix} ${aggregatedAnalysis.dominantTone} Communicator`,
    style: matchedStyle,
    function: suggestedFunction,
    // Generate prompt based on the analysis
    prompt: `Act as a professional communicator with a ${aggregatedAnalysis.dominantTone.toLowerCase()} tone.
Your communication should be ${aggregatedAnalysis.dominantStyle.toLowerCase()} in style, with a formality level of ${Math.round(aggregatedAnalysis.metrics.formality)}/10.
Focus on being clear (${Math.round(aggregatedAnalysis.metrics.clarity)}/10) and persuasive (${Math.round(aggregatedAnalysis.metrics.persuasiveness)}/10).
Adapt to the recipient's needs while maintaining consistency in tone and style.`,
  };
  
  return persona;
};
