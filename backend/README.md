# AREA Backend - Laravel API

This is the backend API for the AREA project, built with Laravel.

## 🗄️ Database Setup

We use a shared PostgreSQL database hosted on **Neon.tech** for team development.

### Prerequisites

- PHP 8.2+
- Composer
- PostgreSQL extension for PHP (`php-pgsql`)

### First-Time Setup

#### 1. Get Database Credentials

Contact the team lead for Neon database credentials. You'll receive:
- `DB_HOST`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`

#### 2. Configure Environment

```bash
cp .env.example .env
```

Open `.env` and fill in the database credentials provided:

```env
DB_CONNECTION=pgsql
DB_HOST=ep-xxxxx.eu-central-1.aws.neon.tech
DB_PORT=5432
DB_DATABASE=neondb
DB_USERNAME=neondb_owner
DB_PASSWORD=your_password_here
```

#### 3. Generate Application Key

```bash
php artisan key:generate
```

#### 4. Configure YouTube OAuth

Follow the guide in `docs/YOUTUBE_SETUP.md` to:
- Create your personal Google Cloud project
- Get OAuth credentials
- Add them to your `.env`

#### 5. Database Migration (First Person Only)

**⚠️ Important**: Only ONE team member should run this initially!

If you're the first person setting up:

```bash
php artisan migrate
php artisan db:seed --class=DevelopmentSeeder
```

If someone already migrated, skip this step.

#### 6. Verify Setup

```bash
php artisan db:verify
```

You should see:
```
🔍 Verifying database setup...

✅ Database connection: OK
✅ Table 'users': exists
✅ Table 'user_service_tokens': exists
✅ Table 'areas': exists
✅ Database contains 2 user(s)

🎉 Database setup verified successfully!
```

#### 7. Start Development

```bash
php artisan serve
```

Backend runs on `http://localhost:8000`

### Test Accounts

After seeding, you can log in with:
- **User**: `test@area.com` / `password`
- **Admin**: `admin@area.com` / `password`

### Important Notes

#### Security
- ⚠️ **NEVER** commit `.env` to Git (already in `.gitignore`)
- ⚠️ **NEVER** put real credentials in `.env.example`
- ✅ Share credentials only via private team channels (Discord/Slack)

#### Migrations
- 🔄 Coordinate with team before running new migrations
- 📢 Announce in team chat: "Running migration X"
- ⚠️ Only ONE person runs each migration

#### Team Workflow
- 👥 Everyone sees the same data
- 📊 Perfect for testing and demos
- 🔄 Changes by one person are visible to all

### Troubleshooting

#### "SQLSTATE[08006] Connection refused"
- ✅ Check credentials are correct (no spaces)
- ✅ Verify Neon project is active
- ✅ Check internet connection

#### "SQLSTATE[08001] SSL connection required"
- ✅ Verify `config/database.php` has `'sslmode' => 'require'`

#### "SQLSTATE[25P02]: In failed sql transaction"
- ✅ You're using the pooler endpoint (`-pooler` in hostname)
- ✅ Use the **direct endpoint** (without `-pooler`) for migrations
- ✅ Example: `ep-xxxxx.c-2.eu-central-1.aws.neon.tech` instead of `ep-xxxxx-pooler.c-2...`
- ℹ️ The pooler uses transaction mode which conflicts with Laravel's migration transactions

#### "Base table or view not found"
- ✅ Database not migrated yet
- ✅ Run: `php artisan migrate`

#### "Access denied for user"
- ✅ Wrong username or password
- ✅ Request credentials again from team lead

## 📚 About Laravel

Laravel is a web application framework with expressive, elegant syntax. Learn more at [laravel.com](https://laravel.com).

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
