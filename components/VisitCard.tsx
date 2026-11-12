import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapPin, Calendar, Clock, ChevronRight } from 'lucide-react-native';

interface VisitProps {
  id: string;
  site_contactName: string;
  farmLocation: string;
  date: string;
  time: string;
  status: 'pending' | 'completed' | 'missed';
  onPress: () => void;
}

export const VisitCard = ({ site_contactName, farmLocation, date, time, status, onPress }: VisitProps) => {
  let statusColor = 'bg-yellow-100 text-yellow-800';
  if (status === 'completed') statusColor = 'bg-green-100 text-green-800';
  if (status === 'missed') statusColor = 'bg-red-100 text-red-800';

  return (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-3"
    >
      <View className="flex-row justify-between items-start mb-3">
        <View>
          <Text className="text-lg font-brandon-bold text-gray-900">{site_contactName}</Text>
          <View className="flex-row items-center mt-1">
            <MapPin size={14} color="#6b7280" />
            <Text className="text-sm text-gray-500 ml-1 font-brandon">{farmLocation}</Text>
          </View>
        </View>
        <View className={`px-2 py-1 rounded-md ${statusColor.split(' ')[0]}`}>
          <Text className={`text-xs font-brandon-medium ${statusColor.split(' ')[1]}`}>
            {status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <View className="flex-row space-x-4">
          <View className="flex-row items-center">
            <Calendar size={14} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-1 font-brandon">{date}</Text>
          </View>
          <View className="flex-row items-center ml-4">
            <Clock size={14} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-1 font-brandon">{time}</Text>
          </View>
        </View>
        <ChevronRight size={20} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );
};
