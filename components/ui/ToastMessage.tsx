import React, { useState, useEffect } from 'react';
import { Animated, Text, View, StyleSheet, Dimensions, DeviceEventEmitter } from 'react-native';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react-native';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { width } = Dimensions.get('window');

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
        toValue: 50, // drop down from top
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

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle2 size={24} color="#15803d" />;
      case 'error': return <AlertCircle size={24} color="#ef4444" />;
      default: return <Info size={24} color="#3b82f6" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success': return 'border-[#15803d]';
      case 'error': return 'border-red-500';
      default: return 'border-blue-500';
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { transform: [{ translateY }] }
      ]}
      className="absolute z-50 self-center"
      pointerEvents="none"
    >
      <View className={`bg-white/95 rounded-2xl p-4 shadow-xl border-l-4 ${getBorderColor()} flex-row items-center w-[90%] self-center`}>
        <View className="mr-3">
          {getIcon()}
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-brandon-bold text-base mb-0.5">{toast.title}</Text>
          <Text className="text-gray-500 font-brandon text-sm leading-5">{toast.message}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    width: '100%',
    elevation: 100,
    zIndex: 9999,
  }
});
