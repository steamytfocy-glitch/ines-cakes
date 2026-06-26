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

## Phase 2 — order privacy (DONE in code on branch `phase2-privacy`)
Orders now protect customer data:
- Each order is its own record under `orders/{id}`. The public **can create**
  an order but **cannot read or edit** anyone's orders — only a signed-in
  admin can read them. So customer names/phones/emails are no longer exposed.
- Order **tracking** reads a separate `order-status/{code}` record that holds
  only non-personal fields (status, note, date, size, flavour, total). No
  names/phones/emails are ever served to the public.

**Reviews** are still left open for now (they're public anyway). Locking
reviews to "create-only" is a small future step.

### Phase 2 deploy runbook (do code + rules together)
Because the new code needs the new rules and vice-versa, deploy them in one
go, at a quiet time, and test immediately:

1. **Publish the updated rules** (Realtime Database → Rules → paste
   [`database.rules.json`](database.rules.json) → Publish). It now contains the
   `orders` / `order-status` sections.
2. **Merge the branch** so the new code goes live:
   ```
   git checkout main
   git merge phase2-privacy
   git push
   ```
3. **Test right away** (hard-refresh, Ctrl+F5):
   - Place a **test order** on the live site → you should reach the Thank-you
     page with a code.
   - Open `/admin` (logged in) → the test order appears; change its status.
   - Open `/order?code=INES-XXXX` and `/myorders` → the status shows. No
     customer name/phone is shown on those public pages.
4. **If anything breaks**, roll back fast:
   ```
   git revert --no-edit HEAD   # or: git reset --hard <previous>; git push --force-with-lease
   git push
   ```
   and re-publish the previous rules (orders/reviews `read:true, write:true`).

Existing (old) orders are picked up automatically — when you open the admin
Orders tab once, each old order gets its public `order-status` record created
so it can still be tracked.

## Adding/removing admins later
Do it in **Authentication → Users** (add user / delete user). No code change.
