# Malka Communications Marketing Site

This folder is a standalone static replacement concept for `www.malkacomm.com`.

## Preview

Open `index.html` directly in a browser, or run a static server from the repository root:

```sh
npx serve malkacomm
```

## Deploying to Vercel

Create a Vercel project with `malkacomm` as the project root. No build command is required; the output is the root directory itself.

The page includes a local `assets/` folder with the Malka logo, white logo, favicon, and current global communications background so the folder can deploy on its own.

## Contact Form

The contact form posts to `/api/contact`, which is a Vercel Function that sends inquiries to `info@malkacomm.com` through Resend.

Set these Vercel environment variables:

```sh
RESEND_API_KEY=...
CONTACT_FROM="Malka Communications <hello@your-verified-domain.com>"
```

`CONTACT_FROM` should use a domain verified in Resend. If the API is not configured, the browser falls back to a prepared `mailto:info@malkacomm.com` message.
