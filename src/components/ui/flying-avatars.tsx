
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Sparkles, Star } from 'lucide-react';

interface FlyingAvatarsProps {
  count?: number;
  speed?: 'slow' | 'medium' | 'fast';
  trail?: boolean;
  interactive?: boolean;
}

// Sample avatars for flying across the screen
const avatarImages = [
  'https://i.pravatar.cc/150?img=11',
  'https://i.pravatar.cc/150?img=12',
  'https://i.pravatar.cc/150?img=13',
  'https://i.pravatar.cc/150?img=14',
  'https://i.pravatar.cc/150?img=15',
  'https://i.pravatar.cc/150?img=16',
  'https://i.pravatar.cc/150?img=17',
  'https://i.pravatar.cc/150?img=18',
  'https://i.pravatar.cc/150?img=19',
  'https://i.pravatar.cc/150?img=20',
];

const sampleNames = [
  'AI Assistant',
  'Data Analyzer',
  'Neural Net',
  'Quantum Bot',
  'Logic Engine',
  'Pattern Finder',
  'Deep Mind',
  'Info Agent',
  'Smart Entity',
  'Knowledge Base',
];

type FlyingAvatar = {
  id: number;
  path: string; // SVG path or animation parameters
  duration: number;
  delay: number;
  size: number;
  name: string;
  image?: string;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  isActive: boolean;
  isClicked: boolean;
};

export const FlyingAvatars: React.FC<FlyingAvatarsProps> = ({
  count = 5,
  speed = 'medium',
  trail = true,
  interactive = true
}) => {
  const [avatars, setAvatars] = useState<FlyingAvatar[]>([]);
  const [clickedAvatar, setClickedAvatar] = useState<FlyingAvatar | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getSpeedFactor = () => {
    switch (speed) {
      case 'slow': return 2;
      case 'fast': return 0.7;
      case 'medium':
      default: return 1;
    }
  };

  // Generate random flying paths and avatars
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.target === containerRef.current) {
          setContainerSize({
            width: entry.contentRect.width,
            height: entry.contentRect.height
          });
        }
      }
    });
    
    resizeObserver.observe(containerRef.current);
    
    // Initialize flying avatars
    const initializeAvatars = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      const newAvatars: FlyingAvatar[] = [];
      const speedFactor = getSpeedFactor();
      
      for (let i = 0; i < count; i++) {
        // Determine random start and end positions around the edges
        const startSide = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        const endSide = (startSide + 1 + Math.floor(Math.random() * 2)) % 4; // Not the same side, not directly opposite
        
        const getRandomPosition = (side: number) => {
          switch (side) {
            case 0: return { x: Math.random() * width, y: -50 }; // top
            case 1: return { x: width + 50, y: Math.random() * height }; // right
            case 2: return { x: Math.random() * width, y: height + 50 }; // bottom
            case 3: return { x: -50, y: Math.random() * height }; // left
            default: return { x: 0, y: 0 };
          }
        };
        
        const startPosition = getRandomPosition(startSide);
        const endPosition = getRandomPosition(endSide);
        
        // Random size between 30 and 50 pixels
        const size = 30 + Math.random() * 20;
        
        // Random duration between 8 and 15 seconds, adjusted by speed
        const duration = (8 + Math.random() * 7) * speedFactor;
        
        // Add some delay so they don't all start at once
        const delay = Math.random() * 5;
        
        newAvatars.push({
          id: i,
          path: `M${startPosition.x},${startPosition.y} C${width/2},${height/3} ${width/3},${height*2/3} ${endPosition.x},${endPosition.y}`,
          duration,
          delay,
          size,
          name: sampleNames[Math.floor(Math.random() * sampleNames.length)],
          image: avatarImages[Math.floor(Math.random() * avatarImages.length)],
          startPosition,
          endPosition,
          isActive: false,
          isClicked: false
        });
      }
      
      setAvatars(newAvatars);
    };
    
    initializeAvatars();
    
    // Periodically launch a random avatar
    const launchInterval = setInterval(() => {
      setAvatars(prevAvatars => {
        const inactiveAvatars = prevAvatars.filter(avatar => !avatar.isActive);
        if (inactiveAvatars.length === 0) return prevAvatars;
        
        const randomIndex = Math.floor(Math.random() * inactiveAvatars.length);
        const avatarToLaunch = inactiveAvatars[randomIndex];
        
        return prevAvatars.map(avatar => 
          avatar.id === avatarToLaunch.id ? { ...avatar, isActive: true } : avatar
        );
      });
    }, 2000 * getSpeedFactor());
    
    intervalRef.current = launchInterval;
    
    return () => {
      resizeObserver.disconnect();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [count, speed]);

  const handleAvatarComplete = (id: number) => {
    setAvatars(prevAvatars => 
      prevAvatars.map(avatar => 
        avatar.id === id 
          ? {
              ...avatar,
              isActive: false,
              isClicked: false,
              // Generate new path for next time
              startPosition: {
                x: Math.random() > 0.5 ? -50 : containerSize.width + 50,
                y: Math.random() * containerSize.height
              },
              endPosition: {
                x: Math.random() > 0.5 ? -50 : containerSize.width + 50,
                y: Math.random() * containerSize.height
              }
            }
          : avatar
      )
    );
  };

  const handleAvatarClick = (avatar: FlyingAvatar) => {
    if (!interactive) return;
    
    setClickedAvatar(avatar);
    
    setAvatars(prevAvatars => 
      prevAvatars.map(a => 
        a.id === avatar.id ? { ...a, isClicked: true } : a
      )
    );
    
    // Reset clicked state after animation
    setTimeout(() => {
      setClickedAvatar(null);
      setAvatars(prevAvatars => 
        prevAvatars.map(a => 
          a.id === avatar.id ? { ...a, isClicked: false } : a
        )
      );
    }, 3000);
  };

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {avatars.map((avatar) => (
        <AnimatePresence key={avatar.id}>
          {avatar.isActive && (
            <motion.div
              initial={{ 
                x: avatar.startPosition.x, 
                y: avatar.startPosition.y,
                scale: 0.5,
                opacity: 0.2
              }}
              animate={{ 
                x: avatar.endPosition.x, 
                y: avatar.endPosition.y,
                scale: avatar.isClicked ? 1.5 : 1,
                opacity: avatar.isClicked ? 1 : 0.8
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{
                x: { 
                  type: "spring", 
                  duration: avatar.duration,
                  bounce: 0.2
                },
                y: { 
                  type: "spring", 
                  duration: avatar.duration * 0.95, 
                  bounce: 0.2
                },
                opacity: { duration: 1 },
                scale: { duration: 0.5 }
              }}
              onAnimationComplete={() => handleAvatarComplete(avatar.id)}
              className={`absolute pointer-events-auto ${
                interactive ? 'cursor-pointer' : ''
              }`}
              style={{ width: avatar.size, height: avatar.size }}
              onClick={() => handleAvatarClick(avatar)}
            >
              <div className="relative w-full h-full">
                <Avatar className="w-full h-full border-2 border-white shadow-lg">
                  <AvatarImage src={avatar.image} />
                  <AvatarFallback className="bg-primary text-white">
                    {avatar.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                
                {/* Sparkle effects */}
                {avatar.isClicked && (
                  <>
                    <motion.div 
                      className="absolute inset-0 rounded-full"
                      initial={{ scale: 1, opacity: 0.7 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 1 }}
                    />
                    <motion.div
                      className="absolute -top-2 -right-2 text-yellow-400"
                      animate={{ 
                        rotate: [0, 90, 180, 270, 360],
                        scale: [1, 1.2, 1] 
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Star size={12} fill="currentColor" />
                    </motion.div>
                    <motion.div
                      className="absolute -bottom-2 -left-2 text-blue-400"
                      animate={{ 
                        rotate: [0, -90, -180, -270, -360],
                        scale: [1, 1.2, 1] 
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles size={12} />
                    </motion.div>
                  </>
                )}
                
                {/* Trails */}
                {trail && (
                  <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500"
                    initial={{ scale: 0.2, opacity: 0.3 }}
                    animate={{ scale: 0, opacity: 0 }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 0.2
                    }}
                    style={{
                      zIndex: -1,
                      filter: "blur(8px)"
                    }}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ))}
      
      {/* Display info card when an avatar is clicked */}
      <AnimatePresence>
        {clickedAvatar && (
          <motion.div
            className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-50 pointer-events-auto"
            style={{
              left: `calc(50% - 100px)`,
              top: `calc(50% - 75px)`,
              width: '200px'
            }}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ type: "spring", bounce: 0.4 }}
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={clickedAvatar.image} />
                <AvatarFallback>{clickedAvatar.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium text-sm">{clickedAvatar.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">AI Agent</p>
              </div>
            </div>
            <div className="mt-2 text-xs text-center">
              <p>I'm helping analyze and process your data!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
