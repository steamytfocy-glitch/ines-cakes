# Firebase security setup (read this before merging)

This branch (`firebase-security`) replaces the fake admin login (a password
hard-coded in JavaScript) with **real Firebase Authentication**, and adds
**database security rules** so the public can no longer change your cakes,
prices, content or settings.

**Do the 3 console steps below FIRST. Then merge this branch.** If you merge
before creating the admin user, the admin page will exist but nobody can log
in yet.

---

## Step 1 — Turn on Email/Password sign-in
1. Open the [Firebase Console](https://console.firebase.google.com/) → project **ines-cakes**.
2. Left menu: **Build → Authentication** → **Get started** (if first time).
3. **Sign-in method** tab → **Email/Password** → enable the first toggle → **Save**.

## Step 2 — Create the admin user (mom's login)
1. Authentication → **Users** tab → **Add user**.
2. Enter an email (e.g. `ines@inescake.com` — it does NOT need to be a real
   inbox, it's just the login) and a strong password.
3. **Add user**. Repeat if you want a second admin.
4. This email + password is what you now type on the `/admin` login screen.

## Step 3 — Publish the security rules
1. Left menu: **Build → Realtime Database** → **Rules** tab.
2. Replace everything with the contents of [`database.rules.json`](database.rules.json) (in this repo).
3. **Publish**.

## Step 4 — Merge this branch
After steps 1–3 are done and you've confirmed you can sign in:
```
git checkout main
git merge firebase-security
git push
```
(or merge it from GitHub). Vercel will deploy and the live admin will use the
new login.

---

## What the rules do
- **Public visitors can READ** the catalogue (cakes, flavours, content,
  sizes, categories, certificates, site status) — needed for the website to
  show anything.
- **Only a signed-in admin can WRITE** those — so no one can edit your cakes,
  prices, photos, contacts or turn the site on/off.
- **Orders and reviews stay open** (read + write) so customers can place an
  order and leave a review without logging in. See Phase 2.

## Phase 2 (still open — tell me when you want it)
With the current code, orders and reviews are stored as one big list that the
app rewrites on each submit, so the rules have to leave them open. That means:
- anyone could technically read the full orders list (customer names/phones) —
  a privacy concern;
- anyone could overwrite the orders/reviews list.

Fixing this properly needs a small data-model change (store each order/review
as its own record with `push()`, allow "create only", and serve order
tracking through a limited path). That's a separate, careful change to the
ordering flow — ask me to do Phase 2 when you're ready.

## Adding/removing admins later
Do it in **Authentication → Users** (add user / delete user). No code change.
