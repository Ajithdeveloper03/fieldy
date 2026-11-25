import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { LiquidGlassButton } from '../LiquidGlass';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  textClassName?: string;
  icon?: React.ReactNode;
}

export const Button = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  textClassName = '',
  icon,
}: ButtonProps) => {
  const glassVariant = variant === 'primary' ? 'tinted' : 'light';
  const tintColor =
    variant === 'primary'
      ? 'rgba(13, 148, 136, 0.78)'
      : undefined;
  const textColor = variant === 'primary' ? '#FFFFFF' : '#0F766E';

  return (
    <LiquidGlassButton
      onPress={onPress}
      disabled={disabled || loading}
      variant={glassVariant}
      tintColor={tintColor}
      dropletColor={variant === 'primary' ? '#14B8A6' : '#0D9488'}
      contentStyle={{ paddingVertical: 15, paddingHorizontal: 24 }}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {icon}
          <Text
            className={`text-base font-brandon-bold text-center ${textClassName}`}
            style={{ color: textColor }}
          >
            {title}
          </Text>
        </View>
      )}
    </LiquidGlassButton>
  );
};
