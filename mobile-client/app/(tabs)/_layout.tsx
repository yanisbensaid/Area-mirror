import { Tabs } from 'expo-router';
import React from 'react';
import Constants from 'expo-constants';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  // Control development features visibility
  // Set SHOW_DEV_FEATURES to false to hide development-only tabs
  const SHOW_DEV_FEATURES = true; // Change this to false to hide DB test tab
  
  // Check if we're in development mode
  // __DEV__ is true during development, false in production builds
  // Also check environment config as fallback
  const isDevelopment = (__DEV__ || 
    Constants.expoConfig?.extra?.environment === 'development' ||
    process.env.EXPO_PUBLIC_ENV !== 'production') && SHOW_DEV_FEATURES;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
          borderTopColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="square.grid.2x2" color={color} />,
        }}
      />
      <Tabs.Screen
        name="create-automation"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus.circle.fill" color={color} />,
        }}
      />
      {isDevelopment && (
        <Tabs.Screen
          name="database-test"
          options={{
            title: 'DB Test',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="cylinder.fill" color={color} />,
          }}
        />
      )}
      {/* Profile tab - shows login or user profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
