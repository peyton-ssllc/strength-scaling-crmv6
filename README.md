# Strength Scaling CRM

Polished deployable CRM v1.

Required Vercel environment variables:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

Optional calendar embed:

- NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL

Core routes:

- /import-leads
- /contacts
- /contacts/[id]
- /queue
- /dashboard
- /pipeline-clients
- /calendar


Latest batch includes:

- Manual add contact
- Manual delete contact
- Pipeline new account form
- Contact detail call logging
- Members page for SDR/Admin login creation
- Queue status save fix for Supabase allowed statuses
