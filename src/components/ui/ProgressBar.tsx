import React, { useState } from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showValue?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  animated?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  showLabel = false,
  showValue = false,
  variant = 'default',
  animated = false,
  className = '',
}) => {
  const [isInView, setIsInView] = useState(false);
  
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  // Auto-determine variant based on percentage
  const autoVariant = variant === 'default'
    ? percentage >= 80 ? 'success'
    : percentage >= 50 ? 'warning'
    : 'danger'
    : variant;

  const containerClass = [
    styles.container,
    styles[size],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClass}>
      <div className={styles.track}>
        <div
          className={`${styles.bar} ${styles[autoVariant]} ${animated ? styles.animated : ''}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      {(showLabel || showValue) && (
        <div className={styles.labelContainer}>
          {showLabel && <span className={styles.label}>{autoVariant}</span>}
          {showValue && (
            <span className={styles.value}>
              {value}/{max}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  showValue = true,
  variant = 'default',
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const autoVariant = variant === 'default'
    ? percentage >= 80 ? 'success'
    : percentage >= 50 ? 'warning'
    : 'danger'
    : variant;

  return (
    <div className={`${styles.circular} ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          className={styles.circleTrack}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`${styles.circleBar} ${styles[autoVariant]}`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      {showValue && (
        <span className={styles.circularValue}>{Math.round(percentage)}%</span>
      )}
    </div>
  );
};
