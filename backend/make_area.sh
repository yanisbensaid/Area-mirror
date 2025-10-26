## this script will run the seeder to setup the database with intial services and automations data

echo "Initialise the database with initial services data..."

echo "Clear the database..."
php artisan migrate:fresh

echo "Run the migrations..."
php artisan migrate

echo "Run the seeders..."

echo "Seed users..."
php artisan db:seed --class=UserSeeder

echo "Seed services..."
php artisan db:seed --class=ServicesSeeder

echo "Seed actions..."
php artisan db:seed --class=ActionsSeeder

echo "Seed Reactions..."
php artisan db:seed --class=ReactionsSeeder

echo "Seed Automations..."
php artisan db:seed --class=AutomationsSeeder

echo "Database initialised!"
