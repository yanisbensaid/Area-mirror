import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import apiService, { Automation } from '@/services/api';
import { router } from 'expo-router';

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAutomations();
  }, []);

  const loadAutomations = async () => {
    try {
      const response = await apiService.getAutomations();
      if (response.success && response.data) {
        setAutomations(response.data);
      } else {
        // Fallback to mock data if API fails
        setAutomations(mockAutomations);
      }
    } catch (error) {
      console.error('Error loading automations:', error);
      setAutomations(mockAutomations);
    } finally {
      setLoading(false);
    }
  };

  // Sample automation examples (converted from your web app)
  const mockAutomations: Automation[] = [
    {
      id: 1,
      name: 'Email to Spotify Playlist',
      description: 'Add songs to Spotify when receiving specific emails',
      trigger: { service: 'Mail', action: 'New Email Received' },
      action: { service: 'Spotify', action: 'Add to Playlist' },
      enabled: true,
    },
    {
      id: 2,
      name: 'Steam Achievement to Discord',
      description: 'Post Steam achievements to Discord channel',
      trigger: { service: 'Steam', action: 'Achievement Unlocked' },
      action: { service: 'Telegram', action: 'Send Message' },
      enabled: true,
    },
    {
      id: 3,
      name: 'YouTube Upload Notification',
      description: 'Get notified when favorite YouTuber uploads',
      trigger: { service: 'YouTube', action: 'New Upload' },
      action: { service: 'Mail', action: 'Send Email' },
      enabled: true,
    },
    {
      id: 4,
      name: 'Twitch Stream to Twitter',
      description: 'Auto-tweet when going live on Twitch',
      trigger: { service: 'Twitch', action: 'Stream Started' },
      action: { service: 'Mail', action: 'Send Notification' },
      enabled: true,
    }
  ];

  const categories = ['All', 'Music', 'Gaming', 'Social', 'Streaming'];

  // Determine category based on services used
  const getAutomationCategory = (automation: Automation): string => {
    // Safety checks to ensure automation has required properties
    if (!automation || !automation.trigger || !automation.action) {
      return 'Other';
    }

    const musicServices = ['Spotify', 'YouTube'];
    const gamingServices = ['Steam'];
    const socialServices = ['Telegram', 'Mail'];
    const streamingServices = ['Twitch'];

    const triggerService = automation.trigger?.service || '';
    const actionService = automation.action?.service || '';

    if (musicServices.includes(triggerService) || musicServices.includes(actionService)) {
      return 'Music';
    }
    if (gamingServices.includes(triggerService) || gamingServices.includes(actionService)) {
      return 'Gaming';
    }
    if (socialServices.includes(triggerService) || socialServices.includes(actionService)) {
      return 'Social';
    }
    if (streamingServices.includes(triggerService) || streamingServices.includes(actionService)) {
      return 'Streaming';
    }
    return 'Other';
  };

  const filteredAutomations = automations.filter(automation => {
    // Safety check for automation structure
    if (!automation || !automation.name || !automation.description) {
      return false;
    }

    const matchesSearch = automation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         automation.description.toLowerCase().includes(searchQuery.toLowerCase());
    const automationCategory = getAutomationCategory(automation);
    const matchesCategory = selectedCategory === 'All' || automationCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderAutomationCard = ({ item }: { item: Automation }) => (
    <View
      style={[
        styles.automationCard,
        {
          backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
          borderColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
        }
      ]}
    >
      <ThemedText type="defaultSemiBold" style={styles.automationTitle}>
        {item.name}
      </ThemedText>
      <ThemedText style={[styles.automationDescription, { color: colors.text, opacity: 0.7 }]}>
        {item.description}
      </ThemedText>
      
      <View style={styles.automationFlow}>
        <View style={styles.flowStep}>
          <ThemedText style={styles.stepLabel}>TRIGGER</ThemedText>
          <ThemedText style={styles.stepService}>{item.trigger?.service || 'Unknown'}</ThemedText>
          <ThemedText style={[styles.stepAction, { color: colors.text, opacity: 0.8 }]}>
            {item.trigger?.action || 'Unknown'}
          </ThemedText>
        </View>
        
        <IconSymbol name="arrow.right" size={20} color={colors.text} style={styles.arrowIcon} />
        
        <View style={styles.flowStep}>
          <ThemedText style={styles.stepLabel}>ACTION</ThemedText>
          <ThemedText style={styles.stepService}>{item.action?.service || 'Unknown'}</ThemedText>
          <ThemedText style={[styles.stepAction, { color: colors.text, opacity: 0.8 }]}>
            {item.action?.action || 'Unknown'}
          </ThemedText>
        </View>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Explore Automations</ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.text }]}>
            Discover, filter, and find the perfect automation for your workflow
          </ThemedText>
        </View>

        {/* Search Bar */}
        <View style={[
          styles.searchContainer,
          {
            backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
            borderColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
          }
        ]}>
          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f8f9fa',
                borderColor: colorScheme === 'dark' ? '#444' : '#e5e5e5',
                color: colors.text,
              }
            ]}
            placeholder="Search automations..."
            placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* Category Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            <View style={styles.categoryContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor: selectedCategory === category ? colors.tint : 'transparent',
                      borderColor: selectedCategory === category ? colors.tint : (colorScheme === 'dark' ? '#333' : '#e5e5e5'),
                    }
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <ThemedText style={[
                    styles.categoryText,
                    { color: selectedCategory === category ? '#fff' : colors.text }
                  ]}>
                    {category}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Automation Cards */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.tint} />
            <ThemedText style={styles.loadingText}>Loading automations...</ThemedText>
          </View>
        ) : (
          <FlatList
            data={filteredAutomations}
            renderItem={renderAutomationCard}
            keyExtractor={(item) => (item.id || 0).toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.automationsList}
          />
        )}

        {filteredAutomations.length === 0 && (
          <View style={styles.emptyState}>
            <ThemedText style={[styles.emptyText, { color: colors.text, opacity: 0.6 }]}>
              No automations found. Try adjusting your search or filters.
            </ThemedText>
          </View>
        )}
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
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  searchContainer: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  automationsList: {
    paddingHorizontal: 20,
  },
  automationCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  automationTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  automationDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  automationFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flowStep: {
    flex: 1,
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    opacity: 0.6,
    marginBottom: 4,
    letterSpacing: 1,
  },
  stepService: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  stepAction: {
    fontSize: 12,
    textAlign: 'center',
  },
  arrowIcon: {
    marginHorizontal: 16,
    opacity: 0.6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
});
