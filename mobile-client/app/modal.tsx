import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ModalScreen() {
  const { service } = useLocalSearchParams<{ service?: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Service data mapping
  const serviceData: { [key: string]: any } = {
    'Mail': {
      name: 'Mail',
      description: 'Connect your email accounts and automate email workflows',
      logo: require('@/assets/images/app_logo/mail.png'),
      features: ['Email notifications', 'Filter by subject', 'Auto-reply', 'Forward messages'],
      triggers: ['New email received', 'Email with specific subject', 'Email from sender'],
      actions: ['Send email', 'Forward email', 'Mark as read', 'Move to folder']
    },
    'Spotify': {
      name: 'Spotify',
      description: 'Automate your music experience and playlist management',
      logo: require('@/assets/images/app_logo/spotify.png'),
      features: ['Playlist management', 'Track recommendations', 'Playback control', 'Music discovery'],
      triggers: ['New track added to playlist', 'Currently playing changed', 'Saved new song'],
      actions: ['Add to playlist', 'Play track', 'Skip song', 'Create playlist']
    },
    'Steam': {
      name: 'Steam',
      description: 'Connect your Steam account and share gaming achievements',
      logo: require('@/assets/images/app_logo/steam.png'),
      features: ['Achievement tracking', 'Game library sync', 'Friend activity', 'Wishlist updates'],
      triggers: ['Achievement unlocked', 'New game purchase', 'Friend came online'],
      actions: ['Post to social', 'Send notification', 'Update status']
    },
    // Add more services as needed
  };

  const currentService = service ? serviceData[service] : null;

  if (!currentService) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Service Details</ThemedText>
        <ThemedText style={[styles.errorText, { color: colors.text }]}>
          Service not found. Please select a valid service.
        </ThemedText>
        <Link href="/(tabs)/services" style={styles.link}>
          <ThemedText type="link">Back to Services</ThemedText>
        </Link>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={currentService.logo} style={styles.serviceLogo} />
          <ThemedText type="title" style={styles.serviceTitle}>
            {currentService.name}
          </ThemedText>
          <ThemedText style={[styles.serviceDescription, { color: colors.text }]}>
            {currentService.description}
          </ThemedText>
        </View>

        {/* Features Section */}
        <View style={[
          styles.section,
          {
            backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
            borderColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
          }
        ]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Features</ThemedText>
          {currentService.features.map((feature: string, index: number) => (
            <View key={index} style={styles.listItem}>
              <IconSymbol name="checkmark.circle.fill" size={20} color={colors.tint} />
              <ThemedText style={[styles.listText, { color: colors.text }]}>
                {feature}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* Triggers Section */}
        <View style={[
          styles.section,
          {
            backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
            borderColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
          }
        ]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Available Triggers</ThemedText>
          {currentService.triggers.map((trigger: string, index: number) => (
            <View key={index} style={styles.listItem}>
              <IconSymbol name="bolt.fill" size={20} color="#ff9500" />
              <ThemedText style={[styles.listText, { color: colors.text }]}>
                {trigger}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* Actions Section */}
        <View style={[
          styles.section,
          {
            backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
            borderColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
          }
        ]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Available Actions</ThemedText>
          {currentService.actions.map((action: string, index: number) => (
            <View key={index} style={styles.listItem}>
              <IconSymbol name="gearshape.fill" size={20} color="#34c759" />
              <ThemedText style={[styles.listText, { color: colors.text }]}>
                {action}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.tint }]}
          >
            <ThemedText style={styles.primaryButtonText}>Connect {currentService.name}</ThemedText>
          </TouchableOpacity>
          
          <Link href="/(tabs)/services" asChild>
            <TouchableOpacity style={[
              styles.secondaryButton,
              { borderColor: colors.tint }
            ]}>
              <ThemedText style={[styles.secondaryButtonText, { color: colors.tint }]}>
                Back to Services
              </ThemedText>
            </TouchableOpacity>
          </Link>
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
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 60,
  },
  serviceLogo: {
    width: 80,
    height: 80,
    marginBottom: 20,
    borderRadius: 16,
  },
  serviceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  serviceDescription: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  section: {
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  listText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
  },
  primaryButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.7,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
