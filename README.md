# AB Ad World

This repository is a static HTML/CSS/JavaScript website. The AB Ad World rate list is loaded from Supabase; it does not use local demo services as the catalogue source of truth.

## What is included

- Modern storefront homepage and navigation
- Product listing and detail pages
- Product image and JSON specification management from the admin dashboard
- Shopping cart with customer-authenticated order requests
- Customer sign-up/sign-in, password reset, favorites, and order history
- Service pages for design, marketing and website work
- Portfolio section and blog section
- Contact and FAQ pages
- Legal page drafts for privacy, terms, shipping, refunds and cancellation
- Admin dashboard gated by Supabase Auth and an `app_metadata.role = admin` claim
- Product image uploads to a public Supabase Storage bucket with admin-only writes
- Supabase schema and RLS starter files in `supabase/`

## Local usage

Open the project in a browser through a local static server:

```bash
cd "c:/Users/m/Downloads/amit-bharti-main"
python -m http.server 8000
```

Then open:

- http://localhost:8000/
- http://localhost:8000/admin/

## Supabase setup

1. In Supabase, run `001_init.sql` through `013_service_images.sql` in order in the SQL Editor. These migrations set up the rate list, customer commerce/favorites, content/settings/enquiries, shipping-address/dimension support, editable page sections/banners, media metadata, customer-owned profile access, portfolio video support, homepage service categories, and service images.
2. Copy the project URL and public anon/publishable key into `supabase-config.js` as `url` and `anonKey`. `.env.example` records the placeholder names, but this plain static site does not load `.env`. Never put a service-role key in browser code.
3. In Supabase Authentication settings, set the site URL and add the local and production account callback URLs (for example `http://localhost:8000/account.html`). Set the email confirmation/reset redirect URLs to the account page.
4. Create your administrator in Supabase Auth: open **Authentication → Users → Add user**, enter the admin email and a strong password, and confirm the user. The password is managed by Supabase Auth; do not store it in source code or site settings. Then set the admin claim in SQL Editor using the exact email:

	```sql
	UPDATE auth.users
	SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
	WHERE email = 'ADMIN_EMAIL_HERE';
	```

	Do not set this in `user_metadata`, do not expose a service-role key in the website, and sign out/in again after changing the claim so the JWT refreshes.
5. Open `/admin/` and sign in. Add products with an image, JSON specifications, category and price. Newly created products are drafts until “Publish product” is selected.
6. Review the seeded advertising drafts in the Services tab. Ambiguous items remain hidden until an authorized admin confirms and publishes them.
7. Use the Media Library for uploads, Page Sections to add/reorder/remove page blocks, and Banners to schedule offers. Uploads accept PNG, JPG or WebP up to 8 MB.
	Add website projects under Portfolio with category `Website`; the homepage has a separate website-work section for published entries.
8. Deploy the Edge Functions in `supabase/functions/` and set their secrets in **Project Settings → Edge Functions → Secrets** (or `supabase secrets set`): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `PAYMENTS_ENABLED=false`, `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`, and `SHIPROCKET_PICKUP_LOCATION`. The service-role key belongs only in Edge Function secrets.
9. Configure the Razorpay webhook to the deployed `razorpay-webhook` function URL for captured/failed payment events and use the same webhook secret. `PAYMENTS_ENABLED` is intentionally false until the owner confirms tax treatment and delivery charges.

With the Supabase CLI installed and linked to the project, the deploy commands are:

```bash
supabase functions deploy create-razorpay-order --project-ref YOUR_PROJECT_REF
supabase functions deploy razorpay-webhook --project-ref YOUR_PROJECT_REF
supabase functions deploy create-shiprocket-shipment --project-ref YOUR_PROJECT_REF
```

The Razorpay webhook URL is `https://YOUR_PROJECT_REF.supabase.co/functions/v1/razorpay-webhook`. Configure `payment.captured`, `order.paid`, and `payment.failed` events in Razorpay. Add secret values in Supabase **Edge Function Secrets** or with the CLI; do not paste them into this repository. `PAYMENTS_ENABLED` must remain `false` until GST and shipping totals are correctly represented by the server-side checkout.

The migrations alter the existing legacy `services` table compatibly. Public product and service reads are limited to published/approved items. Customer favorites and order history are owner-scoped. Order creation runs through `create_customer_order`, which rechecks product publication and calculates prices in PostgreSQL.

The browser uses the Supabase JavaScript v2 CDN client and only the public anon/publishable key. SQL policy enforcement is authoritative; hiding the editor in the UI is not the security boundary.

## Important notes

- The rate catalogue displays a configuration error until Supabase URL/key are supplied and the migration has run.
- No service-role key or real secret is committed.
- Business contact details are intentionally left editable in the admin screen instead of hard-coded values.
- Legal pages are drafted for business-owner review before publication.

## Admin and customer workflows

Open `/admin/` and sign in with the Auth account whose app metadata contains `role: admin`. Product management supports create/edit, archive/publish, image upload, specifications, and parcel data. The Services tab manages rates. Blog, portfolio, business settings, enquiries, orders and shipments are persisted in Supabase. Customers use `/account.html` to manage their account, favorites, order history and tracking. Checkout creates an unpaid pending request; Razorpay remains server-disabled until its secrets and tax/freight rules are configured.

## Supabase migration notes

Migrations are in `supabase/migrations/001_init.sql` through `013_service_images.sql`. Edge Function JWT settings are in `supabase/config.toml`.

## Verify the catalogue

- Run the migration in the Supabase SQL Editor and confirm `services` has 29 rows from this seed.
- Confirm anon access returns only rows with `is_active = true` and `needs_confirmation = false`.
- Confirm anon insert/update/delete fail and a non-admin authenticated account cannot manage rows.
- Sign in as the admin claim account at `/admin/`; create an item as a draft, then approve it and confirm it appears at `/services.html`.
- Search and filter the public catalogue at mobile and desktop widths.
- Create a published product as admin with an image and specifications; verify it appears in the storefront and detail page.
- Upload an image, create a homepage gallery section and a scheduled banner, and verify their visibility controls on phone and desktop.
- Install the PWA from the browser install prompt. The cached shell works offline, but Supabase content needs connectivity.
- Sign up as a customer, save/unsave a favorite, create an order request, then verify only that account sees its order and favorites.
- Confirm an ordinary authenticated customer cannot write products, upload product images, or read another customer's orders.
- Submit a contact form and verify the enquiry appears only in the admin inbox.
- Test a Razorpay payment in test mode, verify a valid signed webhook updates the order, and confirm invalid signatures are rejected.

For local UI checks, run `python -m http.server 8000` and open `http://localhost:8000/services.html` and `http://localhost:8000/admin/`.

## Current gaps requiring owner confirmation

- Real business phone and WhatsApp number
- Email address and map URL
- Actual portfolio assets and project proof
- Apply any missing migrations through `013` to the live project; the repository includes the content/CMS, media, profile self-service, portfolio video, service category and service image changes, but their live deployment must be confirmed.
- Deploy Edge Functions and set provider credentials; no Edge Function CLI/access token is configured in this workspace.
- Confirm GST-inclusive vs GST-exclusive pricing and applicable product tax rates before enabling `PAYMENTS_ENABLED`.
- Confirm customer shipping charges/free-shipping policy, pickup location, and courier services before charging customers or creating live shipments.
- Add Razorpay and Shiprocket test/production credentials in Edge Function secrets, never in the frontend.
- Complete product weights/dimensions/HSN data for actual inventory before carrier booking.
- The website is PWA-installable from a supported mobile browser. Producing a signed Android APK requires packaging the deployed HTTPS PWA as a Trusted Web Activity and signing that Android package.
- Product variants, stock reservation, coupons, refund workflows, and transactional email policies.
- Final owner review of business contact details, media, product copy, and legal text

These values must be confirmed by the business owner before a public production deployment.
