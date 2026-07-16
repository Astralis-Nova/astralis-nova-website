# Astralis Nova website update

This update adds:

- A public, immediate-posting old-school guestbook
- A working Contact form routed to `ramon_bivens@yahoo.com`
- A working Subscribe form routed to the same inbox
- A fixed background-music player
- Better mobile behavior, form feedback, accessibility labels, and security headers
- An admin-only API for removing unwanted guestbook entries

## 1. Copy the update into the existing repository

Copy these files and folders into the root of `astralis-nova-website`:

- `index.html` — replace the current file
- `functions` — new folder
- `schema.sql` — new file
- `_headers` — new file
- `ADD-BACKGROUND-MUSIC.txt` — new instructions

Keep the existing files:

- `hero.svg`
- `cover-1.svg` through `cover-27.svg`
- `.git`
- existing README files

## 2. Create the Cloudflare D1 guestbook database

In Cloudflare:

1. Open **Workers & Pages**.
2. Open the `astralis-nova-website` Pages project.
3. Open **Bindings** and add a **D1 database binding**.
4. Create or select a database named `astralis-nova-guestbook`.
5. Set the binding variable name to exactly `DB`.
6. Add the binding to both **Production** and **Preview** if Cloudflare shows both choices.

Cloudflare Pages Functions use the `/functions` folder for file-based routes, and
the code expects the D1 binding at `env.DB`.

## 3. Run the database schema

Open the new D1 database in Cloudflare, choose its SQL console, paste the contents
of `schema.sql`, and run it.

The schema creates the public guestbook table and the indexes used for sorting
and basic repeat-post protection.

Optional Wrangler command:

```bash
npx wrangler d1 execute astralis-nova-guestbook --remote --file=schema.sql
```

## 4. Add environment variables

In the Pages project's settings, add these variables:

```text
FORM_DESTINATION=ramon_bivens@yahoo.com
GUESTBOOK_SALT=replace-with-a-long-random-private-string
ADMIN_TOKEN=replace-with-another-long-random-private-string
```

Do not commit the private salt or admin token into GitHub.

`FORM_DESTINATION` has a built-in fallback to Ramon's Yahoo address, but setting
it in Cloudflare makes the destination easier to change later.

## 5. Activate Contact and Subscribe email delivery

The first Contact or Subscribe submission triggers a FormSubmit confirmation
email to `ramon_bivens@yahoo.com`.

Open that email and click the confirmation link. After confirmation, new form
submissions are delivered to the Yahoo inbox.

The Contact section also includes a direct `mailto:` link as a fallback.

## 6. Add background music

Copy a legally owned MP3 into the website root and name it exactly:

```text
background-music.mp3
```

The player is already connected to that filename. Visitors must press Play;
modern browsers generally do not allow a site to start audible music
automatically.

## 7. Commit and publish

In GitHub Desktop:

1. Return to the repository.
2. Review the changed and new files.
3. Use the summary: `Add guestbook, contact, subscribe, and music player`
4. Click **Commit to main**.
5. Click **Push origin**.

Cloudflare Pages should redeploy from GitHub automatically.

## 8. Test after deployment

Test all of the following on the live Pages address:

- Sign the guestbook and confirm the entry appears immediately.
- Refresh the page and confirm the entry remains.
- Send a Contact message.
- Submit a Subscribe email.
- Play and pause the background music.
- Test on a phone-sized screen.

## Removing an unwanted guestbook entry

The delete endpoint requires the private `ADMIN_TOKEN`.

First find the entry ID by opening:

```text
https://astralis-nova-website.pages.dev/api/guestbook
```

Then delete it from a terminal:

```bash
curl -X DELETE ^
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" ^
  "https://astralis-nova-website.pages.dev/api/guestbook/ENTRY_ID"
```

On macOS or Linux, replace the Windows `^` line continuations with `\`.

You can also delete an entry directly from the D1 SQL console:

```sql
DELETE FROM guestbook_entries WHERE id = 'ENTRY_ID';
```

## Notes

Guestbook entries are public immediately, as requested. The backend:

- treats visitor text as plain text rather than HTML
- limits field lengths
- rejects script-like content and link spam
- applies a 30-second repeat-post delay per hashed visitor IP
- stores only a salted hash of the visitor IP, not the original IP
