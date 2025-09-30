import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { router } from 'expo-router';

export default function ServicesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const services = [
    { name: 'Mail', logo: require('@/assets/images/app_logo/mail.png') },
    { name: 'Spotify', logo: require('@/assets/images/app_logo/spotify.png') },
    { name: 'Steam', logo: require('@/assets/images/app_logo/steam.png') },
    { name: 'Telegram', logo: require('@/assets/images/app_logo/telegram.png') },
    { name: 'Twitch', logo: require('@/assets/images/app_logo/twitch.png') },
    { name: 'YouTube', logo: require('@/assets/images/app_logo/youtube.png') },
    { name: 'GitHub', logo: require('@/assets/images/app_logo/github.png') },
    { name: 'Google', logo: require('@/assets/images/app_logo/google.png') },
    { name: 'Outlook', logo: require('@/assets/images/app_logo/outlook.png') }
  ];

  const handleServicePress = (serviceName: string) => {
    router.push({
      pathname: '/modal',
      params: { service: serviceName }
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Services</ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.text }]}>
            Connect and automate your favorite apps
          </ThemedText>
        </View>

        <View style={styles.servicesGrid}>
          {services.map((service, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.serviceCard,
                {
                  backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
                  borderColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
                }
              ]}
              onPress={() => handleServicePress(service.name)}
            >
              <Image source={service.logo} style={styles.serviceLogo} />
              <ThemedText style={styles.serviceName}>{service.name}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  serviceCard: {
    width: '47%',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 15,
  },
  serviceLogo: {
    width: 48,
    height: 48,
    marginBottom: 12,
    borderRadius: 8,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});