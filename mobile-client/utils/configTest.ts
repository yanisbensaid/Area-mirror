/**
 * Configuration Test Utility
 * Use this to verify that your configuration is properly loaded
 */

import { Config, DatabaseUtils } from '../constants';

export const ConfigTest = {
  /**
   * Test and display current configuration
   */
  displayConfig(): void {
    console.log('=== AREA Mobile Configuration ===');
    console.log('Environment:', Config.ENVIRONMENT);
    console.log('API Base URL:', Config.API_BASE_URL);
    console.log('Database URL:', Config.DATABASE.URL);
    console.log('Database Username:', Config.DATABASE.USERNAME);
    console.log('App Name:', Config.APP.NAME);
    console.log('App Version:', Config.APP.VERSION);
    console.log('Request Timeout:', Config.APP.TIMEOUT + 'ms');
    console.log('=================================');
  },

  /**
   * Test API configuration
   */
  testApiConfig(): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!Config.API_BASE_URL) {
      issues.push('API Base URL is not configured');
    }

    if (!Config.API_BASE_URL.startsWith('http')) {
      issues.push('API Base URL should start with http:// or https://');
    }

    if (Config.APP.TIMEOUT < 5000) {
      issues.push('Request timeout might be too short (< 5 seconds)');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  },

  /**
   * Test database configuration
   */
  testDatabaseConfig(): { isValid: boolean; issues: string[] } {
    const validation = DatabaseUtils.validateConfig();
    return {
      isValid: validation.isValid,
      issues: validation.errors
    };
  },

  /**
   * Run all configuration tests
   */
  runAllTests(): void {
    console.log('Running configuration tests...');
    
    this.displayConfig();
    
    const apiTest = this.testApiConfig();
    console.log('API Configuration:', apiTest.isValid ? '✅ Valid' : '❌ Invalid');
    if (!apiTest.isValid) {
      apiTest.issues.forEach(issue => console.log('  - ' + issue));
    }

    const dbTest = this.testDatabaseConfig();
    console.log('Database Configuration:', dbTest.isValid ? '⚠️  Valid (password needed)' : '❌ Invalid');
    if (!dbTest.isValid) {
      dbTest.issues.forEach(issue => console.log('  - ' + issue));
    }

    console.log('Configuration test completed.');
  }
};

export default ConfigTest;