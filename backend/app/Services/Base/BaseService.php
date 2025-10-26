<?php

namespace App\Services\Base;

use App\Services\Contracts\ServiceInterface;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\RequestException;

/**
 * Base Service Class
 *
 * Provides common functionality for all external service integrations.
 * Handles HTTP requests, error handling, logging, and credential management.
 */
abstract class BaseService implements ServiceInterface
{
    protected string $name;
    protected string $description;
    protected string $authType;
    protected array $credentials = [];
    protected ?string $icon = null;
    protected ?string $color = null;

    /**
     * Maximum number of retry attempts for failed requests
     */
    protected int $maxRetries = 3;

    /**
     * Base delay in seconds for exponential backoff
     */
    protected int $baseDelay = 1;

    public function getName(): string
    {
        return $this->name;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function getAuthType(): string
    {
        return $this->authType;
    }

    public function getIcon(): ?string
    {
        return $this->icon;
    }

    public function getColor(): ?string
    {
        return $this->color;
    }

    public function setCredentials(array $credentials): void
    {
        $this->credentials = $credentials;
    }

    public function isAuthenticated(): bool
    {
        return !empty($this->credentials) && $this->validateCredentials();
    }

    /**
     * Validate that required credentials are present
     * Override in child classes for service-specific validation
     */
    protected function validateCredentials(): bool
    {
        return !empty($this->credentials);
    }

    /**
     * Make an HTTP request with error handling, retries, and logging
     *
     * @param string $method HTTP method (GET, POST, PUT, DELETE)
     * @param string $url Full URL for the request
     * @param array $data Request body data
     * @param array $options Additional HTTP client options
     * @return Response
     * @throws RequestException If all retry attempts fail
     */
    protected function makeRequest(string $method, string $url, array $data = [], array $options = []): Response
    {
        $attempt = 0;
        $lastException = null;

        while ($attempt < $this->maxRetries) {
            try {
                $attempt++;

                // Prepare HTTP client with default options
                $client = Http::timeout(30)
                    ->retry(3, 100)
                    ->withHeaders($this->getHeaders());

                // Add any additional options
                if (isset($options['headers'])) {
                    $client = $client->withHeaders($options['headers']);
                }

                // Log the request (without sensitive data)
                $this->logRequest($method, $url, $data, $attempt);

                // Make the request
                $response = match (strtoupper($method)) {
                    'GET' => $client->get($url, $data),
                    'POST' => $client->post($url, $data),
                    'PUT' => $client->put($url, $data),
                    'DELETE' => $client->delete($url, $data),
                    'PATCH' => $client->patch($url, $data),
                    default => throw new \InvalidArgumentException("Unsupported HTTP method: $method")
                };

                // Log the response
                $this->logResponse($response, $attempt);

                // If we get here, the request was successful
                return $response;

            } catch (RequestException $e) {
                $lastException = $e;

                // Log the error
                Log::warning("Service {$this->getName()} request failed", [
                    'attempt' => $attempt,
                    'method' => $method,
                    'url' => $this->sanitizeUrl($url),
                    'error' => $e->getMessage(),
                    'status' => $e->response?->status(),
                ]);

                // If this is the last attempt, don't wait
                if ($attempt >= $this->maxRetries) {
                    break;
                }

                // Exponential backoff with jitter
                $delay = $this->baseDelay * (2 ** ($attempt - 1)) + random_int(0, 1000) / 1000;
                sleep((int) $delay);
            }
        }

        // All attempts failed, throw the last exception
        Log::error("Service {$this->getName()} request failed after {$this->maxRetries} attempts", [
            'method' => $method,
            'url' => $this->sanitizeUrl($url),
            'final_error' => $lastException?->getMessage(),
        ]);

        throw $lastException;
    }

    /**
     * Get headers for API requests
     * Override in child classes to add service-specific headers
     */
    protected function getHeaders(): array
    {
        return [
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
            'User-Agent' => 'AREA-Backend/1.0',
        ];
    }

    /**
     * Log request details (sanitized for security)
     */
    protected function logRequest(string $method, string $url, array $data, int $attempt): void
    {
        Log::info("Service {$this->getName()} making request", [
            'attempt' => $attempt,
            'method' => $method,
            'url' => $this->sanitizeUrl($url),
            'data_keys' => array_keys($data), // Log keys but not values for security
        ]);
    }

    /**
     * Log response details
     */
    protected function logResponse(Response $response, int $attempt): void
    {
        Log::info("Service {$this->getName()} response received", [
            'attempt' => $attempt,
            'status' => $response->status(),
            'success' => $response->successful(),
        ]);

        if (!$response->successful()) {
            Log::warning("Service {$this->getName()} error response", [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
        }
    }

    /**
     * Sanitize URL for logging (remove sensitive tokens)
     */
    protected function sanitizeUrl(string $url): string
    {
        // Remove bot tokens and API keys from URL for logging
        return preg_replace('/bot[0-9]+:[A-Za-z0-9_-]+/', 'bot***:***', $url);
    }

    /**
     * Handle service-specific errors and convert to user-friendly messages
     */
    protected function handleApiError(Response $response): string
    {
        $status = $response->status();
        $body = $response->json();

        // Common HTTP status code handling
        return match ($status) {
            400 => 'Bad request: ' . ($body['description'] ?? 'Invalid parameters'),
            401 => 'Authentication failed: Check your credentials',
            403 => 'Access forbidden: Insufficient permissions',
            404 => 'Resource not found',
            429 => 'Rate limit exceeded: Please try again later',
            500, 502, 503, 504 => 'Service temporarily unavailable',
            default => 'Service error: ' . ($body['description'] ?? "HTTP $status")
        };
    }

    /**
     * Validate required parameters for actions/reactions
     */
    protected function validateParams(array $params, array $required): void
    {
        foreach ($required as $param) {
            if (!isset($params[$param]) || $params[$param] === '') {
                throw new \InvalidArgumentException("Missing required parameter: $param");
            }
        }
    }

    /**
     * Check if service supports rate limiting and implement basic throttling
     */
    protected function checkRateLimit(): void
    {
        // Override in child classes for service-specific rate limiting
        // This is a basic implementation that can be enhanced
        $cacheKey = "rate_limit:{$this->getName()}";

        // This is a placeholder - implement actual rate limiting based on service requirements
    }
}