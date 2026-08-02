I.N.E.S. — SAVE POINT (2026-07-26, before the pricing/size redesign)
=====================================================================

This folder is a full snapshot of the live Firebase data taken right before
we start changing how prices & sizes work. If anything goes wrong, you can put
everything back exactly as it is now.

WHAT'S HERE
-----------
  products.json           All 73 cakes: photos, prices, sizes, everything. (~16 MB)
  default-sizes.json      The global Sizes & Prices table (6"–10", €60–€100).
  content.json            Site content (hero, shed, global price settings…).
  catalog.json            Derived listing node (rebuilt automatically by admin).
  categories.json         Cake categories.
  flavours.json           Flavours.
  prices-sizes-summary.json  Human-readable list of every cake's price + sizes
                             (no photos) — handy to eyeball or re-enter by hand.

SNAPSHOT FACTS (for verification after any change)
--------------------------------------------------
  Products:            73
  Fixed-price cakes:   11   (have one "Cake price")
  Per-size cakes:      62   (priced by size table)
  Global sizes:        6"€60 · 7"€70 · 8"€80 · 9"€90 · 10"€100

HOW TO RESTORE THE DATA (no coding needed)
------------------------------------------
1. Open the Firebase Console → Realtime Database.
2. Click the node you want to restore (e.g. "products").
3. Click the three-dots (⋮) menu on that node → "Import JSON".
4. Choose the matching file from this folder (e.g. products.json).
   ⚠ Import REPLACES that whole node with the file's contents.
5. Do the same for default-sizes if needed.
6. In the admin panel, open & re-save any cake once (or use the catalog
   rebuild) so the "catalog" listing node refreshes. Or import catalog.json.

HOW TO RESTORE THE CODE
-----------------------
The site code at this moment is tagged in git:
    pre-pricing-redesign-2026-07-26   (commit 907982e)
To go back to it:
    git checkout pre-pricing-redesign-2026-07-26     (look only)
    git revert <bad commits>                          (safe undo, keeps history)
or, to hard-reset main to it (destructive):
    git reset --hard pre-pricing-redesign-2026-07-26

Keep this folder safe. It is NOT part of the website and is not uploaded
anywhere — it only lives here on the Desktop.
