ASTRALIS NOVA — STEP 1: SAVE CONTACT AND SUBSCRIBE FORMS IN D1

This removes the external FormSubmit dependency that caused the
"Rate limit exceeded" error.

FILES TO COPY INTO YOUR WEBSITE REPOSITORY

1. Replace:
   functions\api\forms.js

2. Replace:
   schema.sql

3. Replace:
   index.html

The index.html change only updates the success/fine-print wording so it
correctly says that submissions are stored privately.

CLOUDFLARE DATABASE STEP

1. Open Cloudflare.
2. Open D1 SQL Database.
3. Open astralis-nova-guestbook.
4. Open Console.
5. Open RUN-THIS-SQL-IN-CLOUDFLARE.sql from this package.
6. Copy all of its contents into the Console.
7. Click Execute/Run.

The SQL creates:
- contact_messages
- subscribers

It does not erase or change existing guestbook entries.

PUBLISH

In GitHub Desktop:

1. Review the changed files.
2. Summary:
   Store contact and subscribers in D1
3. Commit to main.
4. Push origin.
5. Wait for the Cloudflare deployment to show Success.

TEST

1. Submit one Contact message.
2. Submit one Subscribe email.
3. In the D1 Console, run:

SELECT name, email, subject, message, status, created_at
FROM contact_messages
ORDER BY created_at DESC;

4. Then run:

SELECT email, status, created_at, updated_at
FROM subscribers
ORDER BY created_at DESC;

IMPORTANT

This step stores submissions safely in D1 and removes the third-party
rate-limit problem. It does not send a Yahoo email notification yet.
Email notification/admin inbox is a later checklist item.
