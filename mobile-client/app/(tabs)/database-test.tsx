import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import apiService from '@/services/api';

export default function DatabaseTestScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAPIConnection = async () => {
    setLoading(true);
    addResult('Testing API connection...');
    
    try {
      const response = await apiService.test();
      if (response.success) {
        addResult('✅ API connection successful!');
        addResult(`Response: ${JSON.stringify(response.data)}`);
      } else {
        addResult(`❌ API connection failed: ${response.error}`);
      }
    } catch (error) {
      addResult(`❌ API connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    setLoading(false);
  };

  const testEcho = async () => {
    setLoading(true);
    addResult('Testing echo endpoint...');
    
    try {
      const response = await apiService.echo('Hello from Expo app!');
      if (response.success) {
        addResult('✅ Echo test successful!');
        addResult(`Response: ${JSON.stringify(response.data)}`);
      } else {
        addResult(`❌ Echo test failed: ${response.error}`);
      }
    } catch (error) {
      addResult(`❌ Echo test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    setLoading(false);
  };

  const testServices = async () => {
    setLoading(true);
    addResult('Testing services endpoint (PostgreSQL query)...');
    
    try {
      const response = await apiService.getServices();
      if (response.success) {
        addResult('✅ Services query successful! (PostgreSQL connected)');
        addResult(`Found ${response.data?.length || 0} services`);
        if (response.data && response.data.length > 0) {
          addResult(`First service: ${JSON.stringify(response.data[0])}`);
        }
      } else {
        addResult(`❌ Services query failed: ${response.error}`);
      }
    } catch (error) {
      addResult(`❌ Services query error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    setLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>
          Database Connection Test
        </ThemedText>
        
        <ThemedText style={styles.description}>
          Test the connection between Expo app → Laravel API → PostgreSQL database
        </ThemedText>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={testAPIConnection}
            disabled={loading}
          >
            <ThemedText style={styles.buttonText}>
              {loading ? 'Testing...' : 'Test API Connection'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={testEcho}
            disabled={loading}
          >
            <ThemedText style={styles.buttonText}>
              {loading ? 'Testing...' : 'Test Echo Endpoint'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={testServices}
            disabled={loading}
          >
            <ThemedText style={styles.buttonText}>
              {loading ? 'Testing...' : 'Test PostgreSQL Query'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: '#ff6b6b' }]}
            onPress={clearResults}
          >
            <ThemedText style={styles.buttonText}>Clear Results</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.resultsContainer}>
          <ThemedText type="subtitle" style={styles.resultsTitle}>
            Test Results:
          </ThemedText>
          {testResults.length === 0 ? (
            <ThemedText style={styles.noResults}>
              No tests run yet. Click a button above to start testing.
            </ThemedText>
          ) : (
            testResults.map((result, index) => (
              <View key={index} style={styles.resultItem}>
                <ThemedText style={styles.resultText}>{result}</ThemedText>
              </View>
            ))
          )}
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
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 32,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  noResults: {
    fontSize: 14,
    opacity: 0.6,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  resultItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});