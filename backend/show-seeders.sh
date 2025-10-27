#!/bin/bash

echo "📦 Available Seeders"
echo "===================="
echo ""

SEEDER_DIR="$(dirname "$0")/database/seeders"

for file in "$SEEDER_DIR"/*.php; do
    filename=$(basename "$file" .php)
    echo "📄 $filename"
    
    # Show what it does
    if grep -q "Service::" "$file"; then
        echo "   → Seeds Services"
    fi
    if grep -q "Action::" "$file"; then
        echo "   → Seeds Actions"
    fi
    if grep -q "Reaction::" "$file"; then
        echo "   → Seeds Reactions"
    fi
    if grep -q "User::" "$file"; then
        echo "   → Seeds Users"
    fi
    if grep -q "\$this->call" "$file"; then
        echo "   → Calls other seeders:"
        grep -oP "(?<=\$this->call\()[^)]*" "$file" | sed 's/::class//' | sed 's/^/      • /'
    fi
    echo ""
done

echo "Commands:"
echo "  php artisan db:seed                              # Run all"
echo "  php artisan db:seed --class=ServicesSeeder       # Run specific"
echo "  php artisan migrate:fresh --seed                 # Fresh DB + seed"
