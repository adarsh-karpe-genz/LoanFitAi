'use client';

import React, { useEffect, useState } from 'react';
import { useSpring } from 'framer-motion';
import { formatINR } from '@/lib/utils';

interface NumberInterpolationProps {
  value: number;
  formatAs?: 'currency' | 'percent' | 'integer' | 'decimal';
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function NumberInterpolation({
  value,
  formatAs = 'integer',
  prefix = '',
  suffix = '',
  className = '',
}: NumberInterpolationProps) {
  const spring = useSpring(value, {
    stiffness: 120,
    damping: 24,
    duration: 0.32,
  });

  const [currentValue, setCurrentValue] = useState<number>(value);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      setCurrentValue(latest);
    });
    return () => unsubscribe();
  }, [spring]);

  let formatted = '';
  if (formatAs === 'currency') {
    formatted = formatINR(Math.round(currentValue));
  } else if (formatAs === 'percent') {
    formatted = `${currentValue.toFixed(1)}%`;
  } else if (formatAs === 'decimal') {
    formatted = currentValue.toFixed(2);
  } else {
    formatted = Math.round(currentValue).toLocaleString('en-IN');
  }

  return (
    <span className={`tabular-nums inline-block ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
