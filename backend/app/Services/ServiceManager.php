<?php

namespace App\Services;

use App\Services\Contracts\ServiceInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

/**
 * Service Manager
 *
 * Central registry and factory for all external service integrations.
 * Manages service registration, retrieval, and instantiation.
 */
class ServiceManager
{
    /**
     * @var array<string, ServiceInterface> Registered service instances
     */
    private array $services = [];

    /**
     * @var array<string, string> Service name to class mapping
     */
    private array $serviceClasses = [];

    /**
     * Register a service instance
     */
    public function register(ServiceInterface $service): void
    {
        $name = $service->getName();
        $this->services[$name] = $service;
        $this->serviceClasses[$name] = get_class($service);

        Log::info("Service registered: {$name}", [
            'class' => get_class($service),
            'auth_type' => $service->getAuthType(),
        ]);
    }

    /**
     * Register a service class (lazy loading)
     */
    public function registerClass(string $name, string $serviceClass): void
    {
        if (!is_subclass_of($serviceClass, ServiceInterface::class)) {
            throw new \InvalidArgumentException(
                "Service class {$serviceClass} must implement ServiceInterface"
            );
        }

        $this->serviceClasses[$name] = $serviceClass;

        Log::info("Service class registered: {$name}", [
            'class' => $serviceClass,
        ]);
    }

    /**
     * Get a service instance by name
     */
    public function get(string $serviceName): ?ServiceInterface
    {
        // Return existing instance if available
        if (isset($this->services[$serviceName])) {
            return $this->services[$serviceName];
        }

        // Try to instantiate from registered class
        if (isset($this->serviceClasses[$serviceName])) {
            $className = $this->serviceClasses[$serviceName];

            try {
                $service = new $className();
                $this->services[$serviceName] = $service;

                Log::info("Service instantiated: {$serviceName}", [
                    'class' => $className,
                ]);

                return $service;
            } catch (\Throwable $e) {
                Log::error("Failed to instantiate service: {$serviceName}", [
                    'class' => $className,
                    'error' => $e->getMessage(),
                ]);

                return null;
            }
        }

        Log::warning("Service not found: {$serviceName}");
        return null;
    }

    /**
     * Get all registered services
     *
     * @return Collection<ServiceInterface>
     */
    public function getAll(): Collection
    {
        // Instantiate any lazy-loaded services
        foreach ($this->serviceClasses as $name => $class) {
            if (!isset($this->services[$name])) {
                $this->get($name); // This will instantiate it
            }
        }

        return collect($this->services);
    }

    /**
     * Check if a service is registered
     */
    public function has(string $serviceName): bool
    {
        return isset($this->services[$serviceName]) || isset($this->serviceClasses[$serviceName]);
    }

    /**
     * Get service names only
     */
    public function getServiceNames(): array
    {
        return array_unique(array_merge(
            array_keys($this->services),
            array_keys($this->serviceClasses)
        ));
    }

    /**
     * Get services by authentication type
     */
    public function getByAuthType(string $authType): Collection
    {
        return $this->getAll()->filter(function (ServiceInterface $service) use ($authType) {
            return $service->getAuthType() === $authType;
        });
    }

    /**
     * Remove a service from the registry
     */
    public function unregister(string $serviceName): bool
    {
        $removed = false;

        if (isset($this->services[$serviceName])) {
            unset($this->services[$serviceName]);
            $removed = true;
        }

        if (isset($this->serviceClasses[$serviceName])) {
            unset($this->serviceClasses[$serviceName]);
            $removed = true;
        }

        if ($removed) {
            Log::info("Service unregistered: {$serviceName}");
        }

        return $removed;
    }

    /**
     * Get service information for API responses
     */
    public function getServiceInfo(string $serviceName): ?array
    {
        $service = $this->get($serviceName);

        if (!$service) {
            return null;
        }

        return [
            'name' => $service->getName(),
            'description' => $service->getDescription(),
            'auth_type' => $service->getAuthType(),
            'icon' => $service->getIcon(),
            'color' => $service->getColor(),
            'actions' => $service->getAvailableActions(),
            'reactions' => $service->getAvailableReactions(),
        ];
    }

    /**
     * Get all services information for API responses
     */
    public function getAllServiceInfo(): array
    {
        return $this->getAll()
            ->map(fn(ServiceInterface $service) => $this->getServiceInfo($service->getName()))
            ->filter()
            ->values()
            ->toArray();
    }

    /**
     * Health check for all services
     */
    public function healthCheck(): array
    {
        $results = [];

        foreach ($this->getAll() as $service) {
            $name = $service->getName();

            try {
                $isHealthy = $service->testConnection();
                $results[$name] = [
                    'status' => $isHealthy ? 'healthy' : 'unhealthy',
                    'authenticated' => $service->isAuthenticated(),
                    'last_checked' => now()->toISOString(),
                ];
            } catch (\Throwable $e) {
                $results[$name] = [
                    'status' => 'error',
                    'error' => $e->getMessage(),
                    'last_checked' => now()->toISOString(),
                ];
            }
        }

        return $results;
    }
}