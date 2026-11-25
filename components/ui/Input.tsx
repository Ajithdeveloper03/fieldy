import { Eye, EyeOff } from 'lucide-react-native';
import React, { forwardRef, useState } from 'react';
import { Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  secureTextEntry?: boolean;
  dark?: boolean;
}

export const Input = forwardRef<React.ComponentRef<typeof TextInput>, InputProps>(
  ({ label, error, icon, secureTextEntry, dark = false, className = '', ...props }, ref) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [focused, setFocused] = useState(false);
    const isPassword = secureTextEntry;

    return (
      <View className={`mb-4 ${className}`}>
        {label && (
          <Text
            className="font-brandon-medium mb-1.5"
            style={{ color: dark ? '#E2E8F0' : '#334155', fontSize: 13 }}
          >
            {label}
          </Text>
        )}

        <View
          style={{
            borderRadius: 14,
            height: 52,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
            backgroundColor: dark ? '#102820' : '#FFFFFF',
            borderWidth: 1.5,
            borderColor: error
              ? '#EF4444'
              : focused
              ? '#0D9488'
              : dark
              ? 'rgba(255,255,255,0.18)'
              : '#CBD5E1',
          }}
        >
          {icon && <View style={{ marginRight: 10 }}>{icon}</View>}

          <TextInput
            ref={ref}
            style={{
              flex: 1,
              fontSize: 15,
              height: '100%',
              color: dark ? '#FFFFFF' : '#0F172A',
            }}
            placeholderTextColor={dark ? 'rgba(255,255,255,0.45)' : '#94A3B8'}
            secureTextEntry={isPassword && !isPasswordVisible}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />

          {isPassword && (
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              style={{ padding: 6 }}
            >
              {isPasswordVisible ? (
                <EyeOff size={19} color={dark ? 'rgba(255,255,255,0.7)' : '#64748B'} />
              ) : (
                <Eye size={19} color={dark ? 'rgba(255,255,255,0.7)' : '#64748B'} />
              )}
            </TouchableOpacity>
          )}
        </View>

        {error && <Text className="text-red-500 text-sm mt-1 font-brandon">{error}</Text>}
      </View>
    );
  }
);

Input.displayName = 'Input';
