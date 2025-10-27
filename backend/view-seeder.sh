#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: ./view-seeder.sh <SeederName>"
    echo ""
    echo "Available seeders:"
    ls database/seeders/*.php | xargs -n1 basename | sed 's/.php//'
    exit 1
fi

SEEDER_FILE="database/seeders/$1.php"

if [ ! -f "$SEEDER_FILE" ]; then
    echo "❌ Seeder not found: $SEEDER_FILE"
    exit 1
fi

cat "$SEEDER_FILE"
