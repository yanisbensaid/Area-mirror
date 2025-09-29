<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class IconService
{
    /**
     * Automatically find an icon URL for a service
     */
    public static function findIconForService(string $serviceName): ?string
    {
        // Try different icon sources in order of preference
        $iconUrl = self::tryLogoAPI($serviceName) ?:
                   self::tryBrandfetch($serviceName) ?:
                   self::trySimpleIconsAPI($serviceName) ?:
                   self::tryGoogleIcons($serviceName) ?:
                   self::tryLocalIcons($serviceName);

        return $iconUrl;
    }

    /**
     * Try Logo.dev API (free service for brand logos)
     */
    private static function tryLogoAPI(string $serviceName): ?string
    {
        try {
            $cleanName = strtolower(trim($serviceName));

            // Common domain mappings
            $domainMap = [
                'google' => 'google.com',
                'github' => 'github.com',
                'microsoft' => 'microsoft.com',
                'spotify' => 'spotify.com',
                'telegram' => 'telegram.org',
                'discord' => 'discord.com',
                'slack' => 'slack.com',
                'twitter' => 'twitter.com',
                'facebook' => 'facebook.com',
                'instagram' => 'instagram.com',
                'youtube' => 'youtube.com',
                'linkedin' => 'linkedin.com',
                'dropbox' => 'dropbox.com',
                'notion' => 'notion.so',
                'trello' => 'trello.com',
                'twitch' => 'twitch.tv',
            ];

            $domain = $domainMap[$cleanName] ?? $cleanName . '.com';
            $logoUrl = "https://logo.clearbit.com/{$domain}";

            // Test if the URL returns a valid image
            $response = Http::timeout(10)->head($logoUrl);
            if ($response->successful()) {
                return $logoUrl;
            }
        } catch (\Exception $e) {
            Log::warning("Logo API failed for {$serviceName}: " . $e->getMessage());
        }

        return null;
    }

    /**
     * Try Brandfetch API (has free tier)
     */
    private static function tryBrandfetch(string $serviceName): ?string
    {
        try {
            $response = Http::timeout(10)
                ->withHeaders(['Accept' => 'application/json'])
                ->get("https://api.brandfetch.io/v2/search/{$serviceName}");

            if ($response->successful()) {
                $data = $response->json();
                if (!empty($data) && isset($data[0]['icon'])) {
                    return $data[0]['icon'];
                }
            }
        } catch (\Exception $e) {
            Log::warning("Brandfetch API failed for {$serviceName}: " . $e->getMessage());
        }

        return null;
    }

    /**
     * Try Simple Icons API (free, has many brand icons)
     */
    private static function trySimpleIconsAPI(string $serviceName): ?string
    {
        try {
            $cleanName = strtolower(str_replace([' ', '-', '_'], '', $serviceName));

            // Simple Icons CDN URL
            $iconUrl = "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/{$cleanName}.svg";

            $response = Http::timeout(10)->head($iconUrl);
            if ($response->successful()) {
                return $iconUrl;
            }
        } catch (\Exception $e) {
            Log::warning("Simple Icons API failed for {$serviceName}: " . $e->getMessage());
        }

        return null;
    }

    /**
     * Try Google's favicon service
     */
    private static function tryGoogleIcons(string $serviceName): ?string
    {
        try {
            $cleanName = strtolower(trim($serviceName));
            $domain = $cleanName . '.com';

            // Google's favicon service
            $iconUrl = "https://www.google.com/s2/favicons?domain={$domain}&sz=64";

            return $iconUrl;
        } catch (\Exception $e) {
            Log::warning("Google Icons failed for {$serviceName}: " . $e->getMessage());
        }

        return null;
    }

    /**
     * Fallback to local icons
     */
    private static function tryLocalIcons(string $serviceName): ?string
    {
        $cleanName = strtolower(str_replace([' ', '-', '_'], '', $serviceName));
        $localPath = "/app_logo/{$cleanName}.png";

        // Check if local file exists
        if (file_exists(public_path($localPath))) {
            return url($localPath);
        }

        return null;
    }

    /**
     * Download and save icon locally (optional)
     */
    public static function downloadAndSaveIcon(string $iconUrl, string $serviceName): ?string
    {
        try {
            $response = Http::timeout(30)->get($iconUrl);

            if ($response->successful()) {
                $cleanName = strtolower(str_replace([' ', '-', '_'], '', $serviceName));
                $extension = pathinfo(parse_url($iconUrl, PHP_URL_PATH), PATHINFO_EXTENSION) ?: 'png';
                $filename = "app_logo/{$cleanName}.{$extension}";
                $fullPath = public_path($filename);

                // Create directory if it doesn't exist
                $directory = dirname($fullPath);
                if (!is_dir($directory)) {
                    mkdir($directory, 0755, true);
                }

                file_put_contents($fullPath, $response->body());

                return url($filename);
            }
        } catch (\Exception $e) {
            Log::error("Failed to download icon for {$serviceName}: " . $e->getMessage());
        }

        return null;
    }
}
