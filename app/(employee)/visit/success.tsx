import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Check } from 'lucide-react-native';
import { Button } from '../../../components/ui/Button';
import { showToast } from '../../../components/ui/ToastMessage';

export default function SuccessScreen() {
  useEffect(() => {
    // Show reminder toast for next visit
    setTimeout(() => {
      showToast({
        title: 'Reminder',
        message: 'Next visit for this site_contact is in 5 days. Please be prepared.',
        type: 'info',
        duration: 5000
      });
    }, 500);
  }, []);
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.replace('/(employee)/dashboard')} className="p-2 -ml-2 mr-4">
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-24 h-24 bg-[#15803d] rounded-full items-center justify-center mb-8 shadow-md">
          <Check size={48} color="#fff" strokeWidth={3} />
        </View>
        <Text className="text-gray-900 font-brandon-bold text-2xl mb-8 text-center"> Report Submitted{'\n'}Successfully! </Text>
        <View className="bg-gray-50 rounded-2xl p-6 w-full items-center mb-12 border border-gray-100">
          <Text className="text-gray-900 font-brandon-bold text-lg mb-1">Kuppusamy</Text>
          <Text className="text-gray-500 text-sm mb-2 font-brandon">Construction Site - Block A</Text>
          <Text className="text-gray-400 text-xs font-brandon">Aug 12, 2025 • 10:45 AM</Text>
        </View>
        <View className="w-full space-y-4">
          <Button title="View Report" onPress={() => router.push('/(employee)/reports')} className="bg-[#15803d] mb-4" />
          <TouchableOpacity onPress={() => router.replace('/(employee)/dashboard')} className="w-full py-4 rounded-xl border border-gray-200 items-center bg-white" >
            <Text className="text-gray-900 font-brandon-bold text-sm">Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
