import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import apiService, { ServiceConfig, Automation } from '@/services/api';
import { router } from 'expo-router';

export default function CreateAutomationScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [services, setServices] = useState<ServiceConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Form state
  const [automationName, setAutomationName] = useState('');
  const [automationDescription, setAutomationDescription] = useState('');
  const [selectedTriggerService, setSelectedTriggerService] = useState('');
  const [selectedTriggerAction, setSelectedTriggerAction] = useState('');
  const [selectedActionService, setSelectedActionService] = useState('');
  const [selectedActionAction, setSelectedActionAction] = useState('');

  // Available actions for each service
  const serviceActions = {
    'Mail': ['New Email Received', 'Send Email'],
    'Spotify': ['New Song Added', 'Add to Playlist', 'Play Song'],
    'Steam': ['Achievement Unlocked', 'Game Launched'],
    'Telegram': ['New Message', 'Send Message'],
    'Twitch': ['Stream Started', 'Stream Ended'],
    'YouTube': ['New Upload', 'New Subscriber'],
    'GitHub': ['New Push', 'New Issue', 'Create Issue'],
    'Google': ['New Calendar Event', 'Send Gmail'],
    'Outlook': ['New Email', 'Send Email'],
  };

  // Ensure we have a fallback for services immediately
  const fallbackServices: ServiceConfig[] = Object.keys(serviceActions).map(name => ({
    id: name.toLowerCase(),
    name,
    description: `${name} service integration`,
    logo: '',
    color: '#3498db',
  }));

  useEffect(() => {
    // Set fallback services immediately to prevent undefined errors
    setServices(fallbackServices);
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await apiService.getServices();
      if (response.success && response.data && Array.isArray(response.data)) {
        setServices(response.data);
      } else {
        // Use fallback data if API fails
        setServices(fallbackServices);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      // Fallback to mock data
      setServices(fallbackServices);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAutomation = async () => {
    if (!automationName.trim()) {
      Alert.alert('Error', 'Please enter an automation name');
      return;
    }

    if (!selectedTriggerService || !selectedTriggerAction) {
      Alert.alert('Error', 'Please select a trigger service and action');
      return;
    }

    if (!selectedActionService || !selectedActionAction) {
      Alert.alert('Error', 'Please select an action service and action');
      return;
    }

    setCreating(true);

    const automation: Omit<Automation, 'id'> = {
      name: automationName,
      description: automationDescription || `When ${selectedTriggerService} ${selectedTriggerAction}, ${selectedActionService} ${selectedActionAction}`,
      trigger: {
        service: selectedTriggerService,
        action: selectedTriggerAction,
      },
      action: {
        service: selectedActionService,
        action: selectedActionAction,
      },
      enabled: true,
    };

    try {
      const response = await apiService.createAutomation(automation);
      if (response.success) {
        Alert.alert('Success', 'Automation created successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', response.error || 'Failed to create automation');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setCreating(false);
    }
  };

  const ServiceSelector = ({ 
    title, 
    selectedService, 
    onServiceSelect, 
    selectedAction, 
    onActionSelect 
  }: {
    title: string;
    selectedService: string;
    onServiceSelect: (service: string) => void;
    selectedAction: string;
    onActionSelect: (action: string) => void;
  }) => (
    <View style={[
      styles.selectorContainer,
      {
        backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
        borderColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
      }
    ]}>
      <ThemedText type="defaultSemiBold" style={styles.selectorTitle} forceColor={colorScheme === 'dark' ? '#fff' : '#000'}>{title}</ThemedText>
      
      <View style={styles.serviceGrid}>
        {(services || []).map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[
              styles.serviceButton,
              {
                backgroundColor: selectedService === service.name 
                  ? colors.tint 
                  : (colorScheme === 'dark' ? '#2a2a2a' : '#f8f9fa'),
                borderColor: selectedService === service.name 
                  ? colors.tint 
                  : (colorScheme === 'dark' ? '#444' : '#e5e5e5'),
              }
            ]}
            onPress={() => onServiceSelect(service.name)}
          >
            <ThemedText style={[
              styles.serviceButtonText,
              { color: selectedService === service.name ? '#fff' : colors.text }
            ]}>
              {service.name}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {selectedService && (
        <View style={styles.actionContainer}>
          <ThemedText style={[styles.actionLabel, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
            Select Action:
          </ThemedText>
          <View style={styles.actionGrid}>
            {(serviceActions[selectedService as keyof typeof serviceActions] || []).map((action) => (
              <TouchableOpacity
                key={action}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: selectedAction === action 
                      ? colors.tint 
                      : (colorScheme === 'dark' ? '#2a2a2a' : '#f8f9fa'),
                    borderColor: selectedAction === action 
                      ? colors.tint 
                      : (colorScheme === 'dark' ? '#444' : '#e5e5e5'),
                  }
                ]}
                onPress={() => onActionSelect(action)}
              >
                <ThemedText style={[
                  styles.actionButtonText,
                  { color: selectedAction === action ? '#fff' : colors.text }
                ]}>
                  {action}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <ThemedText style={styles.loadingText}>Loading services...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Create Automation</ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.text }]}>
            Connect your apps and automate your workflow
          </ThemedText>
        </View>

        {/* Automation Details */}
        <View style={[
          styles.formContainer,
          {
            backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
            borderColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
          }
        ]}>
          <ThemedText type="defaultSemiBold" style={styles.formTitle}>Automation Details</ThemedText>
          
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f8f9fa',
                borderColor: colorScheme === 'dark' ? '#444' : '#e5e5e5',
                color: colors.text,
              }
            ]}
            placeholder="Automation name (required)"
            placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
            value={automationName}
            onChangeText={setAutomationName}
          />

          <TextInput
            style={[
              styles.input,
              styles.multilineInput,
              {
                backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f8f9fa',
                borderColor: colorScheme === 'dark' ? '#444' : '#e5e5e5',
                color: colors.text,
              }
            ]}
            placeholder="Description (optional)"
            placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
            value={automationDescription}
            onChangeText={setAutomationDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Trigger Selection */}
        {loading ? (
          <View style={[
            styles.selectorContainer,
            {
              backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
              borderColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
            }
          ]}>
            <ThemedText type="defaultSemiBold" style={styles.selectorTitle} forceColor={colorScheme === 'dark' ? '#fff' : '#000'}>When this happens...</ThemedText>
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.tint} />
              <ThemedText style={styles.loadingText} forceColor={colorScheme === 'dark' ? '#fff' : '#000'}>Loading services...</ThemedText>
            </View>
          </View>
        ) : services && services.length > 0 ? (
          <ServiceSelector
            title="When this happens..."
            selectedService={selectedTriggerService}
            onServiceSelect={setSelectedTriggerService}
            selectedAction={selectedTriggerAction}
            onActionSelect={setSelectedTriggerAction}
          />
        ) : (
          <View style={[
            styles.selectorContainer,
            {
              backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
              borderColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
            }
          ]}>
            <ThemedText type="defaultSemiBold" style={styles.selectorTitle} forceColor={colorScheme === 'dark' ? '#fff' : '#000'}>When this happens...</ThemedText>
            <ThemedText style={[styles.errorText, { color: colorScheme === 'dark' ? '#ff6b6b' : '#dc2626' }]}>
              No services available. Please try again.
            </ThemedText>
          </View>
        )}

        {/* Arrow */}
        {selectedTriggerService && selectedTriggerAction && (
          <View style={styles.arrowContainer}>
            <IconSymbol name="arrow.down" size={24} color={colors.text} style={{ opacity: 0.6 }} />
          </View>
        )}

        {/* Action Selection */}
        {loading ? (
          <View style={[
            styles.selectorContainer,
            {
              backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
              borderColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
            }
          ]}>
            <ThemedText type="defaultSemiBold" style={styles.selectorTitle} forceColor={colorScheme === 'dark' ? '#fff' : '#000'}>Do this...</ThemedText>
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.tint} />
              <ThemedText style={styles.loadingText} forceColor={colorScheme === 'dark' ? '#fff' : '#000'}>Loading services...</ThemedText>
            </View>
          </View>
        ) : services && services.length > 0 ? (
          <ServiceSelector
            title="Do this..."
            selectedService={selectedActionService}
            onServiceSelect={setSelectedActionService}
            selectedAction={selectedActionAction}
            onActionSelect={setSelectedActionAction}
          />
        ) : (
          <View style={[
            styles.selectorContainer,
            {
              backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
              borderColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
            }
          ]}>
            <ThemedText type="defaultSemiBold" style={styles.selectorTitle} forceColor={colorScheme === 'dark' ? '#fff' : '#000'}>Do this...</ThemedText>
            <ThemedText style={[styles.errorText, { color: colorScheme === 'dark' ? '#ff6b6b' : '#dc2626' }]}>
              No services available. Please try again.
            </ThemedText>
          </View>
        )}

        {/* Create Button */}
        <TouchableOpacity
          style={[
            styles.createButton,
            { 
              backgroundColor: colors.tint,
              opacity: (!automationName || !selectedTriggerService || !selectedTriggerAction || 
                       !selectedActionService || !selectedActionAction) ? 0.5 : 1
            }
          ]}
          onPress={handleCreateAutomation}
          disabled={creating || !automationName || !selectedTriggerService || !selectedTriggerAction || 
                   !selectedActionService || !selectedActionAction}
        >
          {creating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.createButtonText} forceColor="#fff">Create Automation</ThemedText>
          )}
        </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  header: {
    marginBottom: 30,
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  formContainer: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  selectorContainer: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  selectorTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  serviceButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  serviceButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionContainer: {
    marginTop: 16,
  },
  actionLabel: {
    fontSize: 14,
    marginBottom: 12,
  },
  actionGrid: {
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  arrowContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  createButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 16,
  },
});