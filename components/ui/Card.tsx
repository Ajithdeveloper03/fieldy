import React from 'react';
import { ViewProps } from 'react-native';
import { LiquidGlassCard } from '../LiquidGlass';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  variant?: 'light' | 'dark' | 'tinted';
}

export const Card = ({
  children,
  className = '',
  noPadding = false,
  variant = 'light',
  style,
}: CardProps) => {
  return (
    <LiquidGlassCard
      variant={variant}
      borderRadius={24}
      style={style}
      contentStyle={noPadding ? undefined : { padding: 20 }}
    >
      {children}
    </LiquidGlassCard>
  );
};
