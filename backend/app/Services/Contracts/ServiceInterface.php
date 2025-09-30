<?php

namespace App\Services\Contracts;

/**
 * Service Interface - Contract that all external service integrations must implement
 *
 * This interface defines the standard methods that every service (Telegram, Gmail, GitHub, etc.)
 * must implement to work with the AREA system.
 */
interface ServiceInterface
{
    /**
     * Get the service's unique name identifier
     * Used for database storage and service registry
     */
    public function getName(): string;

    /**
     * Get a human-readable description of the service
     */
    public function getDescription(): string;

    /**
     * Get the authentication type required by this service
     *
     * @return string 'none', 'api_key', 'oauth2', 'basic_auth'
     */
    public function getAuthType(): string;

    /**
     * Get all available actions (triggers) for this service
     *
     * @return array Array of action definitions with metadata
     */
    public function getAvailableActions(): array;

    /**
     * Get all available reactions (responses) for this service
     *
     * @return array Array of reaction definitions with metadata
     */
    public function getAvailableReactions(): array;

    /**
     * Authenticate the service with provided credentials
     *
     * @param array $credentials Service-specific credentials
     * @return bool True if authentication successful
     */
    public function authenticate(array $credentials): bool;

    /**
     * Check if the service is currently authenticated
     *
     * @return bool True if service has valid authentication
     */
    public function isAuthenticated(): bool;

    /**
     * Execute an action (trigger) and return the result data
     *
     * @param string $actionName Name of the action to execute
     * @param array $params Parameters for the action
     * @return mixed Action result data
     * @throws \InvalidArgumentException If action doesn't exist
     */
    public function executeAction(string $actionName, array $params): mixed;

    /**
     * Execute a reaction (response) and return success status
     *
     * @param string $reactionName Name of the reaction to execute
     * @param array $params Parameters for the reaction
     * @return bool True if reaction executed successfully
     * @throws \InvalidArgumentException If reaction doesn't exist
     */
    public function executeReaction(string $reactionName, array $params): bool;

    /**
     * Test the service connection and authentication
     *
     * @return bool True if service is reachable and authenticated
     */
    public function testConnection(): bool;

    /**
     * Set the authentication credentials for this service instance
     *
     * @param array $credentials Service-specific credentials
     * @return void
     */
    public function setCredentials(array $credentials): void;

    /**
     * Get the service's icon URL or identifier
     *
     * @return string|null Icon URL or null if no icon
     */
    public function getIcon(): ?string;

    /**
     * Get the service's primary color for UI theming
     *
     * @return string|null Hex color code or null
     */
    public function getColor(): ?string;
}