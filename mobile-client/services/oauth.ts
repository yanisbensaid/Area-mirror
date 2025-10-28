/**
 * OAuth Authentication Service for AREA Mobile App
 * Handles Google and GitHub OAuth flows using expo-auth-session
 */

import { AuthRequest, AuthRequestPromptOptions, DiscoveryDocument, exchangeCodeAsync, makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import apiService from './api';
import Config from '../constants/config';

// Complete web browser session when redirect is triggered
WebBrowser.maybeCompleteAuthSession();

export interface OAuthProvider {
  name: 'google' | 'github';
  clientId?: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  revocationEndpoint?: string;
  discovery?: DiscoveryDocument;
}

export interface OAuthResult {
  success: boolean;
  token?: string;
  error?: string;
}

class OAuthService {
  private redirectUri: string;

  constructor() {
    // Create redirect URI for OAuth callback
    this.redirectUri = makeRedirectUri({
      scheme: 'area-mobile', // This should match your app's scheme in app.json
      path: 'oauth/callback',
    });
  }

  /**
   * Get OAuth provider configuration
   */
  private getProviderConfig(provider: 'google' | 'github'): OAuthProvider {
    switch (provider) {
      case 'google':
        return {
          name: 'google',
          discovery: {
            authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenEndpoint: 'https://oauth2.googleapis.com/token',
            revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
          },
          authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenEndpoint: 'https://oauth2.googleapis.com/token',
        };
      
      case 'github':
        return {
          name: 'github',
          authorizationEndpoint: 'https://github.com/login/oauth/authorize',
          tokenEndpoint: 'https://github.com/login/oauth/access_token',
        };
      
      default:
        throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
  }

  /**
   * Authenticate with Google OAuth
   */
  async authenticateWithGoogle(): Promise<OAuthResult> {
    try {
      // Get OAuth URL from backend API first
      const result = await apiService.getGoogleOAuthUrl();
      
      if (!result.success || !result.data?.url) {
        return {
          success: false,
          error: result.error || 'Failed to get Google OAuth URL',
        };
      }

      // Add mobile parameters to the backend-provided URL
      const url = new URL(result.data.url);
      url.searchParams.set('mobile', 'true');
      url.searchParams.set('redirect', this.redirectUri);
      const mobileOAuthUrl = url.toString();

      console.log('Google OAuth - Opening URL:', mobileOAuthUrl);
      console.log('Google OAuth - Expected redirect:', this.redirectUri);

      // Open the OAuth URL in browser
      const authResult = await WebBrowser.openAuthSessionAsync(
        mobileOAuthUrl,
        this.redirectUri
      );

      console.log('Google OAuth - Result:', authResult);

      if (authResult.type === 'success' && authResult.url) {
        // Extract token from the callback URL
        const url = new URL(authResult.url);
        const token = url.searchParams.get('token');
        const error = url.searchParams.get('error');

        console.log('Google OAuth - Callback received:', {
          url: authResult.url,
          token: token ? `${token.substring(0, 10)}...` : null,
          error,
        });

        if (error) {
          return {
            success: false,
            error: error === 'oauth_failed' ? 'OAuth authentication failed' : error,
          };
        }

        if (!token) {
          return {
            success: false,
            error: 'No authentication token received',
          };
        }

        // Store token in API service
        await apiService.setToken(token);

        // Get user info to store locally
        const userResult = await apiService.getProfile();
        if (userResult.success && userResult.data) {
          await apiService.storeUser(userResult.data);
        }

        return {
          success: true,
          token,
        };
      }

      if (authResult.type === 'cancel') {
        return {
          success: false,
          error: 'Authentication was cancelled by user',
        };
      }

      return {
        success: false,
        error: 'Authentication failed or was interrupted',
      };
    } catch (error) {
      console.error('Google OAuth error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Google OAuth failed',
      };
    }
  }

  /**
   * Authenticate with GitHub OAuth
   */
  async authenticateWithGitHub(): Promise<OAuthResult> {
    try {
      // Get OAuth URL from backend API first
      const result = await apiService.getGitHubOAuthUrl();
      
      if (!result.success || !result.data?.url) {
        return {
          success: false,
          error: result.error || 'Failed to get GitHub OAuth URL',
        };
      }

      // Add mobile parameters to the backend-provided URL
      const url = new URL(result.data.url);
      url.searchParams.set('mobile', 'true');
      url.searchParams.set('redirect', this.redirectUri);
      const mobileOAuthUrl = url.toString();

      console.log('GitHub OAuth - Opening URL:', mobileOAuthUrl);
      console.log('GitHub OAuth - Expected redirect:', this.redirectUri);

      // Open the OAuth URL in browser
      const authResult = await WebBrowser.openAuthSessionAsync(
        mobileOAuthUrl,
        this.redirectUri
      );

      console.log('GitHub OAuth - Result:', authResult);

      if (authResult.type === 'success' && authResult.url) {
        // Extract token from the callback URL
        const url = new URL(authResult.url);
        const token = url.searchParams.get('token');
        const error = url.searchParams.get('error');

        console.log('GitHub OAuth - Callback received:', {
          url: authResult.url,
          token: token ? `${token.substring(0, 10)}...` : null,
          error,
        });

        if (error) {
          return {
            success: false,
            error: error === 'oauth_failed' ? 'OAuth authentication failed' : error,
          };
        }

        if (!token) {
          return {
            success: false,
            error: 'No authentication token received',
          };
        }

        // Store token in API service
        await apiService.setToken(token);

        // Get user info to store locally
        const userResult = await apiService.getProfile();
        if (userResult.success && userResult.data) {
          await apiService.storeUser(userResult.data);
        }

        return {
          success: true,
          token,
        };
      }

      if (authResult.type === 'cancel') {
        return {
          success: false,
          error: 'Authentication was cancelled by user',
        };
      }

      return {
        success: false,
        error: 'Authentication failed or was interrupted',
      };
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'GitHub OAuth failed',
      };
    }
  }

  /**
   * Handle deep link OAuth callback
   * This can be used if the app receives a deep link redirect
   */
  async handleOAuthCallback(url: string): Promise<OAuthResult> {
    try {
      const urlObj = new URL(url);
      const token = urlObj.searchParams.get('token');
      const error = urlObj.searchParams.get('error');

      if (error) {
        return {
          success: false,
          error: error === 'oauth_failed' ? 'OAuth authentication failed' : error,
        };
      }

      if (!token) {
        return {
          success: false,
          error: 'No authentication token received',
        };
      }

      // Store token in API service
      await apiService.setToken(token);

      // Get user info to store locally
      const userResult = await apiService.getProfile();
      if (userResult.success && userResult.data) {
        await apiService.storeUser(userResult.data);
      }

      return {
        success: true,
        token,
      };
    } catch (error) {
      console.error('OAuth callback error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OAuth callback failed',
      };
    }
  }

  /**
   * Get the redirect URI used for OAuth
   */
  getRedirectUri(): string {
    return this.redirectUri;
  }
}

// Create and export singleton instance
export const oauthService = new OAuthService();
export default oauthService;