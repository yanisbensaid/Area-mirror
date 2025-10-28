/**
 * Database Configuration Utility
 * 
 * Note: Direct database connections from mobile apps are generally not recommended
 * for security reasons. This configuration is provided for reference and should
 * typically be used server-side only.
 */

import Config from './config';

export interface DatabaseConfig {
  url: string;
  username: string;
  // Password should be provided at runtime, not stored in code
  getConnectionString: (password: string) => string;
}

export const DatabaseUtils = {
  /**
   * Get database configuration
   */
  getConfig(): DatabaseConfig {
    return {
      url: Config.DATABASE.URL,
      username: Config.DATABASE.USERNAME,
      getConnectionString: (password: string) => {
        // Note: This would typically be used server-side
        // Mobile apps should use API endpoints instead of direct DB connections
        return `postgresql://${Config.DATABASE.USERNAME}:${password}@${Config.DATABASE.URL}`;
      }
    };
  },

  /**
   * Validate database connection parameters
   */
  validateConfig(password?: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Config.DATABASE.URL) {
      errors.push('Database URL is required');
    }

    if (!Config.DATABASE.USERNAME) {
      errors.push('Database username is required');
    }

    if (!password) {
      errors.push('Database password is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Get database info for display purposes (without sensitive data)
   */
  getDisplayInfo() {
    return {
      url: Config.DATABASE.URL,
      username: Config.DATABASE.USERNAME,
      environment: Config.ENVIRONMENT,
    };
  }
};

export default DatabaseUtils;