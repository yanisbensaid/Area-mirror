#!/bin/bash

echo "📊 AREA Database Viewer"
echo "======================="
echo ""

cd "$(dirname "$0")"

case "${1:-menu}" in
  services)
    php artisan tinker --execute="
    \$services = \App\Models\Service::all();
    echo str_pad('ID', 4) . str_pad('Name', 20) . str_pad('Status', 10) . 'Auth Type' . PHP_EOL;
    echo str_repeat('-', 60) . PHP_EOL;
    foreach (\$services as \$s) {
        echo str_pad(\$s->id, 4) . str_pad(\$s->name, 20) . str_pad(\$s->status, 10) . \$s->auth_type . PHP_EOL;
    }
    "
    ;;
    
  actions)
    php artisan tinker --execute="
    \$actions = \App\Models\Action::all();
    echo str_pad('ID', 4) . str_pad('Service', 15) . str_pad('Key', 30) . 'Name' . PHP_EOL;
    echo str_repeat('-', 80) . PHP_EOL;
    foreach (\$actions as \$a) {
        echo str_pad(\$a->id, 4) . str_pad(\$a->service_name, 15) . str_pad(\$a->action_key, 30) . \$a->name . PHP_EOL;
    }
    "
    ;;
    
  reactions)
    php artisan tinker --execute="
    \$reactions = \App\Models\Reaction::all();
    echo str_pad('ID', 4) . str_pad('Service', 15) . str_pad('Key', 30) . 'Name' . PHP_EOL;
    echo str_repeat('-', 80) . PHP_EOL;
    foreach (\$reactions as \$r) {
        echo str_pad(\$r->id, 4) . str_pad(\$r->service_name, 15) . str_pad(\$r->reaction_key, 30) . \$r->name . PHP_EOL;
    }
    "
    ;;
    
  users)
    php artisan tinker --execute="
    \$users = \App\Models\User::all();
    echo str_pad('ID', 4) . str_pad('Name', 20) . str_pad('Email', 30) . 'Role' . PHP_EOL;
    echo str_repeat('-', 70) . PHP_EOL;
    foreach (\$users as \$u) {
        echo str_pad(\$u->id, 4) . str_pad(\$u->name, 20) . str_pad(\$u->email, 30) . (\$u->role ?? 'user') . PHP_EOL;
    }
    "
    ;;
    
  tokens)
    php artisan tinker --execute="
    \$tokens = \App\Models\UserServiceToken::with('user')->get();
    echo str_pad('ID', 4) . str_pad('User', 20) . str_pad('Service', 15) . 'Connected' . PHP_EOL;
    echo str_repeat('-', 70) . PHP_EOL;
    foreach (\$tokens as \$t) {
        echo str_pad(\$t->id, 4) . str_pad(\$t->user->name ?? 'N/A', 20) . str_pad(\$t->service_name, 15) . \$t->created_at->diffForHumans() . PHP_EOL;
    }
    "
    ;;
    
  areas)
    php artisan tinker --execute="
    \$areas = \App\Models\Area::all();
    echo str_pad('ID', 4) . str_pad('Name', 25) . str_pad('Action', 15) . str_pad('Reaction', 15) . 'Active' . PHP_EOL;
    echo str_repeat('-', 80) . PHP_EOL;
    foreach (\$areas as \$a) {
        echo str_pad(\$a->id, 4) . str_pad(\$a->name, 25) . str_pad(\$a->action_service, 15) . str_pad(\$a->reaction_service, 15) . (\$a->active ? '✓' : '✗') . PHP_EOL;
    }
    "
    ;;
    
  *)
    echo "Usage: ./view-db.sh [command]"
    echo ""
    echo "Commands:"
    echo "  services   - View all services"
    echo "  actions    - View all actions"
    echo "  reactions  - View all reactions"
    echo "  users      - View all users"
    echo "  tokens     - View service connections"
    echo "  areas      - View all AREAs"
    echo ""
    echo "Example: ./view-db.sh services"
    ;;
esac
