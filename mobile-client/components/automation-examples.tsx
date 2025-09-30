import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export const automationExamples = [
  {
    id: 1,
    title: 'Email to Spotify Playlist',
    description: 'Automatically add songs to your Spotify playlist when you receive emails with song recommendations',
    trigger: { service: 'Mail', action: 'New Email with Subject' },
    reaction: { service: 'Spotify', action: 'Add Song to Playlist' },
    category: 'Music',
    tags: ['email', 'spotify', 'music', 'playlist']
  },
  {
    id: 2,
    title: 'Steam Achievement to Discord',
    description: 'Share your Steam achievements automatically in your Discord server',
    trigger: { service: 'Steam', action: 'Achievement Unlocked' },
    reaction: { service: 'Telegram', action: 'Send Message to Channel' },
    category: 'Gaming',
    tags: ['steam', 'discord', 'gaming', 'achievements']
  },
  {
    id: 3,
    title: 'YouTube Upload Notification',
    description: 'Get notified via email when your favorite YouTuber uploads a new video',
    trigger: { service: 'YouTube', action: 'New Video Upload' },
    reaction: { service: 'Mail', action: 'Send Email Notification' },
    category: 'Social',
    tags: ['youtube', 'email', 'notifications', 'videos']
  },
  {
    id: 4,
    title: 'Twitch Stream Alert',
    description: 'Send automatic notifications when you go live on Twitch',
    trigger: { service: 'Twitch', action: 'Stream Started' },
    reaction: { service: 'Telegram', action: 'Broadcast Message' },
    category: 'Streaming',
    tags: ['twitch', 'streaming', 'notifications', 'live']
  }
];

interface AutomationExamplesProps {
  searchQuery?: string;
  selectedCategory?: string;
  onAutomationPress?: (automation: typeof automationExamples[0]) => void;
}

export default function AutomationExamples({ 
  searchQuery = '', 
  selectedCategory = 'All',
  onAutomationPress 
}: AutomationExamplesProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const filteredExamples = automationExamples.filter(example => {
    const matchesSearch = 
      example.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      example.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      example.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || example.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleAutomationPress = (automation: typeof automationExamples[0]) => {
    if (onAutomationPress) {
      onAutomationPress(automation);
    }
  };

  return (
    <View style={styles.container}>
      {filteredExamples.map((example) => (
        <TouchableOpacity
          key={example.id}
          style={[
            styles.automationCard,
            {
              backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
              borderColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
            }
          ]}
          onPress={() => handleAutomationPress(example)}
        >
          <View style={styles.cardHeader}>
            <ThemedText type="defaultSemiBold" style={styles.title}>
              {example.title}
            </ThemedText>
            <View style={[styles.categoryTag, { backgroundColor: colors.tint }]}>
              <ThemedText style={styles.categoryText}>{example.category}</ThemedText>
            </View>
          </View>
          
          <ThemedText style={[styles.description, { color: colors.text, opacity: 0.7 }]}>
            {example.description}
          </ThemedText>

          <View style={styles.automationFlow}>
            <View style={styles.flowStep}>
              <View style={[styles.stepIcon, { backgroundColor: colors.tint }]}>
                <IconSymbol name="bolt.fill" size={16} color="#fff" />
              </View>
              <ThemedText style={styles.stepLabel}>TRIGGER</ThemedText>
              <ThemedText style={styles.stepService}>{example.trigger.service}</ThemedText>
              <ThemedText style={[styles.stepAction, { color: colors.text, opacity: 0.8 }]}>
                {example.trigger.action}
              </ThemedText>
            </View>
            
            <IconSymbol name="arrow.right" size={20} color={colors.tint} style={styles.arrowIcon} />
            
            <View style={styles.flowStep}>
              <View style={[styles.stepIcon, { backgroundColor: colors.tint }]}>
                <IconSymbol name="gear" size={16} color="#fff" />
              </View>
              <ThemedText style={styles.stepLabel}>ACTION</ThemedText>
              <ThemedText style={styles.stepService}>{example.reaction.service}</ThemedText>
              <ThemedText style={[styles.stepAction, { color: colors.text, opacity: 0.8 }]}>
                {example.reaction.action}
              </ThemedText>
            </View>
          </View>

          <View style={styles.tagsContainer}>
            {example.tags.slice(0, 3).map((tag, index) => (
              <View 
                key={index} 
                style={[
                  styles.tag, 
                  { 
                    backgroundColor: colorScheme === 'dark' ? '#333' : '#f0f0f0',
                  }
                ]}
              >
                <ThemedText style={[styles.tagText, { color: colors.text, opacity: 0.7 }]}>
                  #{tag}
                </ThemedText>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      ))}

      {filteredExamples.length === 0 && (
        <View style={styles.emptyState}>
          <ThemedText style={[styles.emptyText, { color: colors.text, opacity: 0.6 }]}>
            No automations found matching your criteria
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  automationCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    flex: 1,
    marginRight: 12,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  automationFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  flowStep: {
    flex: 1,
    alignItems: 'center',
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
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
    marginBottom: 4,
  },
  stepAction: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  arrowIcon: {
    marginHorizontal: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});