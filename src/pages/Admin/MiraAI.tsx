
import React from 'react';
import { AnimatedBackgroundWrapper } from '@/components/mira-ai/AnimatedBackgroundWrapper';
import { MiraAIHero } from '@/components/mira-ai/MiraAIHero';
import { UsageInstructions } from '@/components/mira-ai/UsageInstructions';
import { FeatureHighlights } from '@/components/mira-ai/FeatureHighlights';
import { ChatInterface } from '@/components/mira-ai/ChatInterface';
import { TipsBestPractices } from '@/components/mira-ai/TipsBestPractices';

const MiraAI = () => {
  return (
    <AnimatedBackgroundWrapper>
      <MiraAIHero />
      <UsageInstructions />
      <FeatureHighlights />
      <ChatInterface />
      <TipsBestPractices />
    </AnimatedBackgroundWrapper>
  );
};

export default MiraAI;
