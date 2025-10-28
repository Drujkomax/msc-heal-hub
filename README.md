# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/17fb346b-fc3d-4daf-aa51-9829d6daf696

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/17fb346b-fc3d-4daf-aa51-9829d6daf696) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/17fb346b-fc3d-4daf-aa51-9829d6daf696) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Environment Configuration & Secrets

This project uses **Supabase Edge Function Secrets** for managing sensitive credentials. No `.env` files are used in production.

### Public Configuration

Public constants are centralized in `src/shared/config/constants.ts`:
- Edge Functions base URL
- Telegram bot username
- Support email
- App metadata

To update public config, edit `constants.ts` directly.

### Server-Side Secrets

Sensitive credentials are stored in **Supabase Dashboard → Project Settings → Edge Functions → Secrets**:

Required secrets:
- `TELEGRAM_BOT_TOKEN` - Bot token from @BotFather
- `BOT_BACKEND_JWT` - JWT for bot authorization (generate with `openssl rand -base64 64`)
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-provided by Supabase

### Setting Up Secrets

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to Settings → Edge Functions → Secrets
4. Add each secret with its value
5. Edge Functions will automatically use these secrets via `Deno.env.get()`

### Stage vs Production

Use **separate Lovable/Supabase projects**:
- `msc-heal-hub-stage` - Testing environment
- `msc-heal-hub-prod` - Production environment

Each project has its own:
- Supabase credentials
- Edge Function secrets
- `EDGE_BASE_URL` in `constants.ts`

See `ENV_AUDIT.md` and `SECURITY_ROTATION.md` for detailed procedures.
