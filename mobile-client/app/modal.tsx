import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ModalScreen() {
  const params = useLocalSearchParams();
  const service = typeof params.service === 'string' ? params.service : undefined;
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
    'Telegram': {
      name: 'Telegram',
      description: 'Connect Telegram for messaging automation',
      logo: require('@/assets/images/app_logo/telegram.png'),
      features: ['Message automation', 'Bot integration', 'Channel management', 'Group notifications'],
      triggers: ['New message received', 'Mentioned in group', 'Channel post'],
      actions: ['Send message', 'Post to channel', 'Forward message']
    },
    'Twitch': {
      name: 'Twitch',
      description: 'Automate your streaming workflow and notifications',
      logo: require('@/assets/images/app_logo/twitch.png'),
      features: ['Stream notifications', 'Viewer management', 'Chat automation', 'Clip creation'],
      triggers: ['Stream started', 'New follower', 'Viewer milestone reached'],
      actions: ['Post notification', 'Send chat message', 'Create clip']
    },
    'YouTube': {
      name: 'YouTube',
      description: 'Automate YouTube channel management and notifications',
      logo: require('@/assets/images/app_logo/youtube.png'),
      features: ['Upload notifications', 'Comment management', 'Subscriber tracking', 'Analytics'],
      triggers: ['New video uploaded', 'New subscriber', 'Comment received'],
      actions: ['Send notification', 'Post to social', 'Reply to comment']
    },
    'GitHub': {
      name: 'GitHub',
      description: 'Automate your development workflow and repository management',
      logo: require('@/assets/images/app_logo/github.png'),
      features: ['Repository automation', 'Issue tracking', 'Pull request management', 'Release notifications'],
      triggers: ['New commit pushed', 'Issue created', 'Pull request opened'],
      actions: ['Create issue', 'Send notification', 'Update status']
    },
    'Google': {
      name: 'Google',
      description: 'Connect Google services for productivity automation',
      logo: require('@/assets/images/app_logo/google.png'),
      features: ['Calendar integration', 'Drive automation', 'Gmail management', 'Docs collaboration'],
      triggers: ['New calendar event', 'File shared', 'Email received'],
      actions: ['Create calendar event', 'Send email', 'Share file']
    },
    'Outlook': {
      name: 'Outlook',
      description: 'Automate Microsoft Outlook email and calendar workflows',
      logo: require('@/assets/images/app_logo/outlook.png'),
      features: ['Email automation', 'Calendar management', 'Contact sync', 'Meeting scheduling'],
      triggers: ['New email received', 'Meeting scheduled', 'Calendar reminder'],
      actions: ['Send email', 'Create meeting', 'Update calendar']
    }
  };

  const currentService = service ? serviceData[service] : null;

  if (!service || !currentService) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <IconSymbol name="exclamationmark.triangle.fill" size={60} color="#ff9500" />
            <ThemedText type="title" style={styles.serviceTitle}>Service Details</ThemedText>
            <ThemedText style={[styles.errorText, { color: colors.text }]}>
              {!service ? 'No service selected.' : 'Service not found.'} Please select a valid service from the services page.
            </ThemedText>
          </View>
          
          <View style={styles.buttonContainer}>
            <Link href="/(tabs)/services" asChild>
              <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.tint }]}>
                <ThemedText style={styles.primaryButtonText} forceColor="#fff">Back to Services</ThemedText>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
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
          <ThemedText type="subtitle" style={styles.sectionTitle} forceColor={colorScheme === 'dark' ? '#fff' : '#000'}>Features</ThemedText>
          {currentService.features.map((feature: string, index: number) => (
            <View key={index} style={styles.listItem}>
              <IconSymbol name="checkmark.circle.fill" size={20} color={colors.tint} />
              <ThemedText style={[styles.listText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
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
          <ThemedText type="subtitle" style={styles.sectionTitle} forceColor={colorScheme === 'dark' ? '#fff' : '#000'}>Available Triggers</ThemedText>
          {currentService.triggers.map((trigger: string, index: number) => (
            <View key={index} style={styles.listItem}>
              <IconSymbol name="bolt.fill" size={20} color="#ff9500" />
              <ThemedText style={[styles.listText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
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
          <ThemedText type="subtitle" style={styles.sectionTitle} forceColor={colorScheme === 'dark' ? '#fff' : '#000'}>Available Actions</ThemedText>
          {currentService.actions.map((action: string, index: number) => (
            <View key={index} style={styles.listItem}>
              <IconSymbol name="gearshape.fill" size={20} color="#34c759" />
              <ThemedText style={[styles.listText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
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
            <ThemedText style={styles.primaryButtonText} forceColor="#fff">Connect {currentService.name}</ThemedText>
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
