import React, { useState, useEffect } from 'react';
import { Animated, Text, View, StyleSheet, DeviceEventEmitter } from 'react-native';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react-native';
import { LiquidGlassCard } from '../LiquidGlass';

type ToastType = 'success' | 'error' | 'info';

export interface ToastData {
  title: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

export const showToast = (data: ToastData) => {
  DeviceEventEmitter.emit('SHOW_TOAST', data);
};

export function ToastMessage() {
  const [toast, setToast] = useState<ToastData | null>(null);
  const [translateY] = useState(() => new Animated.Value(-150));

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('SHOW_TOAST', (data: ToastData) => {
      setToast(data);

      Animated.spring(translateY, {
        toValue: 54,
        useNativeDriver: true,
        bounciness: 12,
      }).start();

      setTimeout(() => {
        Animated.timing(translateY, {
          toValue: -150,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setToast(null));
      }, data.duration || 3000);
    });

    return () => {
      subscription.remove();
    };
  }, [translateY]);

  if (!toast) return null;

  const accentColor =
    toast.type === 'success' ? '#0D9488' : toast.type === 'error' ? '#EF4444' : '#2563EB';

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={22} color="#0D9488" />;
      case 'error':
        return <AlertCircle size={22} color="#EF4444" />;
      default:
        return <Info size={22} color="#2563EB" />;
    }
  };

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY }] }]}
      pointerEvents="none"
    >
      <LiquidGlassCard
        variant="light"
        borderRadius={22}
        dropletColor={accentColor}
        style={{ width: '90%' }}
        contentStyle={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 14,
        }}
      >
        <View style={{ marginRight: 12 }}>{getIcon()}</View>
        <View style={{ flex: 1 }}>
          <Text className="text-gray-900 font-brandon-bold text-base mb-0.5">{toast.title}</Text>
          <Text className="text-gray-600 font-brandon text-sm leading-5">{toast.message}</Text>
        </View>
      </LiquidGlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    width: '100%',
    elevation: 100,
    zIndex: 9999,
  },
});
