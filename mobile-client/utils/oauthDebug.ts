/**
 * OAuth Debug Utility
 * Helper functions for debugging OAuth configuration
 */

import Config from '../constants/config';
import { makeRedirectUri } from 'expo-auth-session';

export class OAuthDebug {
  private static getRedirectUri(): string {
    return makeRedirectUri({
      scheme: 'area-mobile',
      path: 'oauth/callback',
    });
  }

  static testConfig(): void {
    console.log('=== OAuth Configuration Test ===');
    console.log('API Base URL:', Config.API_BASE_URL);
    
    const redirectUri = this.getRedirectUri();
    console.log('Redirect URI:', redirectUri);
    console.log('Expected scheme:', 'area-mobile://');
    
    const baseApiUrl = Config.API_BASE_URL.replace('/api', '');
    console.log('Base API URL:', baseApiUrl);
    
    const googleUrl = `${baseApiUrl}/api/oauth/google?mobile=true&redirect=${encodeURIComponent(redirectUri)}`;
    const githubUrl = `${baseApiUrl}/api/oauth/github?mobile=true&redirect=${encodeURIComponent(redirectUri)}`;
    
    console.log('Google OAuth URL:', googleUrl);
    console.log('GitHub OAuth URL:', githubUrl);
    console.log('=================================');
  }

  static testDeepLinks() {
    const redirectUri = this.getRedirectUri();
    const isValidScheme = redirectUri.startsWith('area-mobile://');
    
    return {
      redirectUri,
      isValidScheme,
      testUrls: {
        success: `${redirectUri}?token=test_token_123`,
        error: `${redirectUri}?error=oauth_failed`,
      }
    };
  }

  static async testApiConnectivity() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(Config.API_BASE_URL.replace('/api', '/api/test'), {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      return {
        baseUrl: Config.API_BASE_URL,
        reachable: response.ok,
        error: !response.ok ? `HTTP ${response.status}` : undefined,
      };
    } catch (error) {
      return {
        baseUrl: Config.API_BASE_URL,
        reachable: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static getTestUrls() {
    const redirectUri = this.getRedirectUri();
    const baseUrl = Config.API_BASE_URL.replace('/api', '');
    
    return {
      google: `${baseUrl}/api/oauth/google?mobile=true&redirect=${encodeURIComponent(redirectUri)}`,
      github: `${baseUrl}/api/oauth/github?mobile=true&redirect=${encodeURIComponent(redirectUri)}`,
    };
  }
}