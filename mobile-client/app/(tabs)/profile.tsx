
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import apiService, { User } from '@/services/api';
import oauthService from '@/services/oauth';
import * as WebBrowser from 'expo-web-browser';
import testOAuthUrls from '@/utils/testOAuth';

// Complete the auth session when the component mounts
WebBrowser.maybeCompleteAuthSession();

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

    // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await apiService.isAuthenticated();
        if (isAuth) {
          const storedUser = await apiService.getStoredUser();
          if (storedUser) {
            setIsAuthenticated(true);
            setUser(storedUser);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // If there's an error, assume not authenticated
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleAuth = () => {
    if (isLogin) {
      handleLogin();
    } else {
      handleRegister();
    }
  };


  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    const response = await apiService.login({ email, password });
    setLoading(false);
    if (response.success && response.data) {
      setUser(response.data.user);
      setIsAuthenticated(true);
      Alert.alert('Success', 'Logged in successfully!');
    } else {
      Alert.alert('Login Failed', response.error || 'Unknown error');
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setLoading(true);
    const response = await apiService.register({ 
      email, 
      password, 
      confirmPassword, 
      name: email.split('@')[0] 
    });
    setLoading(false);
    if (response.success && response.data) {
      setUser(response.data.user);
      setIsAuthenticated(true);
      Alert.alert('Success', 'Account created successfully!');
    } else {
      Alert.alert('Registration Failed', response.error || 'Unknown error');
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await apiService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setOauthLoading(null);
    setLoading(false);
    Alert.alert('Success', 'Logged out successfully');
  };

  const handleGoogleOAuth = async () => {
    setOauthLoading('google');
    try {
      // First test: Get OAuth URL from backend
      console.log('=== Google OAuth Test ===');
      const urlResult = await apiService.getGoogleOAuthUrl();
      console.log('Backend OAuth URL result:', urlResult);
      
      if (!urlResult.success) {
        Alert.alert('Error', `Failed to get OAuth URL: ${urlResult.error}`);
        return;
      }
      
      // Proceed with OAuth
      const result = await oauthService.authenticateWithGoogle();
      
      if (result.success) {
        // Get updated user info
        const userResult = await apiService.getStoredUser();
        if (userResult) {
          setUser(userResult);
          setIsAuthenticated(true);
          Alert.alert('Success', 'Logged in with Google successfully!');
        }
      } else {
        Alert.alert('Google OAuth Failed', result.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      Alert.alert('Error', `Google authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setOauthLoading(null);
    }
  };

  const handleGitHubOAuth = async () => {
    setOauthLoading('github');
    try {
      // First test: Get OAuth URL from backend
      console.log('=== GitHub OAuth Test ===');
      const urlResult = await apiService.getGitHubOAuthUrl();
      console.log('Backend OAuth URL result:', urlResult);
      
      if (!urlResult.success) {
        Alert.alert('Error', `Failed to get OAuth URL: ${urlResult.error}`);
        return;
      }
      
      // Proceed with OAuth
      const result = await oauthService.authenticateWithGitHub();
      
      if (result.success) {
        // Get updated user info
        const userResult = await apiService.getStoredUser();
        if (userResult) {
          setUser(userResult);
          setIsAuthenticated(true);
          Alert.alert('Success', 'Logged in with GitHub successfully!');
        }
      } else {
        Alert.alert('GitHub OAuth Failed', result.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      Alert.alert('Error', `GitHub authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setOauthLoading(null);
    }
  };



  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.tint} />
          <ThemedText style={{ marginTop: 16 }}>Loading...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (isAuthenticated && user) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>Profile</ThemedText>
          </View>

          <View style={[
            styles.profileCard,
            {
              backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
              borderColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
            }
          ]}>
            <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
              <ThemedText style={styles.avatarText}>
                {user.name.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
            <ThemedText type="subtitle" style={styles.userName}>{user.name}</ThemedText>
            <ThemedText style={[styles.userEmail, { color: colors.text, opacity: 0.7 }]}> 
              {user.email}
            </ThemedText>
          </View>

          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: '#ff4444' }]}
            onPress={handleLogout}
          >
            <ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.text }]}>
            {isLogin ? 'Sign in to your account' : 'Join AREA today'}
          </ThemedText>
        </View>

        <View style={styles.form}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f8f9fa',
                borderColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
                color: colors.text,
              }
            ]}
            placeholder="Email address"
            placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f8f9fa',
                borderColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
                color: colors.text,
              }
            ]}
            placeholder="Password"
            placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {!isLogin && (
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f8f9fa',
                  borderColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
                  color: colors.text,
                }
              ]}
              placeholder="Confirm Password"
              placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          )}

          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: colors.tint }]}
            onPress={handleAuth}
          >
            <ThemedText style={styles.authButtonText} forceColor="#fff">
              {isLogin ? 'Sign In' : 'Create Account'}
            </ThemedText>
          </TouchableOpacity>

          {/* OAuth Options */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colorScheme === 'dark' ? '#333' : '#e5e5e5' }]} />
            <ThemedText style={[styles.dividerText, { color: colors.text, opacity: 0.6 }]}>
              Or continue with
            </ThemedText>
            <View style={[styles.dividerLine, { backgroundColor: colorScheme === 'dark' ? '#333' : '#e5e5e5' }]} />
          </View>

          <View style={styles.oauthContainer}>
            <TouchableOpacity
              style={[
                styles.oauthButton,
                {
                  backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
                  borderColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
                  opacity: oauthLoading ? 0.6 : 1,
                }
              ]}
              onPress={handleGoogleOAuth}
              disabled={oauthLoading !== null}
            >
              {oauthLoading === 'google' ? (
                <ActivityIndicator size="small" color={colors.tint} style={{ marginRight: 12 }} />
              ) : (
                <Image source={require('@/assets/images/app_logo/google.png')} style={styles.oauthIcon} />
              )}
              <ThemedText style={[styles.oauthText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                {oauthLoading === 'google' ? 'Connecting...' : 'Google'}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.oauthButton,
                {
                  backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
                  borderColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
                  opacity: oauthLoading ? 0.6 : 1,
                }
              ]}
              onPress={handleGitHubOAuth}
              disabled={oauthLoading !== null}
            >
              {oauthLoading === 'github' ? (
                <ActivityIndicator size="small" color={colors.tint} style={{ marginRight: 12 }} />
              ) : (
                <Image source={require('@/assets/images/app_logo/github.png')} style={styles.oauthIcon} />
              )}
              <ThemedText style={[styles.oauthText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                {oauthLoading === 'github' ? 'Connecting...' : 'GitHub'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Debug button for OAuth testing */}
          {__DEV__ && (
            <TouchableOpacity
              style={[
                styles.debugButton,
                {
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f0f0f0',
                  borderColor: colorScheme === 'dark' ? '#444' : '#ddd',
                  marginTop: 16,
                }
              ]}
              onPress={testOAuthUrls}
            >
              <ThemedText style={[styles.debugButtonText, { color: colors.text }]}>
                🔍 Test OAuth URLs
              </ThemedText>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsLogin(!isLogin)}
          >
            <ThemedText style={[styles.switchButtonText, { color: colors.tint }]}>
              {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
            </ThemedText>
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
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
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
  form: {
    gap: 16,
  },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  authButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  switchButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  profileCard: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
  },
  logoutButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
  },
  oauthContainer: {
    gap: 12,
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  oauthIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  oauthText: {
    fontSize: 14,
    fontWeight: '500',
  },
  debugButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  debugButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});