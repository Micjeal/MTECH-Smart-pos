# MTECH Retail POS v4.5.0

MTECH Retail POS is an offline-first, installable point-of-sale and inventory system for independent shops. Version 4.5 gives every operational screen one coherent Sales-inspired workspace system while preserving split-stage checkout, custom colours, accessibility controls, installation readiness, sounds, barcode scanning, receipts, controlled returns, alerts, expenses, purchasing, reporting, and IndexedDB workflows.

## Project links

- Production app: https://mtech-smart-pos.vercel.app/
- GitHub repository: https://github.com/Micjeal/MTECH-Smart-pos

## Version 4.5 consistent workspace release

- Extends the Sales page hierarchy to catalogue, inventory, stock counts, purchases, customers, suppliers, expenses, alerts, reports, register controls, and settings.
- Adds a reusable hero status control so each screen pairs its main outcome with the next operational action.
- Moves Alerts and Expenses from isolated gradient banners into the same white operational hero, metric strip, toolbar, and panel language used throughout the app.
- Fixes a responsive cascade issue that could expose mobile-only receipt and approval states on desktop.
- Raises operational labels, helper text, tables, cards, and empty states to more readable sizes while retaining large-text, high-contrast, reduced-motion, and large-touch preferences.
- Strengthens mobile setup with a more prominent install action, four explicit opt-in readiness controls, clearer privacy language, and a three-stage branded startup screen.

## Version 4.4 complete frontend modernization

- Turns Dashboard into a focused daily command centre with register readiness, priority alerts, sales performance, quick operations, and responsive receipt cards.
- Adds functional All, Completed, Returned, and Voided stages to Sales & Returns, plus mobile receipt cards and approval records designed for touch.
- Converts Cash Register into a guided Open → Operate → Close workflow with cash composition, shift controls, movement timelines, and a sticky mobile action.
- Applies shared operational heroes, metric strips, touch controls, workflow guidance, responsive cards, empty states, and safe-area-aware actions to Products, Inventory, Stock Count, Purchases, Customers, Suppliers, Expenses, Alerts, Reports, and Settings.
- Adds catalogue value and stock-health summaries, controlled stock-count guidance, purchasing pipeline visibility, customer-credit monitoring, supplier-obligation summaries, and a stronger decision-focused reporting workspace.
- Keeps the selected app colours, large text, high contrast, reduced motion, and larger touch targets active throughout the new screens.

## Version 4.2 mobile experience

### Split-stage mobile checkout

- Uses a focused **Products → Cart** flow instead of squeezing the desktop catalogue and basket side by side.
- Keeps search, camera scanning, categories, product images, price, and stock status readable with one hand.
- Shows a fixed cart summary after the first product is added and opens the basket as a dedicated bottom sheet.
- Supports customer selection, quantity changes, line removal, clear cart, checkout sound preview, and the existing checkout flow.
- Leaves the established desktop POS workspace unchanged on larger screens.

### Colour and accessibility personalization

- Includes Emerald, Ocean, Royal, and Berry presets plus fully custom primary, highlight, and background colours.
- Updates the application chrome, buttons, workspace canvas, splash screen, and browser theme colour immediately.
- Supports standard, large, and extra-large text, high-contrast controls, reduced motion, and larger touch targets.
- Persists the selected display preferences on the device and applies them before the main stylesheet loads to prevent theme flashing.

### Setup-first installation and sound controls

- Replaces the basic install action with a readiness flow for camera, notifications, sound, and accessibility.
- Requests camera and notification permissions only after the operator taps the matching control; optional access is never requested automatically.
- Lets the operator save accessibility preferences before opening the native browser install prompt.
- Plays a configurable completion chime after a sale is safely stored.
- Plays a configurable alert tone only for newly detected operational alerts and respects a user-selected cooldown.
- Includes sound previews, enable/mute controls, and a shared volume setting in the Settings control centre.

### Improved startup splash

- Shows a branded, animated loading screen while the offline cache and local IndexedDB data are prepared.
- Reports startup progress in plain language and honours the reduced-motion accessibility preference.
- Uses the saved app colours immediately for a consistent installed-app launch experience.

## Version 4 highlights

### Barcode checkout

- Scan common retail barcodes with a phone camera.
- Use the native `BarcodeDetector` API where available and the bundled ZXing compatibility scanner elsewhere.
- Scan a saved product image or enter a code manually when a camera is unavailable.
- Continue using a USB or Bluetooth hardware scanner through the POS search field.

### Professional receipts

- Preview and print branded 58 mm or 80 mm receipts.
- Download receipts as PNG images or share them with supported mobile apps.
- Configure the business name, address, contacts, registration number, colour, footer, cashier, SKU, and tax visibility.
- Reopen receipt actions from the Sales screen at any time.

### Controlled returns, refunds, and voids

- Submit item-level return requests with quantities, restock decisions, refund methods, reasons, and notes.
- Submit full-sale void requests without changing cash or stock immediately.
- Require a manager PIN to approve or reject queued requests.
- Apply approved stock, customer credit, cash-register, receipt-status, and audit changes together.

### Purchasing and stock receiving

- Create draft purchase orders and mark them ordered or cancelled.
- Receive complete or partial supplier deliveries against an order.
- Track ordered, received, and remaining quantities plus supplier balances.
- Update product cost, stock, batches, expiry dates, and stock movements during receiving.

### Product catalogue and images

- Add, replace, preview, or remove product images.
- Choose an existing image, take a phone photo, or drag and drop a file.
- Images are resized and compressed before local storage and remain available offline.
- Use favourites, descriptions, grid/table layouts, category and status filters, sorting, expiry alerts, margin previews, and product duplication.

### Operational alerts centre

- Consolidates low and out-of-stock products, expiry risks, pending approvals, overdue purchase orders, customer credit-limit breaches, due expenses, and overdue backups.
- Prioritizes critical and warning alerts with topbar and navigation counters.
- Filters alerts by priority, category, state, and search term.
- Supports individual or bulk acknowledgement, configurable snoozing, and reopening.
- Clears alerts automatically when the underlying business condition is resolved.

### Expense management

- Records expense numbers, dates, due dates, vendors, categories, references, descriptions, notes, recurrence, subtotal, tax, and total.
- Tracks paid, unpaid, overdue, pending-approval, rejected, and voided states.
- Uploads or captures receipt evidence, compresses it for offline storage, and includes it in backups.
- Routes expenses above a configurable threshold to the manager approval queue before they affect cash or profit.
- Records payments, payment references, operators, and cash-register movements.
- Voids records with a manager PIN while preserving the full audit history and reversing linked cash movements.
- Provides category allocation, outstanding totals, approval history, overdue tracking, CSV export, and report integration.

## Settings control centre

Settings are organized into eight areas:

- **Business profile:** business identity, contacts, address, registration number, currency, tax rate, and tax mode.
- **Appearance:** colour presets, custom app colours, text sizing, high contrast, reduced motion, and larger touch targets.
- **Checkout:** default payment, post-sale receipt behavior, catalogue layout, compact/comfortable spacing, register enforcement, clear-cart confirmation, vibration, scanner sound, checkout chime, sound volume, and dashboard welcome panel.
- **Receipts:** paper width, brand colour, footer, cashier visibility, SKU visibility, and tax visibility with a live preview.
- **Inventory:** dashboard low-stock alerts, expiry warning window, and an audited option to allow sales below zero stock.
- **Alerts & expenses:** alert sources, snooze duration, alert tone and cooldown, expense approval threshold, and mandatory expense receipt evidence.
- **Approvals:** manager identity, hashed approval PIN, and required notes for returns and voids.
- **Data & device:** full JSON backup and restore, CSV exports, setup-first installation, scanner status, backup reminders, and local-data reset.

## Data and security model

All records, product images, expense receipts, alert states, and audit records are stored in IndexedDB in the current browser profile. The app works offline and includes local data in **Settings → Data & device → Export full backup**.

This edition does not provide cloud synchronization, user accounts, or remote staff permissions. The manager PIN protects approval actions on the device, but it is not a replacement for authenticated cloud access. Export backups regularly, especially before clearing browser data, resetting a device, or moving to another phone or computer.

## Run locally

The project is a static Progressive Web App and has no build step.

```bash
cd mtech-pos-upgrade
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Deploy to Netlify

Link the folder to the intended site and publish the static directory:

```bash
netlify login
netlify link
netlify deploy --prod --dir .
```

The included `netlify.toml`, `_headers`, and `_redirects` preserve PWA routing, security headers, and offline behavior.

## Deploy to Vercel

The included `vercel.json` configures the service-worker cache policy, manifest content type, versioned asset caching, and baseline security headers.

```bash
vercel --prod --yes
```

## Verification

- JavaScript syntax, service worker, manifest JSON, and CSS parsing validated.
- Complete frontend navigation and primary modal workflows validated across Products, Inventory, Stock Count, Purchases, Customers, Suppliers, Expenses, Alerts, Reports, and Settings.
- IndexedDB v6 workflows tested for sales, controlled returns, voids, approval rejection, purchase orders, partial receiving, expense approvals, payments, controlled voiding, alert-state persistence, backup coverage, and optional negative stock.
- All eight settings sections tested for navigation, persistence, theme/accessibility changes, immediate density changes, receipt controls, inventory controls, alert and expense controls, PIN hashing, and error-free POS rendering.
- Alerts and expense management tested end-to-end from acknowledgement through threshold approval and final payment.
- The split-stage mobile checkout was tested from product selection through cart review and checkout opening, including theme persistence and the install-readiness modal.
- Barcode fallback, receipt PNG generation, purchase-order receiving, return approval, and void approval were tested in the hosted app before the final settings redesign.
