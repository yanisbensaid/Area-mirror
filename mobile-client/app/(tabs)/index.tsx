import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const services = [
    { name: 'Mail', logo: require('@/assets/images/app_logo/mail.png') },
    { name: 'Spotify', logo: require('@/assets/images/app_logo/spotify.png') },
    { name: 'Steam', logo: require('@/assets/images/app_logo/steam.png') },
    { name: 'Telegram', logo: require('@/assets/images/app_logo/telegram.png') },
    { name: 'Twitch', logo: require('@/assets/images/app_logo/twitch.png') },
    { name: 'YouTube', logo: require('@/assets/images/app_logo/youtube.png') },
  ];

  const features = [
    {
      icon: 'bolt.fill',
      title: 'Automate',
      description: 'Create powerful workflows between your favorite apps'
    },
    {
      icon: 'link',
      title: 'Connect',
      description: 'Link services together with simple triggers and actions'
    },
    {
      icon: 'sparkles',
      title: 'Simplify',
      description: 'Save time by automating repetitive tasks'
    }
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <ThemedText type="title" style={styles.title}>
            Welcome to{' '}
            <ThemedText type="title" style={[styles.title, { color: colors.text, opacity: 0.7 }]}>
              AREA
            </ThemedText>
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.text }]}>
            Connect your apps and automate your workflows with powerful automation tools
          </ThemedText>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Features</ThemedText>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View
                key={index}
                style={[
                  styles.featureCard,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
                    borderColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
                  }
                ]}
              >
                <View style={[styles.featureIcon, { backgroundColor: colors.tint }]}>
                  <IconSymbol name={feature.icon as any} size={24} color="#fff" />
                </View>
                <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
                  {feature.title}
                </ThemedText>
                <ThemedText style={[styles.featureDescription, { color: colors.text, opacity: 0.7 }]}>
                  {feature.description}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Popular Services */}
        <View style={styles.servicesSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Popular Services</ThemedText>
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
                onPress={() => router.push('/(tabs)/services')}
              >
                <Image source={service.logo} style={styles.serviceLogo} />
                <ThemedText style={styles.serviceName}>{service.name}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity
            style={[styles.viewAllButton, { backgroundColor: colors.tint }]}
            onPress={() => router.push('/(tabs)/services')}
          >
            <ThemedText style={styles.viewAllButtonText}>View All Services</ThemedText>
          </TouchableOpacity>
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
  hero: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  featuresSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  servicesSection: {
    padding: 20,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  serviceCard: {
    width: '30%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceLogo: {
    width: 40,
    height: 40,
    marginBottom: 8,
    borderRadius: 6,
  },
  serviceName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  viewAllButton: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
