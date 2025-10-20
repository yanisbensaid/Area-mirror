<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class VerifyDatabaseSetup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:verify';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verify database connection and setup';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🔍 Verifying database setup...');
        $this->newLine();

        // Test connection
        try {
            DB::connection()->getPdo();
            $this->info('✅ Database connection: OK');
            $this->info('   Host: ' . config('database.connections.pgsql.host'));
            $this->info('   Database: ' . config('database.connections.pgsql.database'));
        } catch (\Exception $e) {
            $this->error('❌ Database connection: FAILED');
            $this->error('   ' . $e->getMessage());
            return self::FAILURE;
        }

        $this->newLine();

        // Check required tables
        $requiredTables = ['users', 'user_service_tokens', 'areas'];
        $allTablesExist = true;

        foreach ($requiredTables as $table) {
            if (Schema::hasTable($table)) {
                $this->info("✅ Table '{$table}': exists");
            } else {
                $this->warn("⚠️  Table '{$table}': missing");
                $allTablesExist = false;
            }
        }

        if (!$allTablesExist) {
            $this->newLine();
            $this->warn('⚠️  Some tables are missing.');
            $this->warn('   Run: php artisan migrate');
            return self::FAILURE;
        }

        $this->newLine();

        // Check if data exists
        try {
            $userCount = DB::table('users')->count();
            if ($userCount > 0) {
                $this->info("✅ Database contains {$userCount} user(s)");
            } else {
                $this->warn('⚠️  No users found.');
                $this->warn('   Run: php artisan db:seed --class=DevelopmentSeeder');
            }
        } catch (\Exception $e) {
            // Table might not exist yet
        }

        $this->newLine();
        $this->info('🎉 Database setup verified successfully!');

        return self::SUCCESS;
    }
}
