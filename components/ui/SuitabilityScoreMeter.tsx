'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface SuitabilityScoreMeterProps {
  score: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animate?: boolean;
  className?: string;
}

export default function SuitabilityScoreMeter({
  score,
  size = 'md',
  showLabel = true,
  animate = true,
  className = '',
}: SuitabilityScoreMeterProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Dimensions by size
  const dimensions = {
    sm: { diameter: 48, strokeWidth: 4, textClass: 'text-sm', labelClass: 'text-[9px]' },
    md: { diameter: 72, strokeWidth: 5.5, textClass: 'text-xl font-bold', labelClass: 'text-[10px]' },
    lg: { diameter: 96, strokeWidth: 7, textClass: 'text-3xl font-extrabold', labelClass: 'text-xs' },
  }[size];

  const radius = (dimensions.diameter - dimensions.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Spring animation for score arc & count-up digits
  const springValue = useSpring(0, {
    stiffness: 70,
    damping: 18,
    duration: 0.9,
  });

  useEffect(() => {
    if (hasMounted && animate) {
      springValue.set(score);
    } else {
      springValue.set(score);
    }
  }, [hasMounted, score, animate, springValue]);

  // Transform spring value into stroke-dashoffset
  const strokeDashoffset = useTransform(springValue, (current) => {
    const clamped = Math.min(Math.max(current, 0), 100);
    const progress = clamped / 100;
    return circumference * (1 - progress);
  });

  // Animated display number
  const [displayNumber, setDisplayNumber] = useState<number>(animate ? 0 : Math.round(score));

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayNumber(Math.round(latest));
    });
    return () => unsubscribe();
  }, [springValue]);

  // Color logic based on score tier
  const strokeColor =
    score >= 80
      ? 'var(--navy-600)'
      : score >= 60
      ? 'var(--navy-450)'
      : 'var(--status-borderline)';

  const trackColor = 'var(--navy-050)';

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: dimensions.diameter, height: dimensions.diameter }}
      >
        <svg
          width={dimensions.diameter}
          height={dimensions.diameter}
          viewBox={`0 0 ${dimensions.diameter} ${dimensions.diameter}`}
          className="transform -rotate-90 origin-center"
        >
          {/* Background Track */}
          <circle
            cx={dimensions.diameter / 2}
            cy={dimensions.diameter / 2}
            r={radius}
            fill="transparent"
            stroke={trackColor}
            strokeWidth={dimensions.strokeWidth}
          />

          {/* Animated Value Arc */}
          <motion.circle
            cx={dimensions.diameter / 2}
            cy={dimensions.diameter / 2}
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={dimensions.strokeWidth}
            strokeDasharray={circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Tabular Numeral */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`tabular-nums text-txt-primary tracking-tight ${dimensions.textClass}`}>
            {displayNumber}
          </span>
        </div>
      </div>

      {showLabel && (
        <span className={`text-txt-muted font-medium mt-1 uppercase tracking-wider ${dimensions.labelClass}`}>
          Score
        </span>
      )}
    </div>
  );
}
