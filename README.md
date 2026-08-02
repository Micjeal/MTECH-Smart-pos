# MTECH Retail POS v4.1.0

MTECH Retail POS is an offline-first, installable point-of-sale and inventory system for independent shops. Version 4.1 adds a centralized operational alerts centre and professional expense management to the barcode scanning, branded receipts, controlled returns and voids, purchase orders, redesigned workspace, and settings control centre introduced in version 4.

## Project links

- Existing production app: https://beautiful-lebkuchen-a9463b.netlify.app (deploy v4.1.0 to publish the alerts and expense upgrade)
- Netlify project: https://app.netlify.com/projects/beautiful-lebkuchen-a9463b

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

Settings are organized into seven areas:

- **Business profile:** business identity, contacts, address, registration number, currency, tax rate, and tax mode.
- **Checkout:** default payment, post-sale receipt behavior, catalogue layout, compact/comfortable spacing, register enforcement, clear-cart confirmation, vibration, scanner sound, and dashboard welcome panel.
- **Receipts:** paper width, brand colour, footer, cashier visibility, SKU visibility, and tax visibility with a live preview.
- **Inventory:** dashboard low-stock alerts, expiry warning window, and an audited option to allow sales below zero stock.
- **Alerts & expenses:** alert sources, snooze duration, expense approval threshold, and mandatory expense receipt evidence.
- **Approvals:** manager identity, hashed approval PIN, and required notes for returns and voids.
- **Data & device:** full JSON backup and restore, CSV exports, install status, scanner status, backup reminders, and local-data reset.

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
- IndexedDB v6 workflows tested for sales, controlled returns, voids, approval rejection, purchase orders, partial receiving, expense approvals, payments, controlled voiding, alert-state persistence, backup coverage, and optional negative stock.
- All seven settings sections tested for navigation, persistence, immediate density changes, receipt controls, inventory controls, alert and expense controls, PIN hashing, and error-free POS rendering.
- Alerts and expense management tested end-to-end from acknowledgement through threshold approval and final payment.
- Barcode fallback, receipt PNG generation, purchase-order receiving, return approval, and void approval were tested in the hosted app before the final settings redesign.
