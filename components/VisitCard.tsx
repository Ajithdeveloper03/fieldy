import React from 'react';
import { View, Text } from 'react-native';
import { MapPin, Calendar, Clock, ChevronRight } from 'lucide-react-native';
import { LiquidGlassCard } from './LiquidGlass';

interface VisitProps {
  id: string;
  site_contactName: string;
  farmLocation: string;
  date: string;
  time: string;
  status: 'pending' | 'completed' | 'missed';
  onPress: () => void;
}

export const VisitCard = ({
  site_contactName,
  farmLocation,
  date,
  time,
  status,
  onPress,
}: VisitProps) => {
  const statusStyles =
    status === 'completed'
      ? { bg: 'rgba(13, 148, 136, 0.14)', text: '#0F766E' }
      : status === 'missed'
      ? { bg: 'rgba(225, 29, 72, 0.14)', text: '#BE123C' }
      : { bg: 'rgba(217, 119, 6, 0.14)', text: '#B45309' };

  return (
    <LiquidGlassCard
      variant="light"
      borderRadius={22}
      onPress={onPress}
      style={{ marginBottom: 12 }}
      contentStyle={{ padding: 16 }}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text className="text-lg font-brandon-bold text-gray-900">{site_contactName}</Text>
          <View className="flex-row items-center mt-1">
            <MapPin size={14} color="#64748B" />
            <Text className="text-sm text-gray-600 ml-1 font-brandon">{farmLocation}</Text>
          </View>
        </View>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: statusStyles.bg,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontFamily: 'Brandon-Bold',
              color: statusStyles.text,
            }}
          >
            {status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between pt-3 border-t border-slate-200/70">
        <View className="flex-row items-center">
          <View className="flex-row items-center">
            <Calendar size={14} color="#64748B" />
            <Text className="text-sm text-gray-700 ml-1.5 font-brandon">{date}</Text>
          </View>
          <View className="flex-row items-center ml-4">
            <Clock size={14} color="#64748B" />
            <Text className="text-sm text-gray-700 ml-1.5 font-brandon">{time}</Text>
          </View>
        </View>
        <ChevronRight size={20} color="#64748B" />
      </View>
    </LiquidGlassCard>
  );
};
