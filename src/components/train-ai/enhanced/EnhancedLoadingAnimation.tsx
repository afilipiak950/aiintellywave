
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Loader2, Globe, FileText, HelpCircle, Server, Cpu, AlertTriangle, RefreshCw, XCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EnhancedLoadingAnimationProps {
  progress: number;
  stage: string;
  onCancel?: () => void;
}

export const EnhancedLoadingAnimation: React.FC<EnhancedLoadingAnimationProps> = ({ 
  progress, 
  stage,
  onCancel 
}) => {
  const [showTroubleshootTip, setShowTroubleshootTip] = useState(false);

  // Get the appropriate icon and color based on the current stage
  const getStageInfo = () => {
    if (progress < 30) return { icon: <Globe className="text-blue-500" size={24} />, color: 'bg-blue-500', text: 'Crawling website pages and extracting content' };
    if (progress < 60) return { icon: <FileText className="text-amber-500" size={24} />, color: 'bg-amber-500', text: 'Processing and analyzing text content' };
    if (progress < 85) return { icon: <Brain className="text-purple-500" size={24} />, color: 'bg-purple-500', text: 'Neural network generating intelligent summary' };
    return { icon: <HelpCircle className="text-green-500" size={24} />, color: 'bg-green-500', text: 'Creating comprehensive FAQs from content' };
  };
  
  const { icon, color, text } = getStageInfo();
  
  // Neural network visualization nodes
  const nodes = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100
  }));
  
  // Get detailed message based on progress
  const getDetailedMessage = () => {
    if (progress < 10) return "Establishing connection to website...";
    if (progress < 20) return "Analyzing website structure...";
    if (progress < 30) return "Extracting content from pages...";
    if (progress < 45) return "Processing text and metadata...";
    if (progress < 60) return "Identifying key information...";
    if (progress < 75) return "Generating knowledge representation...";
    if (progress < 85) return "Creating comprehensive summary...";
    if (progress < 95) return "Formulating relevant FAQs...";
    return "Finalizing results and preparing data...";
  };

  // Show troubleshooting tips after 45 seconds if progress is still at 0%
  useEffect(() => {
    if (progress === 0) {
      const timer = setTimeout(() => {
        setShowTroubleshootTip(true);
      }, 45000);
      
      return () => clearTimeout(timer);
    } else {
      setShowTroubleshootTip(false);
    }
  }, [progress]);

  // Handler for cancel button
  const handleCancelClick = () => {
    if (onCancel) {
      onCancel();
    }
  };
  
  return (
    <Card className="w-full max-w-lg shadow-xl border-none bg-white/95 dark:bg-gray-900/95 backdrop-blur">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative w-32 h-32 mb-6">
            {/* Background pulse effect */}
            <motion.div
              className={`absolute inset-0 rounded-full ${color} opacity-20`}
              animate={{ 
                scale: [1, 1.2, 1],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            />
            
            {/* Neural network visualization */}
            <svg className="absolute inset-0" viewBox="0 0 100 100">
              {/* Connection lines */}
              {nodes.map((node, i) => 
                nodes.slice(i + 1, i + 4).map(otherNode => (
                  <motion.line 
                    key={`${node.id}-${otherNode.id}`}
                    x1={node.x} 
                    y1={node.y} 
                    x2={otherNode.x} 
                    y2={otherNode.y} 
                    stroke={color}
                    strokeOpacity="0.5"
                    strokeWidth="0.5"
                    animate={{
                      strokeOpacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: Math.random()
                    }}
                  />
                ))
              )}
              
              {/* Nodes */}
              {nodes.map(node => (
                <motion.circle 
                  key={node.id}
                  cx={node.x} 
                  cy={node.y} 
                  r="2"
                  fill={color}
                  animate={{
                    r: [1, 2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: Math.random()
                  }}
                />
              ))}
            </svg>
            
            {/* Central brain icon */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center z-10"
              animate={{ 
                rotate: [0, 10, -10, 0],
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            >
              <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg">
                {progress === 0 && showTroubleshootTip ? 
                  <AlertTriangle className="text-amber-500" size={24} /> : 
                  icon
                }
              </div>
            </motion.div>
            
            {/* Rotating ring */}
            <motion.div 
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 10, 
                repeat: Infinity,
                ease: "linear" 
              }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={color}
                  strokeOpacity="0.3"
                  strokeWidth="1"
                  strokeDasharray="4,6"
                />
              </svg>
            </motion.div>
          </div>

          <h3 className="text-xl font-medium mb-2">
            {stage || "Processing Content"}
          </h3>
          
          <div className="w-full mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Preparing</span>
              <span>Processing</span>
              <span>Finalizing</span>
            </div>
            <Progress 
              value={progress} 
              className="h-2"
              indicatorClassName={`bg-gradient-to-r from-blue-500 via-purple-500 to-green-500`} 
            />
            <div className="mt-2 text-right text-sm">
              <span className="font-medium">{Math.round(progress)}%</span> Complete
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-6">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{getDetailedMessage()}</span>
          </div>

          {/* Cancel button */}
          <Button 
            variant="destructive" 
            size="sm" 
            className="mb-4 flex items-center gap-2"
            onClick={handleCancelClick}
          >
            <XCircle size={16} />
            Cancel Process
          </Button>
          
          {showTroubleshootTip && progress === 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="w-full mb-6"
            >
              <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-2 text-amber-800 dark:text-amber-200">
                  <AlertTriangle size={16} />
                  <span className="font-medium">Processing seems slow</span>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
                  The website analysis may take longer for larger sites or during high traffic periods. You can:
                </p>
                <ul className="text-sm text-amber-700 dark:text-amber-300 list-disc list-inside mb-2">
                  <li>Continue waiting - processing will continue</li>
                  <li>Try with fewer pages or a smaller website</li>
                  <li>Upload documents directly instead of crawling</li>
                  <li>Cancel the process and try again later</li>
                </ul>
                <div className="flex justify-end mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs flex items-center gap-1"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw size={12} />
                    Restart
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
          
          <div className="flex items-center justify-between w-full gap-4 text-xs text-gray-500 dark:text-gray-400 mt-4">
            <div className="flex items-center gap-1">
              <Server size={12} className="animate-pulse" />
              <span>Processing</span>
            </div>
            <div className="flex items-center gap-1">
              <Cpu size={12} className="animate-pulse" />
              <span>Neural Engine</span>
            </div>
            <div className="flex items-center gap-1">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Brain size={12} />
              </motion.div>
              <span>Auto AI</span>
            </div>
          </div>
          
          <motion.div 
            className="mt-6 text-center text-gray-500 dark:text-gray-400 text-xs w-full p-2 border border-gray-200 dark:border-gray-700 rounded-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p>{text}</p>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
};
