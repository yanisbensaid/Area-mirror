/**
 * OAuth Debug Test - Simple function to test OAuth URLs
 */

import Config from '../constants/config';
import apiService from '../services/api';

export const testOAuthUrls = async () => {
  console.log('=== OAuth URL Test ===');
  console.log('API Base URL:', Config.API_BASE_URL);
  
  try {
    // Test Google OAuth URL
    console.log('Testing Google OAuth URL...');
    const googleResult = await apiService.getGoogleOAuthUrl();
    console.log('Google OAuth Result:', googleResult);
    
    // Test GitHub OAuth URL
    console.log('Testing GitHub OAuth URL...');
    const githubResult = await apiService.getGitHubOAuthUrl();
    console.log('GitHub OAuth Result:', githubResult);
    
    // Test basic API connectivity
    console.log('Testing basic API connectivity...');
    const testResult = await apiService.test();
    console.log('API Test Result:', testResult);
    
  } catch (error) {
    console.error('OAuth URL Test Error:', error);
  }
  
  console.log('=== OAuth URL Test Complete ===');
};

export default testOAuthUrls;