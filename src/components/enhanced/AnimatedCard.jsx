import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const AnimatedCard = ({ 
  children, 
  className,
  delay = 0,
  direction = 'up',
  hover = true,
  ...props 
}) => {
  const directions = {
    up: { y: 20, opacity: 0 },
    down: { y: -20, opacity: 0 },
    left: { x: 20, opacity: 0 },
    right: { x: -20, opacity: 0 },
    scale: { scale: 0.95, opacity: 0 }
  };

  const hoverEffects = hover ? {
    scale: 1.02,
    y: -4,
    transition: { duration: 0.2 }
  } : {};

  return (
    <motion.div
      initial={directions[direction]}
      animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={hoverEffects}
      className={cn("transform-gpu", className)}
    >
      <Card {...props}>
        {children}
      </Card>
    </motion.div>
  );
};

const AnimatedCardGrid = ({ children, stagger = 0.1 }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: stagger
          }
        }
      }}
      className="grid gap-6"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { y: 20, opacity: 0 },
            visible: { y: 0, opacity: 1 }
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export { AnimatedCard, AnimatedCardGrid };