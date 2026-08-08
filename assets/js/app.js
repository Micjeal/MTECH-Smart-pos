(() => {
  "use strict";

  const DB = window.POSDatabase;
  const { icon: I } = window.POSIcons;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));
  const esc = (value = "") =>
    String(value).replace(
      /[&<>'"]/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[char],
    );
  const num = (value) => Number(value || 0);
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const uid = (prefix) => DB.uid(prefix);
  const nowISO = () => new Date().toISOString();
  const dateInputValue = (date = new Date()) =>
    new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
  const MAX_PRODUCT_IMAGE_BYTES = 8 * 1024 * 1024;
  const TARGET_PRODUCT_IMAGE_BYTES = 520 * 1024;
  const APP_VERSION = "4.4.0";
  const DEFAULT_PRODUCT_IMAGES = {
    "prod-001": "/assets/images/products/sugar-1kg.webp",
    "prod-003": "/assets/images/products/mineral-water-500ml.webp",
    "prod-005": "/assets/images/products/laundry-soap-bar.webp",
    "prod-007": "/assets/images/products/cooking-oil-1l.webp",
    "prod-008": "/assets/images/products/bread-loaf.webp",
  };
  const THEME_PRESETS = {
    emerald: { primary: "#0b6b5e", highlight: "#e6a817", canvas: "#f4f7f6" },
    ocean: { primary: "#126782", highlight: "#f29e4c", canvas: "#f2f7f9" },
    royal: { primary: "#4f46a5", highlight: "#e49b2f", canvas: "#f6f5fb" },
    berry: { primary: "#8c3454", highlight: "#db8c36", canvas: "#faf4f6" },
  };
  const SOUND_PATTERNS = {
    scan: [
      { frequency: 940, duration: 0.08, delay: 0 },
    ],
    success: [
      { frequency: 520, duration: 0.09, delay: 0 },
      { frequency: 660, duration: 0.1, delay: 0.08 },
      { frequency: 820, duration: 0.14, delay: 0.17 },
    ],
    bright: [
      { frequency: 620, duration: 0.08, delay: 0 },
      { frequency: 930, duration: 0.13, delay: 0.1 },
    ],
    gentle: [
      { frequency: 440, duration: 0.13, delay: 0 },
      { frequency: 560, duration: 0.18, delay: 0.12 },
    ],
    urgent: [
      { frequency: 760, duration: 0.11, delay: 0 },
      { frequency: 610, duration: 0.11, delay: 0.14 },
      { frequency: 760, duration: 0.11, delay: 0.28 },
    ],
  };
  const EXPENSE_CATEGORIES = [
    "Rent",
    "Utilities",
    "Transport",
    "Wages",
    "Supplies",
    "Repairs",
    "Marketing",
    "Taxes",
    "Insurance",
    "Professional services",
    "Other",
  ];
  const BUSINESS_DEFAULTS = {
    businessName: "MTECH Retail Shop",
    phone: "",
    email: "",
    address: "Kampala, Uganda",
    taxId: "",
    currency: "UGX",
    taxRate: 0,
    taxMode: "exclusive",
    receiptFooter: "Thank you for shopping with us.",
    receiptPaper: "80mm",
    receiptAccent: "#0f766e",
    showReceiptCashier: true,
    showReceiptSku: true,
    showReceiptTax: true,
    managerName: "Manager",
    approvalPinHash: "",
    requireReturnNotes: true,
    requireVoidNotes: true,
    defaultPaymentMethod: "cash",
    saleCompletionBehavior: "receipt",
    requireOpenRegister: false,
    confirmClearCart: true,
    hapticFeedback: true,
    scanSound: true,
    checkoutSoundEnabled: true,
    checkoutSound: "success",
    alertSoundEnabled: true,
    alertSound: "gentle",
    soundVolume: 55,
    alertSoundCooldownMinutes: 30,
    interfaceDensity: "comfortable",
    appThemePreset: "emerald",
    appPrimaryColor: "#0b6b5e",
    appHighlightColor: "#e6a817",
    appCanvasColor: "#f4f7f6",
    textScale: "standard",
    highContrast: false,
    reducedMotion: false,
    largeTouchTargets: false,
    accessibilityConfigured: false,
    productView: "table",
    showDashboardHero: true,
    lowStockEnabled: true,
    expiryWarningDays: 30,
    allowNegativeStock: false,
    alertExpiryEnabled: true,
    alertApprovalEnabled: true,
    alertPurchaseEnabled: true,
    alertCreditEnabled: true,
    alertBackupEnabled: true,
    alertExpenseDueEnabled: true,
    alertDefaultSnoozeHours: 24,
    expenseApprovalEnabled: false,
    expenseApprovalThreshold: 500000,
    requireExpenseReceipt: false,
    backupReminderDays: 7,
    lastBackupAt: "",
  };

  const VIEW_META = {
    dashboard: ["Dashboard", "Overview of your retail business"],
    pos: ["New sale", "Sell products, scan barcodes and collect payments"],
    sales: [
      "Sales & Returns",
      "Receipts, transaction history and product returns",
    ],
    register: [
      "Cash Register",
      "Opening float, cash movements and shift closing",
    ],
    products: ["Products", "Catalogue, pricing, barcodes and categories"],
    inventory: ["Inventory", "Stock levels, movements, valuation and alerts"],
    "stock-count": [
      "Stock Count",
      "Compare physical stock with system quantities",
    ],
    purchases: [
      "Purchases",
      "Receive supplier stock and track amounts payable",
    ],
    customers: ["Customers", "Customer history, credit balances and payments"],
    suppliers: [
      "Suppliers",
      "Supplier contacts, purchases and outstanding balances",
    ],
    expenses: ["Expenses", "Record and control business operating costs"],
    alerts: ["Alerts Centre", "Prioritize operational risks and pending actions"],
    reports: ["Reports", "Sales, profit, stock and payment performance"],
    settings: [
      "Settings",
      "Configure checkout, receipts, inventory, security and backups",
    ],
  };

  const state = {
    currentView: "dashboard",
    products: [],
    categories: [],
    customers: [],
    suppliers: [],
    sales: [],
    purchaseOrders: [],
    purchases: [],
    expenses: [],
    stockMovements: [],
    customerPayments: [],
    supplierPayments: [],
    heldSales: [],
    registerSessions: [],
    cashMovements: [],
    stockCounts: [],
    returns: [],
    approvalRequests: [],
    alertStates: [],
    activityLog: [],
    business: {},
    cart: [],
    posCategory: "all",
    posQuery: "",
    selectedCustomerId: "",
    orderDiscountType: "fixed",
    orderDiscountValue: 0,
    saleNotes: "",
    reportPeriod: "today",
    deferredPrompt: null,
    mobilePosStage: "products",
    audioContext: null,
    audioUnlocked: false,
    alertSnapshot: null,
    pendingAlertTone: false,
    readiness: {
      camera: "unknown",
      notifications:
        "Notification" in window ? Notification.permission : "unsupported",
      sound: "pending",
    },
    startupStartedAt: performance.now(),
    scanner: null,
    scanCallback: null,
    productView: window.matchMedia("(max-width: 650px)").matches
      ? "grid"
      : "table",
    productCategoryFilter: "",
    productStatusFilter: "all",
    productSort: "name-asc",
    productImageDraft: "",
    productImageBusy: false,
    expenseReceiptDraft: "",
    expenseReceiptBusy: false,
    expenseStatusFilter: "all",
    expenseCategoryFilter: "all",
    expensePeriodFilter: "month",
    salesStatusFilter: "all",
    alertSeverityFilter: "all",
    alertCategoryFilter: "all",
    alertStatusFilter: "open",
    settingsSection: "business",
    filters: {
      products: "",
      inventory: "",
      customers: "",
      suppliers: "",
      sales: "",
      purchases: "",
      expenses: "",
      alerts: "",
    },
  };

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    try {
      const savedProductView = localStorage.getItem("mtech-product-view");
      if (["grid", "table"].includes(savedProductView))
        state.productView = savedProductView;
    } catch (_) {}
    setupStaticUI();
    bindGlobalEvents();
    updateConnectionStatus();
    setupInstallability();
    setStartupStatus("Preparing offline access…");
    await registerServiceWorker();
    try {
      setStartupStatus("Opening your secure retail data…");
      await DB.open();
      await DB.seed();
      setStartupStatus("Loading products, sales and alerts…");
      await loadData();
      const route = location.hash.replace(/^#\/?/, "").split("?")[0];
      navigate(VIEW_META[route] ? route : "dashboard", false);
      await updateReadinessStatuses();
      hideStartupSplash();
    } catch (error) {
      console.error(error);
      $("#appView").innerHTML =
        `<div class="notice danger">${I("warning")}<div><strong>Could not start the POS database.</strong><br>${esc(error.message)}</div></div>`;
      toast("Startup failed", error.message, "error");
      hideStartupSplash();
    }
  }

  function setStartupStatus(message) {
    const node = $("#startupStatus");
    if (node) node.textContent = message;
  }

  function hideStartupSplash() {
    const splash = $("#startupSplash");
    if (!splash) return;
    const wait = Math.max(0, 650 - (performance.now() - state.startupStartedAt));
    window.setTimeout(() => {
      splash.classList.add("is-hidden");
      document.body.classList.remove("is-booting");
      window.setTimeout(() => splash.remove(), 420);
    }, wait);
  }

  function setupStaticUI() {
    $("#brandLogo").innerHTML = I("store");
    const nav = {
      dashboard: ["dashboard", "Dashboard"],
      pos: ["cart", "Point of Sale"],
      sales: ["receipt", "Sales & Returns"],
      register: ["register", "Cash Register"],
      products: ["package", "Products"],
      inventory: ["boxes", "Inventory"],
      "stock-count": ["clipboard", "Stock Count"],
      purchases: ["truck", "Purchases"],
      customers: ["users", "Customers"],
      suppliers: ["supplier", "Suppliers"],
      expenses: ["wallet", "Expenses"],
      alerts: ["bell", "Alerts"],
      reports: ["chart", "Reports"],
      settings: ["settings", "Settings"],
    };
    Object.entries(nav).forEach(([key, [iconName, label]]) => {
      const node = $(`#nav-${key}`);
      if (node) node.innerHTML = `${I(iconName)}<span>${label}</span>`;
    });
    $("#menuButton").innerHTML = I("menu");
    $("#sidebarClose").innerHTML = I("close");
    $("#modalClose").innerHTML = I("close");
    $("#scannerClose").innerHTML = I("close");
    $("#installButton").innerHTML = `${I("download")}<span>Set up & install</span>`;
    $("#newSaleButton").innerHTML = `${I("plus")}<span>New sale</span>`;
    $("#alertsButtonIcon").innerHTML = I("bell");
    $("#mobile-dashboard").innerHTML = `${I("home")}<span>Home</span>`;
    $("#mobile-pos").innerHTML = `${I("cart")}<span>Sell</span>`;
    $("#mobile-products").innerHTML = `${I("package")}<span>Products</span>`;
    $("#mobile-sales").innerHTML = `${I("receipt")}<span>Sales</span>`;
    $("#mobile-more").innerHTML = `${I("more")}<span>More</span>`;
    $("#torchButton").innerHTML = `${I("flash")}<span>Torch</span>`;
    $("#manualBarcodeButton").innerHTML =
      `${I("edit")}<span>Enter manually</span>`;
    const today = new Intl.DateTimeFormat("en-UG", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    }).format(new Date());
    $("#dayChip").innerHTML = `${I("calendar")}<span>${esc(today)}</span>`;
  }

  function bindGlobalEvents() {
    document.addEventListener("click", handleClick);
    document.addEventListener("submit", handleSubmit);
    document.addEventListener("input", handleInput);
    document.addEventListener("change", handleChange);
    document.addEventListener("pointerdown", primeAudioFromGesture, {
      once: true,
      passive: true,
    });
    window.addEventListener("hashchange", () => {
      const view = location.hash.replace(/^#\/?/, "").split("?")[0];
      if (VIEW_META[view] && view !== state.currentView) navigate(view, false);
    });
    window.addEventListener("online", updateConnectionStatus);
    window.addEventListener("offline", updateConnectionStatus);
    $("#drawerOverlay").addEventListener("click", closeSidebar);
    $("#modalLayer").addEventListener("click", (event) => {
      if (event.target === $("#modalLayer")) closeModal();
    });
    $("#barcodeImageInput").addEventListener("change", scanImageFile);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeModal();
        closeScanner();
        closeSidebar();
      }
      if (event.key === "F2") {
        event.preventDefault();
        navigate("pos");
      }
      if (event.key === "F4" && state.currentView === "pos") {
        event.preventDefault();
        openBarcodeScanner(handlePOSBarcode);
      }
    });
  }

  async function loadData() {
    const names = [
      "products",
      "categories",
      "customers",
      "suppliers",
      "sales",
      "purchaseOrders",
      "purchases",
      "expenses",
      "stockMovements",
      "customerPayments",
      "supplierPayments",
      "heldSales",
      "registerSessions",
      "cashMovements",
      "stockCounts",
      "returns",
      "approvalRequests",
      "alertStates",
      "activityLog",
    ];
    const values = await Promise.all(names.map((name) => DB.getAll(name)));
    names.forEach((name, index) => {
      state[name] = values[index] || [];
    });
    state.business = {
      ...BUSINESS_DEFAULTS,
      ...(await DB.getSetting("business", {})),
    };
    try {
      if (!localStorage.getItem("mtech-product-view"))
        state.productView = state.business.productView === "grid" ? "grid" : "table";
    } catch (_) {}
    applyDisplayPreferences();
    state.products = state.products
      .map((product) => ({
        trackStock: true,
        taxable: true,
        active: true,
        stock: 0,
        reorderLevel: 0,
        purchasePrice: 0,
        sellingPrice: 0,
        unit: "piece",
        ...product,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    state.customers = state.customers
      .map((customer) => ({ balance: 0, creditLimit: 0, ...customer }))
      .sort((a, b) => a.name.localeCompare(b.name));
    state.suppliers = state.suppliers
      .map((supplier) => ({ balance: 0, totalPurchases: 0, ...supplier }))
      .sort((a, b) => a.name.localeCompare(b.name));
    state.sales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    state.purchases.sort(
      (a, b) =>
        new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date),
    );
    state.purchaseOrders.sort(
      (a, b) =>
        new Date(b.createdAt || b.expectedDate) -
        new Date(a.createdAt || a.expectedDate),
    );
    state.approvalRequests.sort(
      (a, b) => new Date(b.requestedAt) - new Date(a.requestedAt),
    );
    state.expenses = state.expenses.map((expense) => {
      const paymentStatus =
        expense.paymentStatus ||
        (["unpaid", "pending", "pending-approval"].includes(expense.status)
          ? "unpaid"
          : "paid");
      const approvalStatus =
        expense.approvalStatus ||
        (expense.status === "rejected" ? "rejected" : "not-required");
      return {
        expenseNo: "",
        vendor: "",
        reference: "",
        dueDate: "",
        recurrence: "none",
        subtotal: num(expense.amount),
        taxAmount: 0,
        notes: "",
        receiptData: "",
        paymentReference: "",
        paymentStatus,
        approvalStatus,
        status: expense.status || paymentStatus,
        ...expense,
      };
    });
    state.expenses.sort(
      (a, b) =>
        new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date),
    );
    state.stockMovements.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
    state.registerSessions.sort(
      (a, b) => new Date(b.openedAt) - new Date(a.openedAt),
    );
    state.activityLog.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
    $("#sidebarBusinessName").textContent =
      state.business.businessName || "MTECH Retail POS";
    document.title = `${state.business.businessName || "MTECH Retail POS"} · POS`;
    renderRegisterChip();
    renderAlertIndicators();
  }

  function applyDisplayPreferences() {
    document.documentElement.dataset.density =
      state.business.interfaceDensity === "compact" ? "compact" : "comfortable";
    const primary = validHex(state.business.appPrimaryColor)
      ? state.business.appPrimaryColor
      : THEME_PRESETS.emerald.primary;
    const highlight = validHex(state.business.appHighlightColor)
      ? state.business.appHighlightColor
      : THEME_PRESETS.emerald.highlight;
    const canvas = validHex(state.business.appCanvasColor)
      ? state.business.appCanvasColor
      : THEME_PRESETS.emerald.canvas;
    const root = document.documentElement;
    root.style.setProperty("--primary", primary);
    root.style.setProperty("--primary-strong", mixHex(primary, "#000000", 0.24));
    root.style.setProperty("--primary-soft", mixHex(primary, "#ffffff", 0.9));
    root.style.setProperty("--accent", highlight);
    root.style.setProperty("--soft", canvas);
    root.style.setProperty("--business-accent", primary);
    root.dataset.textScale = ["standard", "large", "extra-large"].includes(
      state.business.textScale,
    )
      ? state.business.textScale
      : "standard";
    root.dataset.highContrast = settingEnabled("highContrast", false)
      ? "true"
      : "false";
    root.dataset.reducedMotion = settingEnabled("reducedMotion", false)
      ? "true"
      : "false";
    root.dataset.largeTouchTargets = settingEnabled("largeTouchTargets", false)
      ? "true"
      : "false";
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", primary);
    try {
      localStorage.setItem(
        "mtech-app-theme",
        JSON.stringify({ primary, highlight, canvas }),
      );
    } catch (_) {}
  }

  function validHex(value) {
    return /^#[0-9a-f]{6}$/i.test(String(value || ""));
  }

  function mixHex(base, blend, amount) {
    const parse = (hex) =>
      String(hex)
        .slice(1)
        .match(/.{2}/g)
        .map((part) => parseInt(part, 16));
    const [r1, g1, b1] = parse(base);
    const [r2, g2, b2] = parse(blend);
    return `#${[r1, g1, b1]
      .map((value, index) => {
        const target = [r2, g2, b2][index];
        return Math.round(value + (target - value) * amount)
          .toString(16)
          .padStart(2, "0");
      })
      .join("")}`;
  }

  function settingEnabled(key, fallback = true) {
    const value = state.business[key];
    return value === undefined ? fallback : value === true;
  }

  function allowNegativeStock() {
    return settingEnabled("allowNegativeStock", false);
  }

  function expenseDisplayStatus(expense) {
    if (expense.status === "voided") return "voided";
    if (expense.approvalStatus === "rejected" || expense.status === "rejected")
      return "rejected";
    if (expense.approvalStatus === "pending") return "pending-approval";
    if (expense.paymentStatus === "paid") return "paid";
    if (expense.dueDate) {
      const due = new Date(`${expense.dueDate}T23:59:59`);
      if (due < new Date()) return "overdue";
    }
    return "unpaid";
  }

  function isRecognizedExpense(expense) {
    return (
      expense.status !== "voided" &&
      !["pending", "rejected"].includes(expense.approvalStatus) &&
      expense.status !== "rejected"
    );
  }

  function daysFromToday(value) {
    if (!value) return null;
    const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
    if (Number.isNaN(date.getTime())) return null;
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    return Math.round((date.getTime() - today.getTime()) / 86400000);
  }

  function alertStateFor(id) {
    return state.alertStates.find((item) => item.id === id) || null;
  }

  function alertDisplayStatus(alert) {
    const saved = alertStateFor(alert.id);
    if (saved?.snoozedUntil && new Date(saved.snoozedUntil) > new Date())
      return "snoozed";
    if (saved?.acknowledgedAt) return "acknowledged";
    return "open";
  }

  function systemAlerts() {
    const alerts = [];
    const push = (alert) => alerts.push({ createdAt: nowISO(), ...alert });
    if (settingEnabled("lowStockEnabled", true)) {
      state.products
        .filter(
          (product) =>
            product.active !== false &&
            product.trackStock !== false &&
            num(product.stock) <= num(product.reorderLevel),
        )
        .forEach((product) => {
          const out = num(product.stock) <= 0;
          push({
            id: `stock:${product.id}`,
            category: "inventory",
            severity: out ? "critical" : "warning",
            title: out ? `${product.name} is out of stock` : `${product.name} is running low`,
            message: `${num(product.stock)} ${product.unit || "units"} available · reorder level ${num(product.reorderLevel)}`,
            view: "inventory",
            referenceId: product.id,
            createdAt: product.updatedAt || product.createdAt,
          });
        });
    }
    if (settingEnabled("alertExpiryEnabled", true)) {
      const warningDays = clamp(num(state.business.expiryWarningDays) || 30, 1, 365);
      state.products
        .filter((product) => product.active !== false && product.expiryDate)
        .forEach((product) => {
          const days = daysFromToday(product.expiryDate);
          if (days === null || days > warningDays) return;
          push({
            id: `expiry:${product.id}`,
            category: "expiry",
            severity: days < 0 ? "critical" : "warning",
            title: days < 0 ? `${product.name} has expired` : `${product.name} expires soon`,
            message:
              days < 0
                ? `Expired ${Math.abs(days)} day(s) ago · batch ${product.batchNo || "not recorded"}`
                : `${days} day(s) remaining · batch ${product.batchNo || "not recorded"}`,
            view: "inventory",
            referenceId: product.id,
            createdAt: product.updatedAt || product.createdAt,
          });
        });
    }
    if (settingEnabled("alertApprovalEnabled", true)) {
      state.approvalRequests
        .filter((request) => request.status === "pending")
        .forEach((request) =>
          push({
            id: `approval:${request.id}`,
            category: "approvals",
            severity: request.type === "void" ? "critical" : "warning",
            title: `${request.type === "expense" ? "Expense" : request.type === "void" ? "Void" : "Return"} approval is waiting`,
            message: `${request.approvalNo} · ${formatMoney(request.amount)} · requested by ${request.requestedBy || "Unknown"}`,
            view: request.type === "expense" ? "expenses" : "sales",
            referenceId: request.id,
            createdAt: request.requestedAt,
          }),
        );
    }
    if (settingEnabled("alertPurchaseEnabled", true)) {
      state.purchaseOrders
        .filter(
          (order) =>
            ["ordered", "partially-received"].includes(order.status) &&
            daysFromToday(order.expectedDate) < 0,
        )
        .forEach((order) => {
          const days = Math.abs(daysFromToday(order.expectedDate));
          push({
            id: `purchase:${order.id}`,
            category: "purchasing",
            severity: days > 7 ? "critical" : "warning",
            title: `${order.purchaseOrderNo} is overdue`,
            message: `${order.supplierName || supplierName(order.supplierId)} · expected ${days} day(s) ago`,
            view: "purchases",
            referenceId: order.id,
            createdAt: order.updatedAt || order.createdAt,
          });
        });
    }
    if (settingEnabled("alertCreditEnabled", true)) {
      state.customers
        .filter(
          (customer) =>
            num(customer.creditLimit) > 0 &&
            num(customer.balance) > num(customer.creditLimit),
        )
        .forEach((customer) =>
          push({
            id: `credit:${customer.id}`,
            category: "credit",
            severity: "critical",
            title: `${customer.name} is above the credit limit`,
            message: `${formatMoney(customer.balance)} due · limit ${formatMoney(customer.creditLimit)}`,
            view: "customers",
            referenceId: customer.id,
            createdAt: customer.updatedAt || customer.createdAt,
          }),
        );
    }
    if (settingEnabled("alertBackupEnabled", true)) {
      const reminderDays = clamp(num(state.business.backupReminderDays) || 7, 1, 90);
      const lastBackup = state.business.lastBackupAt
        ? new Date(state.business.lastBackupAt)
        : null;
      const days = lastBackup
        ? Math.floor((Date.now() - lastBackup.getTime()) / 86400000)
        : null;
      if (days === null || days > reminderDays)
        push({
          id: "backup:due",
          category: "data",
          severity: days === null || days > reminderDays * 2 ? "critical" : "warning",
          title: days === null ? "No backup has been created" : "Your data backup is overdue",
          message: days === null ? "Export a full backup to protect this device’s records." : `Last backup was ${days} day(s) ago.`,
          view: "settings",
          referenceId: "data",
          createdAt: state.business.lastBackupAt || nowISO(),
        });
    }
    if (settingEnabled("alertExpenseDueEnabled", true)) {
      state.expenses
        .filter(
          (expense) =>
            isRecognizedExpense(expense) &&
            expense.paymentStatus !== "paid" &&
            expense.dueDate &&
            daysFromToday(expense.dueDate) <= 0,
        )
        .forEach((expense) => {
          const days = Math.abs(daysFromToday(expense.dueDate));
          push({
            id: `expense:${expense.id}`,
            category: "expenses",
            severity: days > 7 ? "critical" : "warning",
            title: `${expense.expenseNo || "Expense"} ${days ? "is overdue" : "is due today"}`,
            message: `${expense.vendor || expense.description} · ${formatMoney(expense.amount)}`,
            view: "expenses",
            referenceId: expense.id,
            createdAt: expense.updatedAt || expense.createdAt,
          });
        });
    }
    const order = { critical: 0, warning: 1, info: 2 };
    return alerts.sort(
      (a, b) =>
        order[a.severity] - order[b.severity] ||
        new Date(b.createdAt) - new Date(a.createdAt),
    );
  }

  function activeSystemAlerts() {
    return systemAlerts().filter((alert) => alertDisplayStatus(alert) === "open");
  }

  function renderAlertIndicators() {
    const alerts = activeSystemAlerts();
    const count = alerts.length;
    const topCount = $("#alertCount");
    if (topCount) {
      topCount.textContent = String(count);
      topCount.hidden = count === 0;
    }
    const nav = $("#nav-alerts");
    const existing = $(".nav-alert-count", nav || document);
    if (existing) existing.remove();
    if (nav && count) {
      const badge = document.createElement("strong");
      badge.className = "nav-alert-count";
      badge.textContent = count > 99 ? "99+" : String(count);
      nav.appendChild(badge);
    }
    queueAlertSound(alerts);
  }

  function ensureAudioContext() {
    if (state.audioContext) return state.audioContext;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    state.audioContext = new AudioContextClass();
    return state.audioContext;
  }

  async function primeAudioFromGesture() {
    if (
      !settingEnabled("scanSound", true) &&
      !settingEnabled("checkoutSoundEnabled", true) &&
      !settingEnabled("alertSoundEnabled", true)
    )
      return;
    try {
      const context = ensureAudioContext();
      if (!context) return;
      if (context.state === "suspended") await context.resume();
      state.audioUnlocked = context.state === "running";
      state.readiness.sound = state.audioUnlocked ? "granted" : "prompt";
      if (state.audioUnlocked && state.pendingAlertTone) {
        state.pendingAlertTone = false;
        playConfiguredSound("alert");
      }
    } catch (_) {
      state.readiness.sound = "blocked";
    }
  }

  async function previewConfiguredSound(kind) {
    await primeAudioFromGesture();
    if (!state.audioUnlocked) {
      toast(
        "Sound unavailable",
        "Use the browser site controls to allow audio, then try again.",
        "warning",
      );
      return;
    }
    const form =
      kind === "alert"
        ? $('form[data-form="alerts-settings"]')
        : $('form[data-form="checkout-settings"]');
    const pattern =
      kind === "alert"
        ? form?.elements.alertSound?.value || state.business.alertSound || "gentle"
        : form?.elements.checkoutSound?.value ||
          state.business.checkoutSound ||
          "success";
    playTonePattern(pattern);
  }

  function playTonePattern(patternName) {
    const context = ensureAudioContext();
    const pattern = SOUND_PATTERNS[patternName] || SOUND_PATTERNS.gentle;
    if (!context || context.state !== "running") return false;
    const volume = clamp(num(state.business.soundVolume) || 55, 0, 100) / 100;
    const startAt = context.currentTime + 0.012;
    pattern.forEach((tone) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const toneStart = startAt + tone.delay;
      const toneEnd = toneStart + tone.duration;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(tone.frequency, toneStart);
      gain.gain.setValueAtTime(0.0001, toneStart);
      gain.gain.exponentialRampToValueAtTime(
        Math.max(0.001, volume * 0.12),
        toneStart + 0.018,
      );
      gain.gain.exponentialRampToValueAtTime(0.0001, toneEnd);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(toneStart);
      oscillator.stop(toneEnd + 0.02);
    });
    return true;
  }

  function playConfiguredSound(kind) {
    if (kind === "scan") {
      if (!settingEnabled("scanSound", true)) return false;
      return playTonePattern("scan");
    }
    if (kind === "checkout") {
      if (!settingEnabled("checkoutSoundEnabled", true)) return false;
      return playTonePattern(
        ["success", "bright", "gentle"].includes(state.business.checkoutSound)
          ? state.business.checkoutSound
          : "success",
      );
    }
    if (!settingEnabled("alertSoundEnabled", true)) return false;
    const cooldown = clamp(
      num(state.business.alertSoundCooldownMinutes) || 30,
      1,
      1440,
    );
    let lastPlayed = 0;
    try {
      lastPlayed = num(localStorage.getItem("mtech-alert-sound-at"));
    } catch (_) {}
    if (Date.now() - lastPlayed < cooldown * 60000) return false;
    const played = playTonePattern(
      ["gentle", "urgent", "bright"].includes(state.business.alertSound)
        ? state.business.alertSound
        : "gentle",
    );
    if (played) {
      try {
        localStorage.setItem("mtech-alert-sound-at", String(Date.now()));
      } catch (_) {}
    }
    return played;
  }

  function queueAlertSound(alerts) {
    const ids = new Set(alerts.map((alert) => alert.id));
    if (state.alertSnapshot === null) {
      state.alertSnapshot = ids;
      state.pendingAlertTone = alerts.length > 0;
      return;
    }
    const hasNew = [...ids].some((id) => !state.alertSnapshot.has(id));
    state.alertSnapshot = ids;
    if (!hasNew) return;
    if (state.audioUnlocked) playConfiguredSound("alert");
    else state.pendingAlertTone = true;
  }

  function haptic(pattern) {
    if (settingEnabled("hapticFeedback", true)) navigator.vibrate?.(pattern);
  }

  function openSession() {
    return (
      state.registerSessions.find((session) => session.status === "open") ||
      null
    );
  }

  function renderRegisterChip() {
    const session = openSession();
    $("#registerChip").innerHTML = session
      ? `<button data-view="register"><span class="open-dot"></span>${esc(session.cashier || "Register open")}</button>`
      : `<button data-view="register"><span class="closed-dot"></span>Register closed</button>`;
  }

  function navigate(view, updateHash = true) {
    if (!VIEW_META[view]) return;
    state.currentView = view;
    document.body.dataset.currentView = view;
    const [title, subtitle] = VIEW_META[view];
    $("#pageTitle").textContent = title;
    $("#pageSubtitle").textContent = subtitle;
    $$("[data-view]").forEach((element) =>
      element.classList.toggle("active", element.dataset.view === view),
    );
    if (updateHash) history.pushState(null, "", `#/${view}`);
    closeSidebar();
    renderCurrentView();
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function renderCurrentView() {
    const renders = {
      dashboard: renderDashboard,
      pos: renderPOS,
      products: renderProducts,
      inventory: renderInventory,
      "stock-count": renderStockCount,
      purchases: renderPurchases,
      suppliers: renderSuppliers,
      customers: renderCustomers,
      sales: renderSales,
      expenses: renderExpenses,
      alerts: renderAlerts,
      register: renderRegister,
      reports: renderReports,
      settings: renderSettings,
    };
    (renders[state.currentView] || renderDashboard)();
  }

  async function refresh(view = state.currentView) {
    await loadData();
    state.currentView = view;
    renderCurrentView();
  }

  function formatMoney(value) {
    const currency = (state.business.currency || "UGX").toUpperCase();
    const decimals = ["UGX", "RWF", "JPY"].includes(currency) ? 0 : 2;
    try {
      return new Intl.NumberFormat("en-UG", {
        style: "currency",
        currency,
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      }).format(num(value));
    } catch (_) {
      return `${currency} ${num(value).toLocaleString("en-UG", { maximumFractionDigits: decimals })}`;
    }
  }
  function formatDate(value, options = {}) {
    if (!value) return "—";
    return new Intl.DateTimeFormat("en-UG", {
      day: "2-digit",
      month: "short",
      year: options.short ? undefined : "numeric",
      ...options,
    }).format(new Date(value));
  }
  function formatDateTime(value) {
    if (!value) return "—";
    return new Intl.DateTimeFormat("en-UG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  }
  function initials(name) {
    return String(name || "?")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }
  function safeImageData(value) {
    const image = String(value || "");
    return /^data:image\/(?:png|jpe?g|webp);base64,[a-z0-9+/=\r\n]+$/i.test(
      image,
    )
      ? image
      : "";
  }
  function productImageMarkup(product, className = "product-thumb") {
    const image =
      safeImageData(product?.imageData) || DEFAULT_PRODUCT_IMAGES[product?.id] || "";
    if (image)
      return `<img class="${className}" src="${image}" alt="${esc(product?.name || "Product")}" loading="lazy" decoding="async">`;
    return `<span class="${className} product-image-placeholder" aria-hidden="true">${esc(initials(product?.name))}</span>`;
  }
  function readBlobAsDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () =>
        reject(reader.error || new Error("Could not read the selected image"));
      reader.readAsDataURL(blob);
    });
  }
  function loadImageFile(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(
          new Error("This image could not be decoded. Try JPG, PNG or WebP."),
        );
      };
      image.src = url;
    });
  }
  function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
  }
  async function optimizeProductImage(file) {
    if (!file || !String(file.type || "").startsWith("image/"))
      throw new Error("Choose a valid image file");
    if (file.size > MAX_PRODUCT_IMAGE_BYTES)
      throw new Error("Image is larger than 8 MB. Choose a smaller photo.");
    const source = await loadImageFile(file);
    const maxSide = 1200;
    const scale = Math.min(
      1,
      maxSide / Math.max(source.naturalWidth, source.naturalHeight),
    );
    let width = Math.max(1, Math.round(source.naturalWidth * scale));
    let height = Math.max(1, Math.round(source.naturalHeight * scale));
    const draw = async (nextWidth, nextHeight, quality = 0.82) => {
      const canvas = document.createElement("canvas");
      canvas.width = nextWidth;
      canvas.height = nextHeight;
      const context = canvas.getContext("2d", { alpha: true });
      if (!context)
        throw new Error("Image processing is unavailable in this browser");
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(source, 0, 0, nextWidth, nextHeight);
      return (
        (await canvasToBlob(canvas, "image/webp", quality)) ||
        (await canvasToBlob(canvas, "image/jpeg", quality))
      );
    };
    let blob = await draw(width, height);
    if (!blob)
      throw new Error("The image could not be prepared for offline storage");
    if (
      blob.size > TARGET_PRODUCT_IMAGE_BYTES &&
      Math.max(width, height) > 720
    ) {
      const reduction = Math.max(
        0.58,
        Math.min(
          0.86,
          Math.sqrt(TARGET_PRODUCT_IMAGE_BYTES / blob.size) * 0.94,
        ),
      );
      width = Math.max(1, Math.round(width * reduction));
      height = Math.max(1, Math.round(height * reduction));
      blob = await draw(width, height, 0.74);
    }
    const dataUrl = await readBlobAsDataURL(blob);
    if (!safeImageData(dataUrl))
      throw new Error("The optimized image format is not supported");
    return { dataUrl, width, height, bytes: blob.size };
  }
  function updateProductImagePreview(metaText = "") {
    const preview = $("#productImagePreview");
    if (!preview) return;
    const image = safeImageData(state.productImageDraft);
    preview.classList.toggle("has-image", Boolean(image));
    preview.innerHTML = image
      ? `<img src="${image}" alt="Product preview">`
      : `<div class="image-placeholder-art">${I("image")}<strong>No product image</strong><span>Add a clear square or portrait photo</span></div>`;
    const removeButton = $("#removeProductImage");
    if (removeButton) removeButton.hidden = !image;
    const status = $("#productImageStatus");
    if (status)
      status.textContent =
        metaText ||
        (image
          ? "Image ready · saved with this product and included in backups"
          : "JPG, PNG or WebP · maximum 8 MB");
  }
  async function processProductImageFile(file) {
    if (!file) return;
    state.productImageBusy = true;
    const status = $("#productImageStatus");
    if (status) status.textContent = "Optimizing image for fast offline use…";
    $("#productImageDropzone")?.classList.add("is-processing");
    try {
      const result = await optimizeProductImage(file);
      state.productImageDraft = result.dataUrl;
      const size =
        result.bytes >= 1024
          ? `${Math.round(result.bytes / 1024)} KB`
          : `${result.bytes} bytes`;
      updateProductImagePreview(
        `${result.width} × ${result.height}px · ${size} · optimized for offline use`,
      );
      toast(
        "Product image ready",
        "The optimized image will be saved with the product.",
        "success",
      );
    } catch (error) {
      if (status) status.textContent = error.message;
      toast("Image upload failed", error.message, "error");
    } finally {
      state.productImageBusy = false;
      $("#productImageDropzone")?.classList.remove("is-processing");
      ["productImageInput", "productCameraInput"].forEach((id) => {
        const input = $(`#${id}`);
        if (input) input.value = "";
      });
    }
  }
  function removeProductImageDraft() {
    state.productImageDraft = "";
    updateProductImagePreview(
      "Image removed · save the product to apply this change",
    );
  }
  function updateProductMarginPreview() {
    const cost = num($("#productPurchasePrice")?.value);
    const price = num($("#productSellingPrice")?.value);
    const profit = price - cost;
    const margin = price > 0 ? (profit / price) * 100 : 0;
    const node = $("#productMarginPreview");
    if (!node) return;
    node.className = `product-margin-preview ${profit < 0 ? "negative" : profit > 0 ? "positive" : ""}`;
    node.innerHTML = `<span>Profit per unit <strong>${formatMoney(profit)}</strong></span><span>Margin <strong>${margin.toFixed(1)}%</strong></span>`;
  }
  function bindProductImageUploader() {
    const dropzone = $("#productImageDropzone");
    const galleryInput = $("#productImageInput");
    const cameraInput = $("#productCameraInput");
    [galleryInput, cameraInput].forEach((input) =>
      input?.addEventListener("change", () =>
        processProductImageFile(input.files?.[0]),
      ),
    );
    if (dropzone) {
      ["dragenter", "dragover"].forEach((name) =>
        dropzone.addEventListener(name, (event) => {
          event.preventDefault();
          dropzone.classList.add("is-dragging");
        }),
      );
      ["dragleave", "drop"].forEach((name) =>
        dropzone.addEventListener(name, (event) => {
          event.preventDefault();
          dropzone.classList.remove("is-dragging");
        }),
      );
      dropzone.addEventListener("drop", (event) =>
        processProductImageFile(event.dataTransfer?.files?.[0]),
      );
    }
    ["productPurchasePrice", "productSellingPrice"].forEach((id) =>
      $(`#${id}`)?.addEventListener("input", updateProductMarginPreview),
    );
    updateProductImagePreview();
    updateProductMarginPreview();
  }
  function categoryName(id) {
    return (
      state.categories.find((category) => category.id === id)?.name ||
      "Uncategorized"
    );
  }
  function supplierName(id) {
    return (
      state.suppliers.find((supplier) => supplier.id === id)?.name ||
      "Not assigned"
    );
  }
  function customerName(id) {
    return (
      state.customers.find((customer) => customer.id === id)?.name ||
      "Walk-in customer"
    );
  }
  function paymentLabel(method) {
    return (
      {
        cash: "Cash",
        "mobile-money": "Mobile Money",
        card: "Card",
        credit: "Credit",
        mixed: "Mixed",
        "bank-transfer": "Bank Transfer",
        "credit-account": "Customer account",
      }[method] ||
      method ||
      "Unknown"
    );
  }

  function currentOperator() {
    return openSession()?.cashier || state.business.managerName || "Owner";
  }

  function pendingApproval(saleId, type = "") {
    return state.approvalRequests.find(
      (request) =>
        request.saleId === saleId &&
        request.status === "pending" &&
        (!type || request.type === type),
    );
  }

  async function hashApprovalPin(pin) {
    const bytes = new TextEncoder().encode(String(pin || ""));
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
  }

  async function verifyApprovalPin(pin) {
    if (!state.business.approvalPinHash)
      throw new Error(
        "Set a manager approval PIN in Settings before reviewing requests",
      );
    const candidate = await hashApprovalPin(pin);
    if (candidate !== state.business.approvalPinHash)
      throw new Error("Incorrect manager approval PIN");
  }
  function statusBadge(status) {
    const tone =
      {
        completed: "success",
        paid: "success",
        open: "success",
        active: "success",
        refunded: "danger",
        "partially-refunded": "warning",
        voided: "danger",
        due: "warning",
        partial: "warning",
        closed: "info",
        draft: "info",
        ordered: "primary",
        "partially-received": "warning",
        received: "success",
        cancelled: "danger",
        pending: "warning",
        "pending-approval": "warning",
        approved: "success",
        rejected: "danger",
        unpaid: "info",
        overdue: "danger",
        acknowledged: "info",
        snoozed: "primary",
      }[status] || "primary";
    return `<span class="badge ${tone}">${esc(String(status || "unknown").replaceAll("-", " "))}</span>`;
  }
  function emptyState(title, description, iconName = "file") {
    return `<div class="empty-state">${I(iconName)}<strong>${esc(title)}</strong><p>${esc(description)}</p></div>`;
  }
  function statCard(label, value, iconName, detail = "", tone = "") {
    return `<article class="stat-card"><div class="stat-copy"><span>${esc(label)}</span><strong>${value}</strong><small>${esc(detail)}</small></div><div class="stat-icon ${tone}">${I(iconName)}</div></article>`;
  }
  function operationMetric(label, value, detail, iconName, tone = "") {
    return `<article class="operation-metric ${tone}"><div class="operation-metric-icon">${I(iconName)}</div><div><span>${esc(label)}</span><strong>${value}</strong><small>${esc(detail)}</small></div></article>`;
  }
  function workspaceHero({
    eyebrow,
    title,
    description,
    actions = "",
    spotlightLabel,
    spotlightValue,
    spotlightDetail,
    iconName = "activity",
    tone = "",
  }) {
    return `<section class="operations-subhero workspace-operations-hero ${tone}">
      <div class="workspace-hero-copy"><span class="eyebrow">${esc(eyebrow)}</span><h2>${esc(title)}</h2><p>${esc(description)}</p>${actions ? `<div class="operations-hero-actions">${actions}</div>` : ""}</div>
      <aside class="workspace-spotlight"><span class="workspace-spotlight-icon">${I(iconName)}</span><div><span>${esc(spotlightLabel)}</span><strong>${spotlightValue}</strong><small>${esc(spotlightDetail)}</small></div></aside>
    </section>`;
  }
  function transactionCard(sale, compact = false) {
    const itemCount = (sale.items || []).reduce(
      (sum, item) => sum + num(item.quantity),
      0,
    );
    const pending = pendingApproval(sale.id);
    const hasReturn = state.returns.some((item) => item.saleId === sale.id);
    const canReturn =
      !compact &&
      !["refunded", "voided"].includes(sale.status) &&
      !pending;
    const canVoid =
      !compact && sale.status === "completed" && !hasReturn && !pending;
    return `<article class="transaction-card" data-status="${esc(sale.status)}">
      <div class="transaction-card-head"><div class="transaction-receipt-icon">${I("receipt")}</div><div class="transaction-card-title"><strong>${esc(sale.receiptNo)}</strong><span>${formatDateTime(sale.createdAt)}</span></div>${statusBadge(sale.status)}</div>
      <div class="transaction-card-body"><div><span>Customer</span><strong>${esc(sale.customerName || customerName(sale.customerId))}</strong></div><div class="transaction-total"><span>Total</span><strong>${formatMoney(sale.total)}</strong></div></div>
      ${pending ? `<div class="transaction-pending">${I("lock")}<span>${esc(pending.type)} approval pending</span></div>` : ""}
      <div class="transaction-card-foot"><div><span>${esc(paymentLabel(sale.paymentMethod))}</span><span>${itemCount} item${itemCount === 1 ? "" : "s"}</span></div><div class="transaction-actions"><button class="mini-button labelled" data-action="view-sale" data-id="${esc(sale.id)}">${I("eye")}<span>Open</span></button>${compact ? "" : `<button class="mini-button labelled" data-action="share-sale" data-id="${esc(sale.id)}">${I("share")}<span>Share</span></button>${canReturn ? `<button class="mini-button labelled" data-action="return-sale" data-id="${esc(sale.id)}">${I("return")}<span>Return</span></button>` : ""}${canVoid ? `<button class="mini-button danger" data-action="request-void" data-id="${esc(sale.id)}" aria-label="Request void">${I("close")}</button>` : ""}`}</div></div>
    </article>`;
  }
  function approvalQueueCard(approval) {
    return `<article class="approval-queue-card"><div class="approval-queue-head"><div><span>${esc(approval.approvalNo)}</span><strong>${esc(approval.type)} · ${esc(approval.receiptNo)}</strong></div>${statusBadge(approval.status)}</div><p>${esc(approval.reason || "No reason supplied")}</p><div class="approval-queue-meta"><span>${formatMoney(approval.amount)}</span><span>${esc(approval.requestedBy || "Unknown operator")}</span><span>${formatDateTime(approval.requestedAt)}</span></div><div class="approval-queue-actions"><button class="button button-outline" data-action="view-approval" data-id="${esc(approval.id)}">${I("eye")}Review record</button>${approval.status === "pending" ? `<button class="button button-primary" data-action="review-approval" data-decision="approve" data-id="${esc(approval.id)}">${I("check")}Approve</button><button class="icon-button danger-text" data-action="review-approval" data-decision="reject" data-id="${esc(approval.id)}" aria-label="Reject approval">${I("close")}</button>` : ""}</div></article>`;
  }
  function cashMovementCards(movements) {
    if (!movements.length)
      return emptyState(
        "No cash movements yet",
        "Opening float, cash sales and drawer adjustments will appear here.",
        "register",
      );
    return `<div class="cash-movement-timeline">${movements
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(
        (movement) =>
          `<article class="cash-movement-card ${num(movement.amount) >= 0 ? "positive" : "negative"}"><div class="cash-movement-icon">${I(num(movement.amount) >= 0 ? "arrowDown" : "arrowUp")}</div><div class="cash-movement-copy"><strong>${esc(String(movement.type || "movement").replaceAll("-", " "))}</strong><span>${esc(movement.note || movement.referenceType || "Cash register activity")}</span><small>${formatDateTime(movement.createdAt)}</small></div><strong class="cash-movement-amount">${num(movement.amount) >= 0 ? "+ " : ""}${formatMoney(movement.amount)}</strong></article>`,
      )
      .join("")}</div>`;
  }
  function registerHistoryCards() {
    if (!state.registerSessions.length)
      return emptyState(
        "No register history",
        "Open and close a register to create shift records.",
        "register",
      );
    return `<div class="register-history-cards">${state.registerSessions
      .map(
        (session) =>
          `<article class="register-history-card"><div><strong>${esc(session.cashier)}</strong><span>${formatDateTime(session.openedAt)}</span></div>${statusBadge(session.status)}<dl><div><dt>Opening</dt><dd>${formatMoney(session.openingFloat)}</dd></div><div><dt>Expected</dt><dd>${formatMoney(session.expectedCash)}</dd></div><div><dt>Counted</dt><dd>${formatMoney(session.actualCash)}</dd></div><div><dt>Difference</dt><dd class="${Math.abs(num(session.difference)) > 0.01 ? "danger-text" : ""}">${formatMoney(session.difference)}</dd></div></dl></article>`,
      )
      .join("")}</div>`;
  }
  function isToday(value) {
    const d = new Date(value),
      n = new Date();
    return d.toDateString() === n.toDateString();
  }
  function isInPeriod(value, period = state.reportPeriod) {
    const date = new Date(value);
    const now = new Date();
    if (period === "all") return true;
    if (period === "today") return date.toDateString() === now.toDateString();
    if (period === "7d") return date >= new Date(now.getTime() - 7 * 86400000);
    if (period === "30d")
      return date >= new Date(now.getTime() - 30 * 86400000);
    if (period === "month")
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    if (period === "year") return date.getFullYear() === now.getFullYear();
    return true;
  }

  function renderDashboard() {
    const todaySales = state.sales.filter(
      (sale) => isToday(sale.createdAt) && sale.status !== "voided",
    );
    const todayReturns = state.returns
      .filter((item) => isToday(item.createdAt))
      .reduce((sum, item) => sum + num(item.refundTotal), 0);
    const todayRevenue =
      todaySales.reduce((sum, sale) => sum + num(sale.total), 0) - todayReturns;
    const todayCost = todaySales.reduce(
      (sum, sale) =>
        sum +
        sale.items.reduce(
          (s, item) =>
            s +
            num(item.costPrice) *
              Math.max(0, num(item.quantity) - num(item.returnedQty)),
          0,
        ),
      0,
    );
    const todayExpenses = state.expenses
      .filter(
        (expense) =>
          isRecognizedExpense(expense) &&
          isToday(expense.date || expense.createdAt),
      )
      .reduce((sum, expense) => sum + num(expense.amount), 0);
    const lowStockRecords = state.products.filter(
      (product) =>
        product.active &&
        product.trackStock !== false &&
        num(product.stock) <= num(product.reorderLevel),
    );
    const lowStockAlertsEnabled = settingEnabled("lowStockEnabled", true);
    const lowStock = lowStockAlertsEnabled ? lowStockRecords : [];
    const receivables = state.customers.reduce(
      (sum, customer) => sum + num(customer.balance),
      0,
    );
    const recentSales = state.sales.slice(0, 6);
    const monthGross = state.sales
      .filter(
        (sale) =>
          isInPeriod(sale.createdAt, "month") &&
          sale.status !== "voided",
      )
      .reduce((sum, sale) => sum + num(sale.total), 0);
    const monthReturns = state.returns
      .filter((item) => isInPeriod(item.createdAt, "month"))
      .reduce((sum, item) => sum + num(item.refundTotal), 0);
    const monthRevenue = monthGross - monthReturns;
    const inventoryRetailValue = state.products
      .filter((product) => product.trackStock !== false)
      .reduce(
        (sum, product) => sum + num(product.stock) * num(product.sellingPrice),
        0,
      );
    const hour = new Date().getHours();
    const greeting =
      hour < 12
        ? "Good morning"
        : hour < 18
          ? "Good afternoon"
          : "Good evening";
    const pendingApprovals = state.approvalRequests.filter(
      (request) => request.status === "pending",
    ).length;
    const priorityAlerts = activeSystemAlerts();
    const session = openSession();
    const hero = settingEnabled("showDashboardHero", true)
      ? `<section class="dashboard-hero operations-hero">
        <div class="dashboard-hero-copy"><span class="eyebrow">Today · retail command centre</span><h2>${greeting}. Your shop is ready.</h2><p>Start the next sale, monitor cash and deal with important risks from one focused workspace.</p><div class="dashboard-hero-actions"><button class="button hero-primary" data-view="pos">${I("cart")}Start new sale</button><button class="button hero-secondary" data-action="new-expense">${I("wallet")}Add expense</button></div><div class="operations-status-row"><button data-view="register" class="operations-status-pill ${session ? "ready" : "attention"}"><span>${I("register")}</span><span><strong>${session ? "Register open" : "Register closed"}</strong><small>${session ? esc(session.cashier) : "Open before cash sales"}</small></span>${I("arrowRight")}</button><button data-view="alerts" class="operations-status-pill ${priorityAlerts.length ? "attention" : "ready"}"><span>${I(priorityAlerts.length ? "bell" : "check")}</span><span><strong>${priorityAlerts.length} open alert${priorityAlerts.length === 1 ? "" : "s"}</strong><small>${pendingApprovals ? `${pendingApprovals} approval${pendingApprovals === 1 ? "" : "s"} waiting` : priorityAlerts.length ? "Review the highest-priority items" : "Operations currently stable"}</small></span>${I("arrowRight")}</button></div></div>
        <aside class="dashboard-today-card"><span>Today’s net sales</span><strong>${formatMoney(todayRevenue)}</strong><small>${todaySales.length} completed transaction${todaySales.length === 1 ? "" : "s"}</small><div><span><small>Returns</small><strong>${formatMoney(todayReturns)}</strong></span><span><small>Expenses</small><strong>${formatMoney(todayExpenses)}</strong></span></div><button class="text-button" data-view="reports">View performance ${I("arrowRight")}</button></aside>
      </section>`
      : "";
    $("#appView").innerHTML = `<div class="page-stack phase-page dashboard-phase-page">
      ${hero}
      <section class="operation-metric-strip" aria-label="Business summary">
        ${operationMetric("Estimated profit", formatMoney(todayRevenue - todayCost - todayExpenses), "Today after cost and expenses", "chart", "success")}
        ${operationMetric("This month", formatMoney(monthRevenue), "Net sales revenue", "calendar", "info")}
        ${operationMetric("Low stock", lowStockAlertsEnabled ? lowStock.length : "Off", lowStockAlertsEnabled ? (lowStock.length ? "Products need attention" : "Stock levels are healthy") : `${lowStockRecords.length} below level`, "warning", lowStockAlertsEnabled && lowStock.length ? "warning" : "success")}
        ${operationMetric("Credit due", formatMoney(receivables), `${state.customers.filter((customer) => num(customer.balance) > 0).length} customer accounts`, "credit", receivables ? "warning" : "success")}
      </section>
      <section class="dashboard-quick-section"><div class="section-heading-inline"><div><span class="eyebrow">Quick actions</span><h2>What do you need to do?</h2></div><small>Designed for one-handed mobile use</small></div><div class="quick-action-grid phase-quick-actions">
        ${quickCard("pos", "cart", "New sale", "Open checkout")}
        ${quickCardAction("new-expense", "wallet", "Add expense", "Record a cost")}
        ${quickCardAction("new-purchase", "truck", "Receive stock", "Supplier delivery")}
        ${quickCard("register", "register", session ? "Register" : "Open register", "Control cash")}
        ${quickCardAction("new-product", "package", "Add product", "Catalogue item")}
        ${quickCardAction("new-customer", "users", "Add customer", "Credit profile")}
      </div></section>
      <section class="dashboard-grid">
        <article class="panel"><div class="panel-header"><div><h2>Sales trend</h2><p>Completed sales during the last seven days</p></div><button class="text-button" data-view="reports">Open reports</button></div>${renderSevenDayChart()}</article>
        <article class="panel"><div class="panel-header"><div><h2>Priority alerts</h2><p>Highest-impact actions across the business</p></div><button class="text-button" data-view="alerts">Open alerts centre</button></div>
          ${
            priorityAlerts.length
              ? `<div class="list-stack dashboard-alert-list">${priorityAlerts
                  .slice(0, 5)
                  .map(
                    (alert) =>
                      `<button class="list-row" data-action="open-alert-target" data-id="${esc(alert.id)}"><div class="list-main"><div class="list-icon ${alert.severity === "critical" ? "alert-critical" : "alert-warning"}">${I(alert.severity === "critical" ? "warning" : "bell")}</div><div class="list-copy"><strong>${esc(alert.title)}</strong><span>${esc(alertCategoryLabel(alert.category))}</span></div></div><div class="list-value"><span class="badge ${alert.severity === "critical" ? "danger" : "warning"}">${esc(alert.severity)}</span></div></button>`,
                  )
                  .join("")}</div>`
              : emptyState(
                  "No open alerts",
                  "Current stock, approvals, expenses and data controls are healthy.",
                  "check",
                )
          }
        </article>
      </section>
      <section class="panel dashboard-transactions-panel"><div class="panel-header"><div><h2>Recent sales</h2><p>Latest receipts, payments and return status</p></div><button class="text-button" data-view="sales">View all sales</button></div>${recentSales.length ? `<div class="transaction-card-list dashboard-transaction-list">${recentSales.map((sale) => transactionCard(sale, true)).join("")}</div>` : emptyState("No sales yet", "Start a new sale to populate your dashboard.", "receipt")}</section>
      <section class="panel"><div class="panel-header"><div><h2>Recent activity</h2><p>Operational audit trail on this device</p></div></div>
        ${
          state.activityLog.length
            ? `<div class="list-stack">${state.activityLog
                .slice(0, 8)
                .map(
                  (log) =>
                    `<div class="list-row"><div class="list-main"><div class="list-icon">${I("activity")}</div><div class="list-copy"><strong>${esc(log.summary)}</strong><span>${esc(log.type)}</span></div></div><div class="list-value"><span>${formatDateTime(log.createdAt)}</span></div></div>`,
                )
                .join("")}</div>`
            : emptyState(
                "No activity recorded",
                "Actions completed in the POS will appear here.",
                "activity",
              )
        }
      </section>
    </div>`;
  }

  function quickCard(view, iconName, title, description) {
    return `<button class="quick-card" data-view="${view}">${I(iconName)}<div><strong>${esc(title)}</strong><span>${esc(description)}</span></div></button>`;
  }
  function quickCardAction(action, iconName, title, description) {
    return `<button class="quick-card" data-action="${action}">${I(iconName)}<div><strong>${esc(title)}</strong><span>${esc(description)}</span></div></button>`;
  }

  function renderSevenDayChart() {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      return date;
    });
    const totals = days.map((day) =>
      state.sales
        .filter(
          (sale) =>
            new Date(sale.createdAt).toDateString() === day.toDateString() &&
            sale.status !== "voided",
        )
        .reduce((sum, sale) => sum + num(sale.total), 0) -
      state.returns
        .filter(
          (item) => new Date(item.createdAt).toDateString() === day.toDateString(),
        )
        .reduce((sum, item) => sum + num(item.refundTotal), 0),
    );
    const max = Math.max(...totals, 1);
    return `<div class="chart-area">${days.map((day, index) => `<div class="chart-column"><div class="chart-bar-wrap"><div class="chart-bar" style="height:${Math.max(2, (totals[index] / max) * 100)}%" data-value="${esc(formatMoney(totals[index]))}"></div></div><span>${day.toLocaleDateString("en-UG", { weekday: "short" })}</span></div>`).join("")}</div>`;
  }

  function renderPOS() {
    const filtered = filteredPOSProducts();
    const totals = cartTotals();
    const trackedOut = state.products.filter(
      (product) =>
        product.active !== false &&
        product.trackStock !== false &&
        num(product.stock) <= 0,
    ).length;
    $("#appView").innerHTML = `${renderMobilePOS(filtered, totals)}<div class="desktop-pos-workspace"><div class="pos-workspace-bar"><div><span class="eyebrow">Live checkout</span><strong>${filtered.length} products ready to sell</strong></div><div class="pos-workspace-facts"><span>${I("register")}${openSession() ? "Register open" : "Register closed"}</span><span>${I("warning")}${trackedOut} out of stock</span><span class="desktop-shortcut">F2 POS · F4 scanner</span></div></div><div class="pos-shell">
      <section class="panel pos-catalog">
        <div class="pos-toolbar"><div class="search-box">${I("search")}<input id="posSearch" type="search" placeholder="Search name, SKU or barcode" value="${esc(state.posQuery)}" autocomplete="off" inputmode="search"></div><button class="button button-secondary scan-main" data-action="scan-pos">${I("scan")}<span>Scan barcode</span></button></div>
        <div class="category-tabs">${renderCategoryTabs()}</div>
        <div class="product-grid">${filtered.length ? filtered.map(productTile).join("") : emptyState("No matching products", "Try another search or add a new product.", "search")}</div>
      </section>
      <aside class="panel cart-panel">
        <div class="cart-head"><div><h2>Current sale</h2><p>${state.cart.reduce((sum, item) => sum + num(item.quantity), 0)} item(s)</p></div><button class="text-button danger-text" data-action="clear-cart">Clear</button></div>
        <div class="cart-customer"><label for="posCustomer">Customer</label><select id="posCustomer" class="select-control"><option value="">Walk-in customer</option>${state.customers.map((customer) => `<option value="${customer.id}" ${state.selectedCustomerId === customer.id ? "selected" : ""}>${esc(customer.name)}${num(customer.balance) > 0 ? ` · owes ${esc(formatMoney(customer.balance))}` : ""}</option>`).join("")}</select></div>
        <div class="cart-items">${state.cart.length ? state.cart.map(cartItemHTML).join("") : emptyState("Cart is empty", "Tap a product or scan its barcode to begin.", "cart")}</div>
        <div class="cart-summary">
          <div class="summary-row"><span>Gross amount</span><strong>${formatMoney(totals.gross)}</strong></div>
          <div class="summary-row"><span>Line discounts</span><strong>− ${formatMoney(totals.lineDiscount)}</strong></div>
          <div class="summary-row"><span>Order discount</span><button class="text-button" data-action="order-discount">− ${formatMoney(totals.orderDiscount)}</button></div>
          <div class="summary-row"><span>Tax</span><strong>${formatMoney(totals.tax)}</strong></div>
          <div class="summary-row total"><span>Total</span><strong>${formatMoney(totals.total)}</strong></div>
        </div>
        <div class="cart-actions"><div class="cart-secondary-actions"><button class="button button-outline" data-action="hold-sale" ${state.cart.length ? "" : "disabled"}>${I("hold")}Hold</button><button class="button button-outline" data-action="resume-sale">${I("play")}Held (${state.heldSales.length})</button></div><button class="button button-primary button-large button-full" data-action="checkout" ${state.cart.length ? "" : "disabled"}><span>Charge ${formatMoney(totals.total)}</span>${I("arrowRight")}</button></div>
      </aside>
    </div></div>`;
    const search = $("#posSearch");
    if (search && !window.matchMedia("(max-width: 900px)").matches)
      search.focus({ preventScroll: true });
  }

  function mobileReadinessStatus() {
    const accessReady = settingEnabled("accessibilityConfigured", false);
    const items = [
      {
        key: "camera",
        label: "Camera",
        icon: "camera",
        ready: state.readiness.camera === "granted",
        status:
          state.readiness.camera === "denied"
            ? "Blocked"
            : state.readiness.camera === "granted"
              ? "Ready"
              : "Review",
      },
      {
        key: "notifications",
        label: "Notifications",
        icon: "bell",
        ready: state.readiness.notifications === "granted",
        status:
          state.readiness.notifications === "denied"
            ? "Blocked"
            : state.readiness.notifications === "unsupported"
              ? "Optional"
              : state.readiness.notifications === "granted"
                ? "Ready"
                : "Review",
      },
      {
        key: "sound",
        label: "Sound",
        icon: "activity",
        ready: state.audioUnlocked || state.readiness.sound === "granted",
        status:
          state.audioUnlocked || state.readiness.sound === "granted"
            ? "Ready"
            : "Enable",
      },
      {
        key: "accessibility",
        label: "Accessibility",
        icon: "users",
        ready: accessReady,
        status: accessReady ? "Set" : "Choose",
      },
    ];
    return { items, ready: items.filter((item) => item.ready).length };
  }

  function renderMobilePOS(products, totals) {
    const readiness = mobileReadinessStatus();
    const quantity = state.cart.reduce(
      (sum, item) => sum + num(item.quantity),
      0,
    );
    const cartOpen = state.mobilePosStage === "cart";
    return `<section class="mobile-split-pos ${cartOpen ? "cart-open" : "products-open"}">
      <button class="mobile-readiness-card" data-action="install-app" aria-label="Review mobile setup and installation">
        <span class="readiness-check">${I(readiness.ready === 4 ? "check" : "settings")}</span>
        <span class="readiness-copy"><strong>${readiness.ready === 4 ? "Mobile setup complete" : "Finish mobile setup"}</strong><small>${readiness.ready} of 4 ready</small></span>
        <span class="readiness-items">${readiness.items
          .map(
            (item) =>
              `<span class="readiness-item ${item.ready ? "ready" : "pending"}" title="${esc(item.label)}: ${esc(item.status)}">${I(item.icon)}<small>${esc(item.label)}</small><i aria-hidden="true">${item.ready ? I("check") : ""}</i></span>`,
          )
          .join("")}</span>
        <span class="readiness-review">Review ${I("arrowRight")}</span>
      </button>

      <div class="mobile-stage-switch" role="tablist" aria-label="Sale stage">
        <button role="tab" aria-selected="${!cartOpen}" class="${!cartOpen ? "active" : ""}" data-action="mobile-pos-stage" data-stage="products">${I("grid")}<span>Products</span></button>
        <button role="tab" aria-selected="${cartOpen}" class="${cartOpen ? "active" : ""}" data-action="mobile-pos-stage" data-stage="cart">${I("cart")}<span>Cart</span><strong>${quantity}</strong></button>
      </div>

      <div class="mobile-products-stage">
        <div class="mobile-pos-search"><div class="search-box">${I("search")}<input id="mobilePosSearch" type="search" placeholder="Search name, SKU or barcode" value="${esc(state.posQuery)}" autocomplete="off" inputmode="search"></div><button data-action="scan-pos" aria-label="Scan product barcode">${I("scan")}</button></div>
        <div class="category-tabs mobile-category-tabs">${renderCategoryTabs()}</div>
        <div class="mobile-product-list">${products.length ? products.map(mobileProductRow).join("") : emptyState("No matching products", "Try another search or add a new product.", "search")}</div>
      </div>

      ${quantity ? `<button class="mobile-cart-peek" data-action="mobile-pos-stage" data-stage="cart"><span>${I("cart")}<strong>${quantity}</strong></span><span><small>Current total</small><strong>${formatMoney(totals.total)}</strong></span><span>Review cart ${I("arrowRight")}</span></button>` : ""}

      <aside class="mobile-cart-sheet ${cartOpen ? "open" : ""}" aria-hidden="${!cartOpen}" ${cartOpen ? "" : "inert"}>
        <button class="mobile-sheet-handle" data-action="mobile-pos-stage" data-stage="products" aria-label="Return to products"><span></span></button>
        <div class="mobile-cart-head"><div><strong>Your cart</strong><small>${quantity} item${quantity === 1 ? "" : "s"}</small></div><button class="text-button danger-text" data-action="clear-cart" ${state.cart.length ? "" : "disabled"}>Clear</button></div>
        <div class="mobile-cart-customer"><label for="mobilePosCustomer">Customer</label><select id="mobilePosCustomer" class="select-control"><option value="">Walk-in customer</option>${state.customers.map((customer) => `<option value="${customer.id}" ${state.selectedCustomerId === customer.id ? "selected" : ""}>${esc(customer.name)}</option>`).join("")}</select></div>
        <div class="mobile-cart-lines">${state.cart.length ? state.cart.map(mobileCartLine).join("") : emptyState("Cart is empty", "Return to Products and add an item to begin.", "cart")}</div>
        <div class="mobile-cart-total"><span>Subtotal</span><strong>${formatMoney(totals.total)}</strong></div>
        <div class="mobile-charge-row"><button class="mobile-sound-status" data-action="preview-checkout-sound" type="button">${I("activity")}<span><strong>Checkout chime</strong><small>${settingEnabled("checkoutSoundEnabled", true) ? "Enabled" : "Muted"}</small></span>${I("settings")}</button><button class="button button-primary" data-action="checkout" ${state.cart.length ? "" : "disabled"}>Charge ${formatMoney(totals.total)} ${I("arrowRight")}</button></div>
        <div class="mobile-offline-note">${I("lock")}<span>Sale will sync safely when you are back online</span></div>
      </aside>
    </section>`;
  }

  function mobileProductRow(product) {
    const out = product.trackStock !== false && num(product.stock) <= 0;
    const blocked = out && !allowNegativeStock();
    const low =
      product.trackStock !== false &&
      num(product.stock) <= num(product.reorderLevel);
    return `<article class="mobile-product-row ${out ? "out" : ""}">${productImageMarkup(product, "mobile-product-image")}<button class="mobile-product-copy" data-action="add-cart" data-id="${product.id}" ${blocked ? "disabled" : ""}><strong>${esc(product.name)}</strong><span>${esc(product.sku || product.barcode || categoryName(product.categoryId))}</span><small class="${low ? "low" : ""}">${product.trackStock === false ? "Service" : `Stock: ${num(product.stock)} ${esc(product.unit)}`}</small></button><strong class="mobile-product-price">${formatMoney(product.sellingPrice)}</strong><button class="mobile-add-product" data-action="add-cart" data-id="${product.id}" ${blocked ? "disabled" : ""} aria-label="Add ${esc(product.name)}">${I("plus")}</button></article>`;
  }

  function mobileCartLine(item) {
    const product =
      state.products.find((candidate) => candidate.id === item.productId) || item;
    const line = cartLineTotals(item);
    return `<div class="mobile-cart-line">${productImageMarkup(product, "mobile-cart-image")}<div><strong>${esc(item.name)}</strong><small>${formatMoney(item.unitPrice)} each</small></div><div class="qty-control"><button data-action="cart-qty" data-id="${item.productId}" data-change="-1" aria-label="Reduce ${esc(item.name)}">${I("minus")}</button><span>${num(item.quantity)}</span><button data-action="cart-qty" data-id="${item.productId}" data-change="1" aria-label="Increase ${esc(item.name)}">${I("plus")}</button></div><strong>${formatMoney(line.total)}</strong><button class="mobile-remove-line" data-action="remove-cart" data-id="${item.productId}" aria-label="Remove ${esc(item.name)}">${I("trash")}</button></div>`;
  }

  function renderCategoryTabs() {
    const favoriteCount = state.products.filter(
      (product) => product.active !== false && product.favorite,
    ).length;
    return `<button class="category-tab ${state.posCategory === "all" ? "active" : ""}" data-action="pos-category" data-id="all">All products</button>${favoriteCount ? `<button class="category-tab ${state.posCategory === "favorites" ? "active" : ""}" data-action="pos-category" data-id="favorites">${I("star")}Favorites <span>${favoriteCount}</span></button>` : ""}${state.categories.map((category) => `<button class="category-tab ${state.posCategory === category.id ? "active" : ""}" data-action="pos-category" data-id="${category.id}">${esc(category.name)}</button>`).join("")}`;
  }

  function filteredPOSProducts() {
    const query = state.posQuery.trim().toLowerCase();
    return state.products
      .filter((product) => product.active !== false)
      .filter(
        (product) =>
          state.posCategory === "all" ||
          (state.posCategory === "favorites"
            ? product.favorite
            : product.categoryId === state.posCategory),
      )
      .filter(
        (product) =>
          !query ||
          [
            product.name,
            product.sku,
            product.barcode,
            product.description,
          ].some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(query),
          ),
      )
      .sort(
        (a, b) =>
          Number(Boolean(b.favorite)) - Number(Boolean(a.favorite)) ||
          a.name.localeCompare(b.name),
      );
  }

  function productTile(product) {
    const out = product.trackStock !== false && num(product.stock) <= 0;
    const blocked = out && !allowNegativeStock();
    const low =
      product.trackStock !== false &&
      num(product.stock) <= num(product.reorderLevel);
    return `<button class="product-tile ${out ? "out" : ""}" data-action="add-cart" data-id="${product.id}" ${blocked ? "disabled" : ""} aria-label="${esc(blocked ? `${product.name} is out of stock` : `Add ${product.name} to cart`)}"><div class="product-tile-media">${productImageMarkup(product, "product-tile-image")}<span class="stock-pill ${out ? "out" : low ? "low" : ""}">${product.trackStock === false ? "Service" : `${num(product.stock)} ${esc(product.unit)}`}</span>${product.favorite ? `<span class="favorite-mark" title="Favorite">${I("star")}</span>` : ""}</div><div class="product-tile-body"><h3>${esc(product.name)}</h3><p>${esc(product.sku || product.barcode || categoryName(product.categoryId))}</p><div class="product-tile-footer"><strong>${formatMoney(product.sellingPrice)}</strong><span class="tile-add">${I("plus")}</span></div></div></button>`;
  }

  function cartItemHTML(item) {
    const line = cartLineTotals(item);
    const product =
      state.products.find((candidate) => candidate.id === item.productId) ||
      item;
    return `<div class="cart-item"><div class="cart-item-main">${productImageMarkup(product, "cart-item-image")}<div class="cart-item-copy"><strong>${esc(item.name)}</strong><span>${formatMoney(item.unitPrice)} each${line.discount ? ` · discount ${formatMoney(line.discount)}` : ""}</span><div class="cart-item-tools"><div class="qty-control"><button data-action="cart-qty" data-id="${item.productId}" data-change="-1" aria-label="Reduce quantity">${I("minus")}</button><span>${num(item.quantity)}</span><button data-action="cart-qty" data-id="${item.productId}" data-change="1" aria-label="Increase quantity">${I("plus")}</button></div><button class="mini-button" data-action="edit-cart-line" data-id="${item.productId}" title="Edit line">${I("edit")}</button></div></div></div><div class="cart-item-total"><strong>${formatMoney(line.total)}</strong><button data-action="remove-cart" data-id="${item.productId}" aria-label="Remove ${esc(item.name)}">${I("trash")}</button></div></div>`;
  }

  function cartLineTotals(item) {
    const gross = num(item.quantity) * num(item.unitPrice);
    const discount =
      item.discountType === "percent"
        ? (gross * clamp(num(item.discountValue), 0, 100)) / 100
        : clamp(num(item.discountValue), 0, gross);
    return { gross, discount, base: gross - discount, total: gross - discount };
  }

  function cartTotals() {
    const gross = state.cart.reduce(
      (sum, item) => sum + cartLineTotals(item).gross,
      0,
    );
    const lineDiscount = state.cart.reduce(
      (sum, item) => sum + cartLineTotals(item).discount,
      0,
    );
    const afterLine = Math.max(0, gross - lineDiscount);
    const orderDiscount =
      state.orderDiscountType === "percent"
        ? (afterLine * clamp(num(state.orderDiscountValue), 0, 100)) / 100
        : clamp(num(state.orderDiscountValue), 0, afterLine);
    const taxableBase = Math.max(0, afterLine - orderDiscount);
    const rate = num(state.business.taxRate);
    const tax =
      state.business.taxMode === "inclusive"
        ? rate
          ? (taxableBase * rate) / (100 + rate)
          : 0
        : (taxableBase * rate) / 100;
    const total =
      state.business.taxMode === "inclusive" ? taxableBase : taxableBase + tax;
    return {
      gross,
      lineDiscount,
      afterLine,
      orderDiscount,
      taxableBase,
      tax,
      total,
    };
  }

  function buildSaleItems() {
    const totals = cartTotals();
    const afterLine = totals.afterLine || 1;
    return state.cart.map((item) => {
      const line = cartLineTotals(item);
      const allocatedOrderDiscount =
        totals.orderDiscount * (line.base / afterLine);
      const afterOrder = Math.max(0, line.base - allocatedOrderDiscount);
      const rate = item.taxable === false ? 0 : num(state.business.taxRate);
      const taxAmount =
        state.business.taxMode === "inclusive"
          ? rate
            ? (afterOrder * rate) / (100 + rate)
            : 0
          : (afterOrder * rate) / 100;
      const lineTotal =
        state.business.taxMode === "inclusive"
          ? afterOrder
          : afterOrder + taxAmount;
      return {
        ...item,
        lineGross: line.gross,
        lineDiscount: line.discount,
        orderDiscountShare: allocatedOrderDiscount,
        taxRate: rate,
        taxAmount,
        lineTotal,
        returnedQty: 0,
      };
    });
  }

  function renderProducts() {
    const products = filteredCatalogueProducts();
    const lowStock = state.products.filter(
      (product) =>
        product.active !== false &&
        product.trackStock !== false &&
        num(product.stock) <= num(product.reorderLevel),
    ).length;
    const outOfStock = state.products.filter(
      (product) =>
        product.active !== false &&
        product.trackStock !== false &&
        num(product.stock) <= 0,
    ).length;
    const imageCount = state.products.filter((product) =>
      safeImageData(product.imageData),
    ).length;
    const retailValue = state.products.reduce(
      (sum, product) => sum + num(product.stock) * num(product.sellingPrice),
      0,
    );
    $("#appView").innerHTML = `<div class="page-stack phase-page products-phase-page">
      ${workspaceHero({
        eyebrow: "Catalogue control",
        title: "Keep every product ready to sell.",
        description:
          "Manage product identity, images, barcodes, pricing and stock visibility from one focused catalogue.",
        actions: `<button class="button button-primary" data-action="new-product">${I("plus")}Add product</button><button class="button button-outline" data-action="manage-categories">${I("tag")}Manage categories</button>`,
        spotlightLabel: "Current retail value",
        spotlightValue: formatMoney(retailValue),
        spotlightDetail: `${state.products.length} products across ${state.categories.length} categories`,
        iconName: "package",
        tone: lowStock ? "attention" : "ready",
      })}
      <section class="operation-metric-strip">
        ${operationMetric("Products", state.products.length, `${state.categories.length} active catalogue categories`, "package", "info")}
        ${operationMetric("Low stock", lowStock, `${outOfStock} product${outOfStock === 1 ? "" : "s"} currently out of stock`, "warning", lowStock ? "warning" : "success")}
        ${operationMetric("Product images", imageCount, `${state.products.length ? Math.round((imageCount / state.products.length) * 100) : 0}% catalogue image coverage`, "image", "success")}
        ${operationMetric("Shown now", products.length, "Products matching the active filters", "list", "info")}
      </section>
      <div class="page-toolbar"><div class="toolbar-title"><h2>Product catalogue</h2><p>Manage product information, images, pricing and stock visibility</p></div><div class="toolbar-actions"><div class="view-switch" aria-label="Catalogue layout"><button class="${state.productView === "table" ? "active" : ""}" data-action="product-view" data-mode="table" title="Table view">${I("list")}</button><button class="${state.productView === "grid" ? "active" : ""}" data-action="product-view" data-mode="grid" title="Grid view">${I("grid")}</button></div><button class="button button-outline" data-action="manage-categories">${I("tag")}Categories</button><button class="button button-primary" data-action="new-product">${I("plus")}Add product</button></div></div>
      <section class="panel catalogue-panel"><div class="panel-header catalogue-filter-header"><div class="catalogue-controls"><div class="search-box">${I("search")}<input data-filter="products" value="${esc(state.filters.products)}" placeholder="Search name, SKU, barcode or description"></div><select class="select-control" id="productCategoryFilter" aria-label="Filter by category"><option value="">All categories</option>${state.categories.map((category) => `<option value="${category.id}" ${state.productCategoryFilter === category.id ? "selected" : ""}>${esc(category.name)}</option>`).join("")}</select><select class="select-control" id="productStatusFilter" aria-label="Filter by status"><option value="all" ${state.productStatusFilter === "all" ? "selected" : ""}>All statuses</option><option value="favorites" ${state.productStatusFilter === "favorites" ? "selected" : ""}>Favorites</option><option value="low" ${state.productStatusFilter === "low" ? "selected" : ""}>Low stock</option><option value="out" ${state.productStatusFilter === "out" ? "selected" : ""}>Out of stock</option><option value="expiry" ${state.productStatusFilter === "expiry" ? "selected" : ""}>Expiry attention</option><option value="inactive" ${state.productStatusFilter === "inactive" ? "selected" : ""}>Inactive</option><option value="with-image" ${state.productStatusFilter === "with-image" ? "selected" : ""}>With image</option></select><select class="select-control" id="productSort" aria-label="Sort products"><option value="name-asc" ${state.productSort === "name-asc" ? "selected" : ""}>Name A–Z</option><option value="newest" ${state.productSort === "newest" ? "selected" : ""}>Newest first</option><option value="stock-asc" ${state.productSort === "stock-asc" ? "selected" : ""}>Lowest stock</option><option value="price-desc" ${state.productSort === "price-desc" ? "selected" : ""}>Highest price</option><option value="price-asc" ${state.productSort === "price-asc" ? "selected" : ""}>Lowest price</option></select></div><span class="badge primary">${products.length} shown</span></div>
        ${products.length ? (state.productView === "grid" ? `<div class="catalogue-grid">${products.map(productCatalogueCard).join("")}</div>` : `<div class="table-wrap mobile-cards"><table class="data-table product-table"><thead><tr><th>Product</th><th>SKU / Barcode</th><th>Category</th><th>Cost</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead><tbody>${products.map(productRow).join("")}</tbody></table></div>`) : emptyState("No products found", "Change the filters or add a new product to the catalogue.", "package")}
      </section>
      <button class="mobile-sticky-primary" data-action="new-product">${I("plus")}<span>Add product</span></button>
    </div>`;
  }

  function productHealth(product) {
    if (product.active === false)
      return { key: "inactive", label: "Inactive", tone: "" };
    if (product.expiryDate) {
      const expiry = new Date(`${product.expiryDate}T23:59:59`);
      const days = Math.ceil((expiry - new Date()) / 86400000);
      if (days < 0) return { key: "expired", label: "Expired", tone: "danger" };
      if (days <= clamp(num(state.business.expiryWarningDays) || 30, 1, 365))
        return {
          key: "expiring",
          label: `${days}d to expiry`,
          tone: "warning",
        };
    }
    if (product.trackStock !== false && num(product.stock) <= 0)
      return { key: "out", label: "Out of stock", tone: "danger" };
    if (
      product.trackStock !== false &&
      num(product.stock) <= num(product.reorderLevel)
    )
      return { key: "low", label: "Low stock", tone: "warning" };
    return { key: "active", label: "Active", tone: "success" };
  }

  function filteredCatalogueProducts() {
    const query = state.filters.products.trim().toLowerCase();
    let products = state.products.filter(
      (product) =>
        !query ||
        [
          product.name,
          product.sku,
          product.barcode,
          product.description,
          categoryName(product.categoryId),
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(query),
        ),
    );
    if (state.productCategoryFilter)
      products = products.filter(
        (product) => product.categoryId === state.productCategoryFilter,
      );
    const filter = state.productStatusFilter;
    if (filter === "favorites")
      products = products.filter((product) => product.favorite);
    if (filter === "low")
      products = products.filter((product) =>
        ["low", "out"].includes(productHealth(product).key),
      );
    if (filter === "out")
      products = products.filter(
        (product) => productHealth(product).key === "out",
      );
    if (filter === "expiry")
      products = products.filter((product) =>
        ["expired", "expiring"].includes(productHealth(product).key),
      );
    if (filter === "inactive")
      products = products.filter((product) => product.active === false);
    if (filter === "with-image")
      products = products.filter((product) => safeImageData(product.imageData));
    const sorters = {
      "name-asc": (a, b) => a.name.localeCompare(b.name),
      newest: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      "stock-asc": (a, b) =>
        num(a.stock) - num(b.stock) || a.name.localeCompare(b.name),
      "price-desc": (a, b) => num(b.sellingPrice) - num(a.sellingPrice),
      "price-asc": (a, b) => num(a.sellingPrice) - num(b.sellingPrice),
    };
    return products
      .slice()
      .sort(sorters[state.productSort] || sorters["name-asc"]);
  }

  function productCatalogueCard(product) {
    const health = productHealth(product);
    const margin = num(product.sellingPrice) - num(product.purchasePrice);
    return `<article class="catalogue-card"><button class="catalogue-card-media" data-action="view-product" data-id="${product.id}" aria-label="View ${esc(product.name)}">${productImageMarkup(product, "catalogue-card-image")}<span class="badge ${health.tone}">${esc(health.label)}</span></button><div class="catalogue-card-body"><div class="catalogue-card-title"><div><h3>${esc(product.name)}</h3><p>${esc(product.sku || product.barcode || "No product code")}</p></div><button class="favorite-button ${product.favorite ? "active" : ""}" data-action="toggle-favorite" data-id="${product.id}" title="${product.favorite ? "Remove from favorites" : "Add to favorites"}">${I("star")}</button></div><div class="catalogue-price-row"><strong>${formatMoney(product.sellingPrice)}</strong><span>${product.trackStock === false ? "Stock not tracked" : `${num(product.stock)} ${esc(product.unit)}`}</span></div><div class="catalogue-meta"><span>${esc(categoryName(product.categoryId))}</span><span>Profit ${formatMoney(margin)}</span></div></div><div class="catalogue-card-actions"><button data-action="view-product" data-id="${product.id}">${I("eye")}View</button><button data-action="edit-product" data-id="${product.id}">${I("edit")}Edit</button><button data-action="adjust-product" data-id="${product.id}">${I("boxes")}Stock</button></div></article>`;
  }

  function productRow(product) {
    const health = productHealth(product);
    return `<tr data-category="${product.categoryId || ""}"><td data-label="Product"><div class="cell-title">${productImageMarkup(product, "product-avatar product-avatar-image")}<div class="cell-copy"><strong>${esc(product.name)}</strong><span>${esc(product.unit || "piece")} · ${product.taxable === false ? "Tax exempt" : "Taxable"}</span></div></div></td><td data-label="SKU / Barcode"><div class="cell-copy"><strong>${esc(product.sku || "—")}</strong><span>${esc(product.barcode || "No barcode")}</span></div></td><td data-label="Category">${esc(categoryName(product.categoryId))}</td><td data-label="Cost">${formatMoney(product.purchasePrice)}</td><td data-label="Price"><strong>${formatMoney(product.sellingPrice)}</strong></td><td data-label="Stock"><strong>${product.trackStock === false ? "Not tracked" : `${num(product.stock)} ${esc(product.unit)}`}</strong></td><td data-label="Status"><span class="badge ${health.tone}">${esc(health.label)}</span></td><td data-label="Actions"><div class="row-actions"><button class="mini-button ${product.favorite ? "favorite-active" : ""}" data-action="toggle-favorite" data-id="${product.id}" title="Favorite">${I("star")}</button><button class="mini-button" data-action="view-product" data-id="${product.id}" title="View details">${I("eye")}</button><button class="mini-button" data-action="edit-product" data-id="${product.id}" title="Edit">${I("edit")}</button><button class="mini-button" data-action="adjust-product" data-id="${product.id}" title="Adjust stock">${I("boxes")}</button></div></td></tr>`;
  }

  function openProductDetails(id) {
    const product = state.products.find((candidate) => candidate.id === id);
    if (!product) return;
    const health = productHealth(product);
    const profit = num(product.sellingPrice) - num(product.purchasePrice);
    const margin =
      num(product.sellingPrice) > 0
        ? (profit / num(product.sellingPrice)) * 100
        : 0;
    openModal(
      "Product details",
      "Catalogue, pricing and stock overview",
      `<div class="product-detail-layout"><div class="product-detail-media">${productImageMarkup(product, "product-detail-image")}<span class="badge ${health.tone}">${esc(health.label)}</span></div><div class="product-detail-content"><div class="product-detail-heading"><div><span class="eyebrow">${esc(categoryName(product.categoryId))}</span><h3>${esc(product.name)}</h3><p>${esc(product.description || "No product description has been added.")}</p></div><button class="favorite-button ${product.favorite ? "active" : ""}" data-action="toggle-favorite" data-id="${product.id}" title="Favorite">${I("star")}</button></div><div class="product-detail-price"><div><span>Selling price</span><strong>${formatMoney(product.sellingPrice)}</strong></div><div><span>Profit per unit</span><strong>${formatMoney(profit)}</strong><small>${margin.toFixed(1)}% margin</small></div></div><div class="product-detail-facts"><div><span>SKU</span><strong>${esc(product.sku || "—")}</strong></div><div><span>Barcode</span><strong>${esc(product.barcode || "—")}</strong></div><div><span>Current stock</span><strong>${product.trackStock === false ? "Not tracked" : `${num(product.stock)} ${esc(product.unit)}`}</strong></div><div><span>Reorder level</span><strong>${num(product.reorderLevel)} ${esc(product.unit)}</strong></div><div><span>Supplier</span><strong>${esc(supplierName(product.supplierId))}</strong></div><div><span>Expiry date</span><strong>${product.expiryDate ? formatDate(product.expiryDate) : "Not set"}</strong></div></div></div></div><div class="form-actions product-detail-actions"><button type="button" class="button button-ghost danger-text" data-action="delete-product" data-id="${product.id}">${I("trash")}Delete</button><button type="button" class="button button-outline" data-action="duplicate-product" data-id="${product.id}">${I("copy")}Duplicate</button><button type="button" class="button button-outline" data-action="adjust-product" data-id="${product.id}">${I("boxes")}Adjust stock</button><button type="button" class="button button-primary" data-action="edit-product" data-id="${product.id}">${I("edit")}Edit product</button></div>`,
      true,
    );
  }

  async function toggleProductFavorite(id) {
    const product = state.products.find((candidate) => candidate.id === id);
    if (!product) return;
    const nextFavorite = !product.favorite;
    const detailOpen =
      !$("#modalLayer").hidden && Boolean($(".product-detail-layout"));
    await DB.put("products", {
      ...product,
      favorite: nextFavorite,
      updatedAt: nowISO(),
    });
    await loadData();
    renderProducts();
    if (detailOpen) openProductDetails(id);
    toast(
      nextFavorite ? "Added to favorites" : "Removed from favorites",
      product.name,
      "success",
    );
  }

  async function duplicateProduct(id) {
    const product = state.products.find((candidate) => candidate.id === id);
    if (!product) return;
    const existingCodes = new Set(
      state.products.map((candidate) =>
        String(candidate.sku || "").toLowerCase(),
      ),
    );
    const base = `${product.sku || "PRODUCT"}-COPY`;
    let sku = base;
    let index = 2;
    while (existingCodes.has(sku.toLowerCase())) sku = `${base}-${index++}`;
    const timestamp = nowISO();
    const copy = {
      ...product,
      id: uid("prod"),
      name: `${product.name} Copy`,
      sku,
      barcode: "",
      stock: 0,
      favorite: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await DB.put("products", copy);
    closeModal();
    await refresh("products");
    toast(
      "Product duplicated",
      `${copy.name} was created with zero opening stock.`,
      "success",
    );
  }

  function renderInventory() {
    const query = state.filters.inventory.toLowerCase();
    const products = state.products
      .filter((product) => product.trackStock !== false)
      .filter(
        (product) =>
          !query ||
          [product.name, product.sku, product.barcode].some((v) =>
            String(v || "")
              .toLowerCase()
              .includes(query),
          ),
      );
    const valueCost = products.reduce(
      (sum, p) => sum + num(p.stock) * num(p.purchasePrice),
      0,
    );
    const valueRetail = products.reduce(
      (sum, p) => sum + num(p.stock) * num(p.sellingPrice),
      0,
    );
    const unitsInStock = products.reduce((sum, product) => sum + num(product.stock), 0);
    const low = products.filter((p) => num(p.stock) <= num(p.reorderLevel));
    const outOfStock = low.filter((product) => num(product.stock) <= 0).length;
    $("#appView").innerHTML = `<div class="page-stack phase-page inventory-phase-page">
      ${workspaceHero({
        eyebrow: "Inventory operations",
        title: "Know what is available before the next sale.",
        description:
          "Monitor live quantities, trace every movement and resolve replenishment risks before they interrupt checkout.",
        actions: `<button class="button button-primary" data-action="adjust-stock">${I("plus")}Adjust stock</button><button class="button button-outline" data-view="stock-count">${I("clipboard")}Start physical count</button>`,
        spotlightLabel: "Stock at retail value",
        spotlightValue: formatMoney(valueRetail),
        spotlightDetail: `${products.length} tracked products · ${low.length} need attention`,
        iconName: "boxes",
        tone: low.length ? "attention" : "ready",
      })}
      <section class="operation-metric-strip">
        ${operationMetric("Units in stock", unitsInStock, "Across all tracked catalogue products", "boxes", "info")}
        ${operationMetric("Cost valuation", formatMoney(valueCost), "Current stock at latest purchase cost", "money", "info")}
        ${operationMetric("Low stock", low.length, `${outOfStock} product${outOfStock === 1 ? "" : "s"} out of stock`, "warning", low.length ? "warning" : "success")}
        ${operationMetric("Movement records", state.stockMovements.length, "Purchases, sales, returns and adjustments", "activity", "success")}
      </section>
      <div class="page-toolbar"><div class="toolbar-title"><h2>Inventory control</h2><p>Stock levels and every movement recorded on this device</p></div><div class="toolbar-actions"><button class="button button-outline" data-view="stock-count">${I("clipboard")}Start count</button><button class="button button-primary" data-action="adjust-stock">${I("plus")}Adjust stock</button></div></div>
      <section class="panel phase-tab-panel"><div class="tabs operations-tabs"><button class="tab-button active" data-action="inventory-tab" data-tab="levels">${I("boxes")}Stock levels</button><button class="tab-button" data-action="inventory-tab" data-tab="movements">${I("activity")}Movement history</button><button class="tab-button" data-action="inventory-tab" data-tab="alerts">${I("warning")}Low stock</button></div><div id="inventoryTabBody">${inventoryLevelsHTML(products)}</div></section>
      <button class="mobile-sticky-primary" data-action="adjust-stock">${I("plus")}<span>Adjust stock</span></button>
    </div>`;
  }

  function inventoryLevelsHTML(
    products = state.products.filter((p) => p.trackStock !== false),
  ) {
    const query = state.filters.inventory.toLowerCase();
    products = products.filter(
      (p) =>
        !query ||
        [p.name, p.sku, p.barcode].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(query),
        ),
    );
    return `<div class="panel-header"><div class="search-box">${I("search")}<input data-filter="inventory" value="${esc(state.filters.inventory)}" placeholder="Search inventory"></div><span class="badge primary">${products.length} products</span></div><div class="table-wrap mobile-cards"><table class="data-table"><thead><tr><th>Product</th><th>Stock</th><th>Reorder level</th><th>Cost value</th><th>Retail value</th><th>Supplier</th><th>Updated</th><th></th></tr></thead><tbody>${products.map((p) => `<tr><td data-label="Product"><div class="cell-title">${productImageMarkup(p, "product-avatar product-avatar-image")}<div class="cell-copy"><strong>${esc(p.name)}</strong><span>${esc(p.sku || p.barcode || "No code")}</span></div></div></td><td data-label="Stock"><strong>${num(p.stock)} ${esc(p.unit)}</strong></td><td data-label="Reorder">${num(p.reorderLevel)} ${esc(p.unit)}</td><td data-label="Cost value">${formatMoney(num(p.stock) * num(p.purchasePrice))}</td><td data-label="Retail value">${formatMoney(num(p.stock) * num(p.sellingPrice))}</td><td data-label="Supplier">${esc(supplierName(p.supplierId))}</td><td data-label="Updated">${formatDate(p.updatedAt, { short: true })}</td><td data-label="Actions"><div class="row-actions"><button class="mini-button" data-action="adjust-product" data-id="${p.id}">${I("edit")}</button></div></td></tr>`).join("")}</tbody></table></div>`;
  }

  function inventoryMovementsHTML() {
    return `<div class="panel-header"><div><h2>Stock movement history</h2><p>Purchases, sales, returns, counts and manual adjustments</p></div><span class="badge primary">${state.stockMovements.length} records</span></div><div class="table-wrap mobile-cards"><table class="data-table"><thead><tr><th>Date</th><th>Product</th><th>Movement</th><th>Before</th><th>After</th><th>Reference</th><th>Note</th></tr></thead><tbody>${
      state.stockMovements.length
        ? state.stockMovements
            .slice(0, 300)
            .map(
              (m) =>
                `<tr><td data-label="Date">${formatDateTime(m.createdAt)}</td><td data-label="Product"><strong>${esc(m.productName || state.products.find((p) => p.id === m.productId)?.name || "Deleted product")}</strong></td><td data-label="Movement"><span class="badge ${num(m.quantity) >= 0 ? "success" : "danger"}">${num(m.quantity) >= 0 ? "+" : ""}${num(m.quantity)} · ${esc(m.type)}</span></td><td data-label="Before">${num(m.stockBefore)}</td><td data-label="After"><strong>${num(m.stockAfter)}</strong></td><td data-label="Reference">${esc(m.referenceType || "—")}</td><td data-label="Note">${esc(m.note || "—")}</td></tr>`,
            )
            .join("")
        : `<tr><td colspan="7">${emptyState("No stock movements", "Transactions and adjustments will appear here.", "activity")}</td></tr>`
    }</tbody></table></div>`;
  }

  function inventoryAlertsHTML() {
    const products = state.products.filter(
      (p) =>
        p.active !== false &&
        p.trackStock !== false &&
        num(p.stock) <= num(p.reorderLevel),
    );
    return `<div class="panel-header"><div><h2>Products to reorder</h2><p>Current stock is at or below the configured reorder point</p></div><button class="button button-primary" data-action="new-purchase">${I("truck")}Receive purchase</button></div>${products.length ? `<div class="table-wrap mobile-cards"><table class="data-table"><thead><tr><th>Product</th><th>Current stock</th><th>Reorder at</th><th>Suggested order</th><th>Supplier</th><th></th></tr></thead><tbody>${products.map((p) => `<tr><td data-label="Product"><strong>${esc(p.name)}</strong></td><td data-label="Current"><span class="badge ${num(p.stock) <= 0 ? "danger" : "warning"}">${num(p.stock)} ${esc(p.unit)}</span></td><td data-label="Reorder">${num(p.reorderLevel)}</td><td data-label="Suggested"><strong>${Math.max(num(p.reorderLevel) * 2 - num(p.stock), num(p.reorderLevel))} ${esc(p.unit)}</strong></td><td data-label="Supplier">${esc(supplierName(p.supplierId))}</td><td data-label="Actions"><button class="mini-button" data-action="adjust-product" data-id="${p.id}">${I("edit")}</button></td></tr>`).join("")}</tbody></table></div>` : emptyState("Stock is healthy", "No products are currently below their reorder levels.", "check")}`;
  }

  function renderStockCount() {
    const counts = state.stockCounts;
    const completed = counts.filter((count) => count.status === "completed");
    const drafts = counts.filter((count) => count.status === "draft");
    const latest = counts[0];
    const latestDifferences = latest?.items?.filter(
      (item) => num(item.difference) !== 0,
    ).length || 0;
    const totalCountedProducts = completed.reduce(
      (sum, count) => sum + (count.items?.length || 0),
      0,
    );
    $("#appView").innerHTML = `<div class="page-stack phase-page stock-count-phase-page">
      ${workspaceHero({
        eyebrow: "Inventory assurance",
        title: "Count, compare and correct stock with confidence.",
        description:
          "Run controlled physical counts, review every variance and create a complete stock movement audit trail.",
        actions: `<button class="button button-primary" data-action="new-stock-count">${I("plus")}New stock count</button><button class="button button-outline" data-view="inventory">${I("boxes")}Return to inventory</button>`,
        spotlightLabel: latest ? "Latest count" : "Count readiness",
        spotlightValue: latest ? esc(latest.countNo) : "Ready",
        spotlightDetail: latest
          ? `${latestDifferences} difference${latestDifferences === 1 ? "" : "s"} · ${String(latest.status || "draft").replaceAll("-", " ")}`
          : "Start with the products currently on hand",
        iconName: "clipboard",
        tone: drafts.length ? "attention" : "ready",
      })}
      <section class="operation-metric-strip">
        ${operationMetric("Completed counts", completed.length, "Counts applied to system inventory", "check", "success")}
        ${operationMetric("Draft counts", drafts.length, "Counts that can still be continued", "edit", drafts.length ? "warning" : "success")}
        ${operationMetric("Products verified", totalCountedProducts, "Total product lines across completed counts", "package", "info")}
        ${operationMetric("Latest differences", latestDifferences, "Variance lines in the most recent count", "activity", latestDifferences ? "warning" : "success")}
      </section>
      <div class="page-toolbar"><div class="toolbar-title"><h2>Physical stock counts</h2><p>Use stock counts to correct shrinkage, damage and recording differences</p></div><button class="button button-primary" data-action="new-stock-count">${I("plus")}New stock count</button></div>
      <section class="count-guidance panel"><div class="count-guidance-heading"><span>${I("info")}</span><div><strong>Run a controlled count</strong><p>Pause sales during the count so system quantities do not change while staff are checking shelves.</p></div></div><ol class="count-workflow"><li><span>1</span><div><strong>Select products</strong><small>Choose a full or targeted product list.</small></div></li><li><span>2</span><div><strong>Enter physical quantities</strong><small>Record what staff can verify on the shelf.</small></div></li><li><span>3</span><div><strong>Review and apply</strong><small>Approve differences and write the audit movements.</small></div></li></ol></section>
      <section class="panel"><div class="table-wrap mobile-cards"><table class="data-table"><thead><tr><th>Count</th><th>Started</th><th>Completed</th><th>Products</th><th>Differences</th><th>Status</th><th></th></tr></thead><tbody>${counts.length ? counts.map((count) => `<tr><td data-label="Count"><strong>${esc(count.countNo)}</strong></td><td data-label="Started">${formatDateTime(count.startedAt)}</td><td data-label="Completed">${formatDateTime(count.completedAt)}</td><td data-label="Products">${count.items?.length || 0}</td><td data-label="Differences">${count.items?.filter((item) => num(item.difference) !== 0).length || 0}</td><td data-label="Status">${statusBadge(count.status)}</td><td data-label="Actions"><div class="row-actions"><button class="mini-button" data-action="view-stock-count" data-id="${count.id}">${I("eye")}</button>${count.status === "draft" ? `<button class="mini-button" data-action="continue-stock-count" data-id="${count.id}">${I("edit")}</button>` : ""}</div></td></tr>`).join("") : `<tr><td colspan="7">${emptyState("No stock counts", "Start a physical count to verify inventory accuracy.", "clipboard")}</td></tr>`}</tbody></table></div></section>
      <button class="mobile-sticky-primary" data-action="new-stock-count">${I("plus")}<span>New stock count</span></button>
    </div>`;
  }

  function renderPurchases() {
    const query = state.filters.purchases.toLowerCase();
    const purchases = state.purchases.filter(
      (p) =>
        !query ||
        [p.purchaseNo, p.supplierName, p.reference].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(query),
        ),
    );
    const orders = state.purchaseOrders.filter(
      (order) =>
        !query ||
        [order.purchaseOrderNo, order.supplierName, order.reference].some((v) =>
          String(v || "").toLowerCase().includes(query),
        ),
    );
    const total = purchases.reduce((s, p) => s + num(p.total), 0);
    const due = state.suppliers.reduce((s, p) => s + num(p.balance), 0);
    const openOrders = state.purchaseOrders.filter((order) =>
      ["draft", "ordered", "partially-received"].includes(order.status),
    );
    const valueOnOrder = openOrders.reduce(
      (sum, order) =>
        sum +
        (order.items || []).reduce(
          (lineSum, item) =>
            lineSum +
            Math.max(0, num(item.quantity) - num(item.receivedQuantity)) *
              num(item.unitCost),
          0,
        ),
      0,
    );
    const suppliersOwed = state.suppliers.filter((supplier) => num(supplier.balance) > 0).length;
    $("#appView").innerHTML = `<div class="page-stack phase-page purchases-phase-page">
      ${workspaceHero({
        eyebrow: "Supply operations",
        title: "Move every supplier order from request to shelf.",
        description:
          "Create purchase orders, monitor delivery progress, receive stock and control supplier balances from one workflow.",
        actions: `<button class="button button-primary" data-action="new-purchase-order">${I("plus")}New purchase order</button><button class="button button-outline" data-action="new-purchase">${I("truck")}Receive delivery</button>`,
        spotlightLabel: "Value still on order",
        spotlightValue: formatMoney(valueOnOrder),
        spotlightDetail: `${openOrders.length} open order${openOrders.length === 1 ? "" : "s"} across active suppliers`,
        iconName: "truck",
        tone: openOrders.length ? "attention" : "ready",
      })}
      <section class="operation-metric-strip">
        ${operationMetric("Open orders", openOrders.length, "Draft, ordered and partially received", "clipboard", openOrders.length ? "warning" : "success")}
        ${operationMetric("Received stock", formatMoney(total), "Value of all recorded supplier deliveries", "truck", "success")}
        ${operationMetric("Supplier balances", formatMoney(due), `${suppliersOwed} supplier${suppliersOwed === 1 ? "" : "s"} currently owed`, "credit", due ? "warning" : "success")}
        ${operationMetric("Received records", purchases.length, "Deliveries matching the current search", "list", "info")}
      </section>
      <div class="page-toolbar"><div class="toolbar-title"><h2>Purchasing control centre</h2><p>Create supplier orders, track delivery progress and receive stock</p></div><div class="toolbar-actions"><button class="button button-outline" data-action="new-purchase">${I("truck")}Receive without order</button><button class="button button-primary" data-action="new-purchase-order">${I("plus")}New purchase order</button></div></div>
      <section class="panel"><div class="panel-header"><div><h2>Purchase orders</h2><p>Draft, submit and receive supplier orders</p></div><div class="search-box">${I("search")}<input data-filter="purchases" value="${esc(state.filters.purchases)}" placeholder="Search order, purchase or supplier"></div></div><div class="table-wrap mobile-cards"><table class="data-table"><thead><tr><th>Order</th><th>Supplier</th><th>Expected</th><th>Progress</th><th>Value</th><th>Status</th><th></th></tr></thead><tbody>${orders.length ? orders.map((order) => {
        const ordered = (order.items || []).reduce((sum, item) => sum + num(item.quantity), 0);
        const received = (order.items || []).reduce((sum, item) => sum + num(item.receivedQuantity), 0);
        const canReceive = ["ordered", "partially-received"].includes(order.status) && received < ordered;
        return `<tr><td data-label="Order"><div class="cell-copy"><strong>${esc(order.purchaseOrderNo)}</strong><span>${esc(order.reference || "No reference")}</span></div></td><td data-label="Supplier">${esc(order.supplierName || supplierName(order.supplierId))}</td><td data-label="Expected">${formatDate(order.expectedDate)}</td><td data-label="Progress"><strong>${received} / ${ordered}</strong><span class="table-subtext">units received</span></td><td data-label="Value"><strong>${formatMoney(order.total)}</strong></td><td data-label="Status">${statusBadge(order.status)}</td><td data-label="Actions"><div class="row-actions"><button class="mini-button" data-action="view-purchase-order" data-id="${order.id}" title="View order">${I("eye")}</button>${order.status === "draft" ? `<button class="mini-button" data-action="edit-purchase-order" data-id="${order.id}" title="Edit order">${I("edit")}</button><button class="mini-button" data-action="submit-purchase-order" data-id="${order.id}" title="Mark ordered">${I("check")}</button>` : ""}${canReceive ? `<button class="mini-button success" data-action="receive-purchase-order" data-id="${order.id}" title="Receive stock">${I("truck")}</button>` : ""}${["draft", "ordered", "partially-received"].includes(order.status) ? `<button class="mini-button danger" data-action="cancel-purchase-order" data-id="${order.id}" title="Cancel order">${I("close")}</button>` : ""}</div></td></tr>`;
      }).join("") : `<tr><td colspan="7">${emptyState("No purchase orders", "Create an order before the next supplier delivery.", "clipboard")}</td></tr>`}</tbody></table></div></section>
      <section class="panel"><div class="panel-header"><div><h2>Received purchases</h2><p>Saving a delivery automatically increases product stock</p></div><button class="button button-outline" data-action="export-purchases">${I("download")}Export CSV</button></div><div class="table-wrap mobile-cards"><table class="data-table"><thead><tr><th>Purchase</th><th>Date</th><th>Supplier</th><th>Order</th><th>Items</th><th>Total</th><th>Balance</th><th>Status</th><th></th></tr></thead><tbody>${purchases.length ? purchases.map((p) => `<tr><td data-label="Purchase"><div class="cell-copy"><strong>${esc(p.purchaseNo)}</strong><span>${esc(p.reference || "No supplier reference")}</span></div></td><td data-label="Date">${formatDate(p.date)}</td><td data-label="Supplier">${esc(p.supplierName || supplierName(p.supplierId))}</td><td data-label="Order">${esc(p.purchaseOrderNo || "Direct")}</td><td data-label="Items">${p.items?.length || 0}</td><td data-label="Total"><strong>${formatMoney(p.total)}</strong></td><td data-label="Balance">${formatMoney(p.balance)}</td><td data-label="Status">${statusBadge(p.status)}</td><td data-label="Actions"><button class="mini-button" data-action="view-purchase" data-id="${p.id}">${I("eye")}</button></td></tr>`).join("") : `<tr><td colspan="9">${emptyState("No purchases received", "Receive a supplier delivery to increase stock.", "truck")}</td></tr>`}</tbody></table></div></section>
      <button class="mobile-sticky-primary" data-action="new-purchase-order">${I("plus")}<span>New purchase order</span></button>
    </div>`;
  }

  function renderSuppliers() {
    const query = state.filters.suppliers.toLowerCase();
    const suppliers = state.suppliers.filter(
      (s) =>
        !query ||
        [s.name, s.phone, s.email].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(query),
        ),
    );
    const totalPurchases = state.suppliers.reduce(
      (sum, supplier) => sum + num(supplier.totalPurchases),
      0,
    );
    const outstanding = state.suppliers.reduce(
      (sum, supplier) => sum + num(supplier.balance),
      0,
    );
    const suppliersOwed = state.suppliers.filter(
      (supplier) => num(supplier.balance) > 0,
    ).length;
    const activeOrders = state.purchaseOrders.filter((order) =>
      ["draft", "ordered", "partially-received"].includes(order.status),
    ).length;
    $("#appView").innerHTML = `<div class="page-stack phase-page suppliers-phase-page">
      ${workspaceHero({
        eyebrow: "Supplier relationships",
        title: "Keep purchasing contacts and obligations in one place.",
        description:
          "Review supplier contacts, purchase activity, open orders and outstanding balances before making the next commitment.",
        actions: `<button class="button button-primary" data-action="new-supplier">${I("plus")}Add supplier</button><button class="button button-outline" data-view="purchases">${I("truck")}Open purchases</button>`,
        spotlightLabel: "Accounts payable",
        spotlightValue: formatMoney(outstanding),
        spotlightDetail: `${suppliersOwed} supplier${suppliersOwed === 1 ? "" : "s"} currently owed`,
        iconName: "supplier",
        tone: outstanding ? "attention" : "ready",
      })}
      <section class="operation-metric-strip">
        ${operationMetric("Suppliers", state.suppliers.length, `${suppliers.length} matching the current search`, "supplier", "info")}
        ${operationMetric("Lifetime purchases", formatMoney(totalPurchases), "Recorded supplier stock value", "chart", "success")}
        ${operationMetric("Active orders", activeOrders, "Orders still awaiting completion", "clipboard", activeOrders ? "warning" : "success")}
        ${operationMetric("Outstanding", formatMoney(outstanding), "Total amount payable to suppliers", "credit", outstanding ? "warning" : "success")}
      </section>
      <div class="page-toolbar"><div class="toolbar-title"><h2>Supplier directory</h2><p>Manage contacts, purchase history and amounts payable</p></div><button class="button button-primary" data-action="new-supplier">${I("plus")}Add supplier</button></div>
      <section class="panel"><div class="panel-header"><div class="search-box">${I("search")}<input data-filter="suppliers" value="${esc(state.filters.suppliers)}" placeholder="Search supplier"></div><span class="badge primary">${suppliers.length} suppliers</span></div><div class="table-wrap mobile-cards"><table class="data-table"><thead><tr><th>Supplier</th><th>Contact</th><th>Total purchases</th><th>Outstanding</th><th>Last purchase</th><th></th></tr></thead><tbody>${suppliers.length ? suppliers.map((s) => `<tr><td data-label="Supplier"><div class="cell-title"><div class="entity-avatar">${esc(initials(s.name))}</div><div class="cell-copy"><strong>${esc(s.name)}</strong><span>${esc(s.address || "No address")}</span></div></div></td><td data-label="Contact"><div class="cell-copy"><strong>${esc(s.phone || "—")}</strong><span>${esc(s.email || "No email")}</span></div></td><td data-label="Purchases">${formatMoney(s.totalPurchases)}</td><td data-label="Outstanding"><strong>${formatMoney(s.balance)}</strong></td><td data-label="Last purchase">${formatDate(s.lastPurchaseAt)}</td><td data-label="Actions"><div class="row-actions"><button class="mini-button" data-action="view-supplier" data-id="${s.id}">${I("eye")}</button><button class="mini-button" data-action="supplier-payment" data-id="${s.id}">${I("money")}</button><button class="mini-button" data-action="edit-supplier" data-id="${s.id}">${I("edit")}</button></div></td></tr>`).join("") : `<tr><td colspan="6">${emptyState("No suppliers", "Add suppliers before recording purchase deliveries.", "supplier")}</td></tr>`}</tbody></table></div></section>
      <button class="mobile-sticky-primary" data-action="new-supplier">${I("plus")}<span>Add supplier</span></button>
    </div>`;
  }

  function renderCustomers() {
    const query = state.filters.customers.toLowerCase();
    const customers = state.customers.filter(
      (c) =>
        !query ||
        [c.name, c.phone, c.email].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(query),
        ),
    );
    const due = state.customers.reduce((sum, customer) => sum + num(customer.balance), 0);
    const creditCustomers = state.customers.filter(
      (customer) => num(customer.balance) > 0,
    );
    const totalPurchases = state.customers.reduce(
      (sum, customer) => sum + num(customer.totalPurchases),
      0,
    );
    const nearLimit = creditCustomers.filter(
      (customer) =>
        num(customer.creditLimit) > 0 &&
        num(customer.balance) >= num(customer.creditLimit) * 0.8,
    ).length;
    $("#appView").innerHTML = `<div class="page-stack phase-page customers-phase-page">
      ${workspaceHero({
        eyebrow: "Customer relationships",
        title: "Serve regular customers without losing control of credit.",
        description:
          "Keep contact details, lifetime purchase value, credit limits and repayments connected to every customer account.",
        actions: `<button class="button button-primary" data-action="new-customer">${I("plus")}Add customer</button><button class="button button-outline" data-view="pos">${I("cart")}Start customer sale</button>`,
        spotlightLabel: "Credit receivable",
        spotlightValue: formatMoney(due),
        spotlightDetail: `${creditCustomers.length} customer account${creditCustomers.length === 1 ? "" : "s"} with a balance`,
        iconName: "users",
        tone: due ? "attention" : "ready",
      })}
      <section class="operation-metric-strip">
        ${operationMetric("Customers", state.customers.length, `${customers.length} matching the current search`, "users", "info")}
        ${operationMetric("Lifetime sales", formatMoney(totalPurchases), "Recorded purchases across customer accounts", "chart", "success")}
        ${operationMetric("Credit accounts", creditCustomers.length, "Customers with an outstanding balance", "credit", creditCustomers.length ? "warning" : "success")}
        ${operationMetric("Near credit limit", nearLimit, "Accounts using at least 80% of their limit", "warning", nearLimit ? "warning" : "success")}
      </section>
      <div class="page-toolbar"><div class="toolbar-title"><h2>Customer accounts</h2><p>Track sales, credit limits and repayments</p></div><button class="button button-primary" data-action="new-customer">${I("plus")}Add customer</button></div>
      <section class="panel"><div class="panel-header"><div class="search-box">${I("search")}<input data-filter="customers" value="${esc(state.filters.customers)}" placeholder="Search name or phone"></div><button class="button button-outline" data-action="export-customers">${I("download")}Export CSV</button></div><div class="table-wrap mobile-cards"><table class="data-table"><thead><tr><th>Customer</th><th>Contact</th><th>Total purchases</th><th>Credit balance</th><th>Credit limit</th><th>Last purchase</th><th></th></tr></thead><tbody>${customers.length ? customers.map((c) => `<tr><td data-label="Customer"><div class="cell-title"><div class="entity-avatar">${esc(initials(c.name))}</div><div class="cell-copy"><strong>${esc(c.name)}</strong><span>Joined ${formatDate(c.createdAt, { short: true })}</span></div></div></td><td data-label="Contact"><div class="cell-copy"><strong>${esc(c.phone || "—")}</strong><span>${esc(c.email || c.address || "No additional contact")}</span></div></td><td data-label="Purchases">${formatMoney(c.totalPurchases)}</td><td data-label="Balance"><strong>${formatMoney(c.balance)}</strong></td><td data-label="Limit">${num(c.creditLimit) ? formatMoney(c.creditLimit) : "No limit set"}</td><td data-label="Last purchase">${formatDate(c.lastPurchaseAt)}</td><td data-label="Actions"><div class="row-actions"><button class="mini-button" data-action="view-customer" data-id="${c.id}">${I("eye")}</button><button class="mini-button" data-action="customer-payment" data-id="${c.id}">${I("money")}</button><button class="mini-button" data-action="edit-customer" data-id="${c.id}">${I("edit")}</button></div></td></tr>`).join("") : `<tr><td colspan="7">${emptyState("No customers", "Add customers to track purchase history and credit.", "users")}</td></tr>`}</tbody></table></div></section>
      <button class="mobile-sticky-primary" data-action="new-customer">${I("plus")}<span>Add customer</span></button>
    </div>`;
  }

  function renderSales() {
    const query = state.filters.sales.toLowerCase();
    const searchedSales = state.sales.filter(
      (sale) =>
        !query ||
        [
          sale.receiptNo,
          sale.customerName,
          paymentLabel(sale.paymentMethod),
        ].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(query),
        ),
    );
    const statusFilter = state.salesStatusFilter || "all";
    const sales = searchedSales.filter((sale) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "returned")
        return ["partially-refunded", "refunded"].includes(sale.status);
      return sale.status === statusFilter;
    });
    const completed = state.sales.filter((sale) => sale.status !== "voided");
    const returns = state.returns.reduce((s, r) => s + num(r.refundTotal), 0);
    const approvals = state.approvalRequests
      .filter((request) => request.type !== "expense")
      .slice()
      .sort((a, b) => {
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (b.status === "pending" && a.status !== "pending") return 1;
        return new Date(b.requestedAt) - new Date(a.requestedAt);
      });
    const pendingCount = approvals.filter(
      (approval) => approval.status === "pending",
    ).length;
    const grossSales = completed.reduce((sum, sale) => sum + num(sale.total), 0);
    const returnedCount = searchedSales.filter((sale) =>
      ["partially-refunded", "refunded"].includes(sale.status),
    ).length;
    const statusTabs = [
      ["all", "All", searchedSales.length],
      [
        "completed",
        "Completed",
        searchedSales.filter((sale) => sale.status === "completed").length,
      ],
      ["returned", "Returned", returnedCount],
      [
        "voided",
        "Voided",
        searchedSales.filter((sale) => sale.status === "voided").length,
      ],
    ];
    const salesTableRows = sales.length
      ? sales
          .map((sale) => {
        const hasReturn = state.returns.some((item) => item.saleId === sale.id);
        const pending = pendingApproval(sale.id);
        const canReturn = !["refunded", "voided"].includes(sale.status) && !pending;
        const canVoid = sale.status === "completed" && !hasReturn && !pending;
        return `<tr data-status="${sale.status}"><td data-label="Receipt"><div class="cell-copy"><strong>${esc(sale.receiptNo)}</strong>${pending ? `<span class="approval-pending-label">${esc(pending.type)} approval pending</span>` : ""}</div></td><td data-label="Date">${formatDateTime(sale.createdAt)}</td><td data-label="Customer">${esc(sale.customerName || customerName(sale.customerId))}</td><td data-label="Payment">${esc(paymentLabel(sale.paymentMethod))}</td><td data-label="Items">${sale.items?.reduce((s, i) => s + num(i.quantity), 0) || 0}</td><td data-label="Total"><strong>${formatMoney(sale.total)}</strong></td><td data-label="Status">${statusBadge(sale.status)}</td><td data-label="Actions"><div class="row-actions"><button class="mini-button" data-action="view-sale" data-id="${sale.id}" title="View sale">${I("eye")}</button><button class="mini-button" data-action="print-sale" data-id="${sale.id}" title="Print receipt">${I("print")}</button><button class="mini-button" data-action="download-sale" data-id="${sale.id}" title="Download receipt image">${I("download")}</button>${canReturn ? `<button class="mini-button" data-action="return-sale" data-id="${sale.id}" title="Request return">${I("return")}</button>` : ""}${canVoid ? `<button class="mini-button danger" data-action="request-void" data-id="${sale.id}" title="Request void">${I("close")}</button>` : ""}</div></td></tr>`;
          })
          .join("")
      : `<tr><td colspan="8">${emptyState("No sales found", "Try another status or complete a new sale.", "receipt")}</td></tr>`;
    $("#appView").innerHTML = `<div class="page-stack phase-page sales-phase-page">
      <section class="operations-subhero sales-operations-hero"><div><span class="eyebrow">Receipts and customer care</span><h2>Every transaction, ready to review.</h2><p>Find a receipt, share it professionally, or start a controlled return without losing the audit trail.</p><div class="operations-hero-actions"><button class="button button-primary" data-view="pos">${I("plus")}New sale</button><button class="button button-outline" data-action="export-sales">${I("download")}Export sales</button></div></div><aside><div class="operations-subhero-stat"><span>Net after refunds</span><strong>${formatMoney(grossSales - returns)}</strong><small>${state.sales.length} receipts stored on this device</small></div><button class="operations-status-pill ${pendingCount ? "attention" : "ready"}" data-action="${pendingCount ? "view-approval" : "open-approval-settings"}" ${pendingCount ? `data-id="${esc(approvals.find((approval) => approval.status === "pending")?.id || "")}"` : ""}><span>${I(pendingCount ? "lock" : "check")}</span><span><strong>${pendingCount ? `${pendingCount} approval${pendingCount === 1 ? "" : "s"} waiting` : "Approval queue clear"}</strong><small>${state.business.approvalPinHash ? "Manager PIN is active" : "Set a manager PIN in Settings"}</small></span>${I("arrowRight")}</button></aside></section>
      <section class="operation-metric-strip" aria-label="Sales summary">${operationMetric("Gross sales", formatMoney(grossSales), "Excludes voided receipts", "money", "success")}${operationMetric("Approved refunds", formatMoney(returns), `${state.returns.length} processed return${state.returns.length === 1 ? "" : "s"}`, "return", returns ? "warning" : "success")}${operationMetric("Pending approvals", pendingCount, "Returns and voids awaiting review", "lock", pendingCount ? "warning" : "success")}${operationMetric("Receipts", state.sales.length, "Stored offline on this device", "receipt", "info")}</section>
      <section class="panel sales-browser-panel"><div class="sales-browser-head"><div><span class="eyebrow">Transaction history</span><h2>Find a sale or receipt</h2></div><div class="sales-search-actions"><div class="search-box">${I("search")}<input data-filter="sales" value="${esc(state.filters.sales)}" placeholder="Receipt, customer or payment"></div><button class="icon-button" data-action="export-sales" aria-label="Export sales">${I("download")}</button></div></div><div class="operations-segmented" role="tablist" aria-label="Sale status">${statusTabs.map(([value, label, count]) => `<button role="tab" aria-selected="${statusFilter === value}" class="${statusFilter === value ? "active" : ""}" data-action="sales-status" data-id="${value}"><span>${label}</span><strong>${count}</strong></button>`).join("")}</div><div class="phase-desktop-only table-wrap"><table class="data-table"><thead><tr><th>Receipt</th><th>Date</th><th>Customer</th><th>Payment</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>${salesTableRows}</tbody></table></div><div class="phase-mobile-only transaction-card-list">${sales.length ? sales.map((sale) => transactionCard(sale)).join("") : emptyState("No sales found", "Try another status or complete a new sale.", "receipt")}</div></section>
      <section class="panel approval-panel phase-approval-panel"><div class="panel-header"><div><h2>Return and void approvals</h2><p>Every decision records the requester, reviewer, time and reason</p></div>${state.business.approvalPinHash ? '<span class="badge success">Manager PIN active</span>' : '<button class="button button-warning" data-view="settings">Set manager PIN</button>'}</div><div class="phase-desktop-only table-wrap"><table class="data-table"><thead><tr><th>Request</th><th>Receipt</th><th>Type</th><th>Amount</th><th>Requested by</th><th>Status</th><th></th></tr></thead><tbody>${approvals.length ? approvals.slice(0, 12).map((approval) => `<tr><td><div class="cell-copy"><strong>${esc(approval.approvalNo)}</strong><span>${formatDateTime(approval.requestedAt)}</span></div></td><td>${esc(approval.receiptNo)}</td><td><strong>${esc(approval.type)}</strong><span class="table-subtext">${esc(approval.reason || "No reason")}</span></td><td><strong>${formatMoney(approval.amount)}</strong></td><td>${esc(approval.requestedBy || "Unknown")}</td><td>${statusBadge(approval.status)}</td><td><div class="row-actions"><button class="mini-button" data-action="view-approval" data-id="${esc(approval.id)}" title="View approval record">${I("eye")}</button>${approval.status === "pending" ? `<button class="mini-button success" data-action="review-approval" data-decision="approve" data-id="${esc(approval.id)}" title="Approve">${I("check")}</button><button class="mini-button danger" data-action="review-approval" data-decision="reject" data-id="${esc(approval.id)}" title="Reject">${I("close")}</button>` : ""}</div></td></tr>`).join("") : `<tr><td colspan="7">${emptyState("No approval requests", "Return and void requests will appear here for manager review.", "lock")}</td></tr>`}</tbody></table></div><div class="phase-mobile-only approval-queue-list">${approvals.length ? approvals.slice(0, 12).map(approvalQueueCard).join("") : emptyState("No approval requests", "Return and void requests will appear here for manager review.", "lock")}</div></section>
      <button class="mobile-sticky-primary" data-view="pos">${I("plus")}<span>New sale</span></button>
    </div>`;
  }

  function alertCategoryLabel(category) {
    return (
      {
        inventory: "Inventory",
        expiry: "Expiry",
        approvals: "Approvals",
        purchasing: "Purchasing",
        credit: "Customer credit",
        data: "Data protection",
        expenses: "Expenses",
      }[category] || category
    );
  }

  function renderAlerts() {
    const allAlerts = systemAlerts();
    const query = state.filters.alerts.toLowerCase();
    const alerts = allAlerts.filter((alert) => {
      const status = alertDisplayStatus(alert);
      return (
        (!query ||
          [alert.title, alert.message, alertCategoryLabel(alert.category)].some(
            (value) => String(value || "").toLowerCase().includes(query),
          )) &&
        (state.alertSeverityFilter === "all" ||
          alert.severity === state.alertSeverityFilter) &&
        (state.alertCategoryFilter === "all" ||
          alert.category === state.alertCategoryFilter) &&
        (state.alertStatusFilter === "all" || status === state.alertStatusFilter)
      );
    });
    const open = allAlerts.filter(
      (alert) => alertDisplayStatus(alert) === "open",
    );
    const critical = open.filter((alert) => alert.severity === "critical");
    const acknowledged = allAlerts.filter(
      (alert) => alertDisplayStatus(alert) === "acknowledged",
    );
    const snoozed = allAlerts.filter(
      (alert) => alertDisplayStatus(alert) === "snoozed",
    );
    const categories = [...new Set(allAlerts.map((alert) => alert.category))];
    $("#appView").innerHTML = `<div class="page-stack phase-page alerts-page">
      <section class="alerts-hero"><div><span class="eyebrow">Operational intelligence</span><h2>Focus on what needs action now.</h2><p>Alerts are generated from live stock, expiry, approval, purchasing, credit, expense and backup records. They clear automatically when the underlying issue is resolved.</p></div><div class="alerts-hero-score"><span>Open attention items</span><strong>${open.length}</strong><small>${critical.length} critical</small></div></section>
      <section class="operation-metric-strip">${operationMetric("Open alerts", open.length, "Unacknowledged and ready for action", "bell", open.length ? "warning" : "success")}${operationMetric("Critical", critical.length, "High-priority operational risks", "warning", critical.length ? "warning" : "success")}${operationMetric("Acknowledged", acknowledged.length, "Reviewed while the condition remains", "check", "info")}${operationMetric("Snoozed", snoozed.length, "Temporarily hidden from the active count", "calendar", "info")}</section>
      <div class="page-toolbar"><div class="toolbar-title"><h2>Alerts inbox</h2><p>Acknowledging an alert records attention; it does not change stock, payments or approvals.</p></div><div class="toolbar-actions"><button class="button button-outline" data-action="acknowledge-all-alerts" ${open.length ? "" : "disabled"}>${I("check")}Acknowledge all</button><button class="button button-primary" data-action="open-alert-settings">${I("settings")}Alert settings</button></div></div>
      <section class="panel"><div class="panel-header alert-filter-bar"><div class="search-box">${I("search")}<input data-filter="alerts" value="${esc(state.filters.alerts)}" placeholder="Search alerts"></div><select class="select-control" id="alertSeverityFilter"><option value="all">All priorities</option><option value="critical" ${state.alertSeverityFilter === "critical" ? "selected" : ""}>Critical</option><option value="warning" ${state.alertSeverityFilter === "warning" ? "selected" : ""}>Warning</option></select><select class="select-control" id="alertCategoryFilter"><option value="all">All categories</option>${categories.map((category) => `<option value="${category}" ${state.alertCategoryFilter === category ? "selected" : ""}>${esc(alertCategoryLabel(category))}</option>`).join("")}</select><select class="select-control" id="alertStatusFilter"><option value="open" ${state.alertStatusFilter === "open" ? "selected" : ""}>Open</option><option value="acknowledged" ${state.alertStatusFilter === "acknowledged" ? "selected" : ""}>Acknowledged</option><option value="snoozed" ${state.alertStatusFilter === "snoozed" ? "selected" : ""}>Snoozed</option><option value="all" ${state.alertStatusFilter === "all" ? "selected" : ""}>All states</option></select></div>
        ${alerts.length ? `<div class="alert-list">${alerts.map((alert) => {
          const status = alertDisplayStatus(alert);
          const stateRecord = alertStateFor(alert.id);
          return `<article class="alert-item ${alert.severity} ${status}"><div class="alert-priority-icon">${I(alert.severity === "critical" ? "warning" : "bell")}</div><div class="alert-item-copy"><div class="alert-item-meta"><span class="badge ${alert.severity === "critical" ? "danger" : "warning"}">${esc(alert.severity)}</span><span>${esc(alertCategoryLabel(alert.category))}</span><span>${formatDateTime(alert.createdAt)}</span></div><h3>${esc(alert.title)}</h3><p>${esc(alert.message)}</p>${status === "snoozed" ? `<small>Snoozed until ${formatDateTime(stateRecord?.snoozedUntil)}</small>` : status === "acknowledged" ? `<small>Acknowledged ${formatDateTime(stateRecord?.acknowledgedAt)}</small>` : ""}</div><div class="alert-item-actions"><button class="button button-outline" data-action="open-alert-target" data-id="${esc(alert.id)}">Open</button>${status === "open" ? `<button class="mini-button" data-action="snooze-alert" data-id="${esc(alert.id)}" title="Snooze">${I("calendar")}</button><button class="mini-button success" data-action="acknowledge-alert" data-id="${esc(alert.id)}" title="Acknowledge">${I("check")}</button>` : `<button class="button button-outline" data-action="reopen-alert" data-id="${esc(alert.id)}">Reopen</button>`}</div></article>`;
        }).join("")}</div>` : emptyState("No alerts match these filters", allAlerts.length ? "Change the priority, category or status filters." : "Your current operating records do not require attention.", "check")}
      </section>
    </div>`;
  }

  async function setAlertState(id, updates) {
    const previous = alertStateFor(id) || { id };
    await DB.put("alertStates", {
      ...previous,
      ...updates,
      id,
      updatedAt: nowISO(),
    });
    await refresh("alerts");
  }

  async function acknowledgeAlert(id) {
    await setAlertState(id, {
      status: "acknowledged",
      acknowledgedAt: nowISO(),
      acknowledgedBy: currentOperator(),
      snoozedUntil: "",
    });
    toast("Alert acknowledged", "It remains available until the issue is resolved.", "success");
  }

  async function snoozeAlert(id) {
    const hours = clamp(num(state.business.alertDefaultSnoozeHours) || 24, 1, 168);
    await setAlertState(id, {
      status: "snoozed",
      acknowledgedAt: "",
      snoozedUntil: new Date(Date.now() + hours * 3600000).toISOString(),
    });
    toast("Alert snoozed", `It will return in ${hours} hour(s) if still active.`, "success");
  }

  async function reopenAlert(id) {
    await setAlertState(id, {
      status: "open",
      acknowledgedAt: "",
      acknowledgedBy: "",
      snoozedUntil: "",
    });
  }

  async function acknowledgeAllAlerts() {
    const timestamp = nowISO();
    const records = activeSystemAlerts().map((alert) => ({
      ...(alertStateFor(alert.id) || {}),
      id: alert.id,
      status: "acknowledged",
      acknowledgedAt: timestamp,
      acknowledgedBy: currentOperator(),
      snoozedUntil: "",
      updatedAt: timestamp,
    }));
    if (!records.length) return;
    await DB.bulkPut("alertStates", records);
    await refresh("alerts");
    toast("Alerts acknowledged", `${records.length} alert(s) marked as reviewed.`, "success");
  }

  function openAlertTarget(id) {
    const alert = systemAlerts().find((item) => item.id === id);
    if (!alert) return;
    if (alert.category === "data") state.settingsSection = "data";
    navigate(alert.view || "dashboard");
    if (alert.category === "expenses" && alert.referenceId)
      setTimeout(() => openExpenseDetails(alert.referenceId), 0);
  }

  function renderExpenses() {
    const query = state.filters.expenses.toLowerCase();
    const expenses = state.expenses.filter((expense) => {
      const status = expenseDisplayStatus(expense);
      const periodMatches =
        state.expensePeriodFilter === "all" ||
        isInPeriod(expense.date || expense.createdAt, state.expensePeriodFilter);
      return (
        periodMatches &&
        (state.expenseStatusFilter === "all" ||
          status === state.expenseStatusFilter) &&
        (state.expenseCategoryFilter === "all" ||
          expense.category === state.expenseCategoryFilter) &&
        (!query ||
          [
            expense.expenseNo,
            expense.vendor,
            expense.reference,
            expense.description,
            expense.category,
            paymentLabel(expense.paymentMethod),
          ].some((value) =>
            String(value || "").toLowerCase().includes(query),
          ))
      );
    });
    const recognized = state.expenses.filter(isRecognizedExpense);
    const month = recognized
      .filter((expense) => isInPeriod(expense.date || expense.createdAt, "month"))
      .reduce((sum, expense) => sum + num(expense.amount), 0);
    const outstanding = recognized
      .filter((expense) => expense.paymentStatus !== "paid")
      .reduce((sum, expense) => sum + num(expense.amount), 0);
    const pendingApprovals = state.approvalRequests.filter(
      (request) => request.type === "expense" && request.status === "pending",
    );
    const overdue = recognized.filter(
      (expense) => expenseDisplayStatus(expense) === "overdue",
    );
    const categoryMap = expenses
      .filter(isRecognizedExpense)
      .reduce((map, expense) => {
        map.set(expense.category, (map.get(expense.category) || 0) + num(expense.amount));
        return map;
      }, new Map());
    const maxCategory = Math.max(...categoryMap.values(), 1);
    const approvalHistory = state.approvalRequests
      .filter((request) => request.type === "expense")
      .slice(0, 8);
    $("#appView").innerHTML = `<div class="page-stack phase-page expenses-page">
      <section class="expense-hero"><div><span class="eyebrow">Financial control</span><h2>Know where every operating shilling goes.</h2><p>Capture evidence, schedule amounts due, control high-value approvals and keep paid expenses connected to the cash register.</p></div><button class="button hero-primary" data-action="new-expense">${I("plus")}Record expense</button></section>
      <section class="operation-metric-strip">${operationMetric("This month", formatMoney(month), "Approved operating costs", "wallet", "warning")}${operationMetric("Outstanding", formatMoney(outstanding), `${overdue.length} overdue expense${overdue.length === 1 ? "" : "s"}`, "calendar", outstanding ? "warning" : "success")}${operationMetric("Pending approval", pendingApprovals.length, "High-value expenses awaiting review", "lock", pendingApprovals.length ? "warning" : "success")}${operationMetric("Expense records", state.expenses.length, `${state.expenses.filter((expense) => expense.receiptData).length} with receipt evidence`, "list", "info")}</section>
      <div class="page-toolbar"><div class="toolbar-title"><h2>Expense ledger</h2><p>Filter operating costs by period, category and control status.</p></div><div class="toolbar-actions"><button class="button button-outline" data-action="export-expenses">${I("download")}Export CSV</button><button class="button button-primary" data-action="new-expense">${I("plus")}Add expense</button></div></div>
      <section class="expense-layout"><article class="panel expense-ledger-panel"><div class="panel-header expense-filter-bar"><div class="search-box">${I("search")}<input data-filter="expenses" value="${esc(state.filters.expenses)}" placeholder="Search number, vendor or description"></div><select class="select-control" id="expensePeriodFilter"><option value="month" ${state.expensePeriodFilter === "month" ? "selected" : ""}>This month</option><option value="today" ${state.expensePeriodFilter === "today" ? "selected" : ""}>Today</option><option value="7d" ${state.expensePeriodFilter === "7d" ? "selected" : ""}>Last 7 days</option><option value="year" ${state.expensePeriodFilter === "year" ? "selected" : ""}>This year</option><option value="all" ${state.expensePeriodFilter === "all" ? "selected" : ""}>All time</option></select><select class="select-control" id="expenseStatusFilter"><option value="all">All statuses</option>${["paid", "unpaid", "overdue", "pending-approval", "rejected", "voided"].map((status) => `<option value="${status}" ${state.expenseStatusFilter === status ? "selected" : ""}>${esc(status.replaceAll("-", " "))}</option>`).join("")}</select><select class="select-control" id="expenseCategoryFilter"><option value="all">All categories</option>${EXPENSE_CATEGORIES.map((category) => `<option ${state.expenseCategoryFilter === category ? "selected" : ""}>${esc(category)}</option>`).join("")}</select></div><div class="table-wrap mobile-cards"><table class="data-table expense-table"><thead><tr><th>Expense</th><th>Vendor</th><th>Date / due</th><th>Category</th><th>Payment</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>${expenses.length ? expenses.map((expense) => {
        const status = expenseDisplayStatus(expense);
        const approval = state.approvalRequests.find(
          (request) => request.expenseId === expense.id && request.status === "pending",
        );
        const canEdit =
          expense.paymentStatus !== "paid" &&
          !["pending", "rejected"].includes(expense.approvalStatus) &&
          expense.status !== "voided";
        const canPay =
          expense.paymentStatus !== "paid" &&
          !["pending", "rejected"].includes(expense.approvalStatus) &&
          expense.status !== "voided";
        const canDelete =
          expense.paymentStatus !== "paid" &&
          expense.approvalStatus === "not-required" &&
          expense.status !== "voided";
        const canVoid =
          !["voided", "rejected"].includes(expense.status) &&
          expense.approvalStatus !== "pending";
        return `<tr><td data-label="Expense"><div class="cell-copy"><strong>${esc(expense.expenseNo || "Legacy expense")}${expense.receiptData ? ` <span class="evidence-dot" title="Receipt attached">${I("image")}</span>` : ""}</strong><span>${esc(expense.description)}</span></div></td><td data-label="Vendor">${esc(expense.vendor || "—")}</td><td data-label="Date / due"><div class="cell-copy"><strong>${formatDate(expense.date)}</strong><span>${expense.dueDate ? `Due ${formatDate(expense.dueDate, { short: true })}` : "No due date"}</span></div></td><td data-label="Category"><span class="badge primary">${esc(expense.category)}</span></td><td data-label="Payment"><div class="cell-copy"><strong>${esc(paymentLabel(expense.paymentMethod))}</strong><span>${esc(expense.paymentStatus || "paid")}</span></div></td><td data-label="Total"><strong>${formatMoney(expense.amount)}</strong></td><td data-label="Status">${statusBadge(status)}</td><td data-label="Actions"><div class="row-actions"><button class="mini-button" data-action="view-expense" data-id="${expense.id}" title="View expense">${I("eye")}</button>${approval ? `<button class="mini-button success" data-action="review-approval" data-decision="approve" data-id="${approval.id}" title="Review approval">${I("lock")}</button>` : ""}${canPay ? `<button class="mini-button success" data-action="pay-expense" data-id="${expense.id}" title="Mark paid">${I("money")}</button>` : ""}${canEdit ? `<button class="mini-button" data-action="edit-expense" data-id="${expense.id}" title="Edit">${I("edit")}</button>` : ""}${canVoid ? `<button class="mini-button danger" data-action="void-expense" data-id="${expense.id}" title="Void record">${I("close")}</button>` : ""}${canDelete ? `<button class="mini-button danger" data-action="delete-expense" data-id="${expense.id}" title="Delete unpaid record">${I("trash")}</button>` : ""}</div></td></tr>`;
      }).join("") : `<tr><td colspan="8">${emptyState("No expenses match", "Change the filters or record a new operating expense.", "wallet")}</td></tr>`}</tbody></table></div></article>
        <aside class="expense-insights"><article class="panel"><div class="panel-header"><div><h2>Category allocation</h2><p>Approved expenses in the current filtered view</p></div></div>${categoryMap.size ? `<div class="progress-list">${[...categoryMap.entries()].sort((a, b) => b[1] - a[1]).map(([category, value]) => progressRow(category, value, maxCategory, formatMoney(value))).join("")}</div>` : emptyState("No category data", "Approved expenses will build this breakdown.", "chart")}</article><article class="panel"><div class="panel-header"><div><h2>Approval activity</h2><p>Recent high-value expense decisions</p></div></div>${approvalHistory.length ? `<div class="list-stack">${approvalHistory.map((approval) => `<button class="list-row expense-approval-row" data-action="view-approval" data-id="${approval.id}"><div class="list-main"><div class="list-icon">${I("lock")}</div><div class="list-copy"><strong>${esc(approval.approvalNo)}</strong><span>${esc(approval.reason || "Expense approval")}</span></div></div><div class="list-value">${statusBadge(approval.status)}<span>${formatMoney(approval.amount)}</span></div></button>`).join("")}</div>` : emptyState("No expense approvals", "High-value expenses will appear here when approval control is enabled.", "lock")}</article></aside>
      </section>
      <button class="mobile-sticky-primary" data-action="new-expense">${I("plus")}<span>Record expense</span></button>
    </div>`;
  }

  function sessionCashSummary(sessionId) {
    const movements = state.cashMovements.filter(
      (movement) => movement.sessionId === sessionId,
    );
    const byType = movements.reduce((acc, m) => {
      acc[m.type] = (acc[m.type] || 0) + num(m.amount);
      return acc;
    }, {});
    return {
      movements,
      expected: movements.reduce((s, m) => s + num(m.amount), 0),
      byType,
    };
  }

  function renderRegister() {
    const session = openSession();
    const summary = session ? sessionCashSummary(session.id) : null;
    const cashIn = session
      ? num(summary.byType.sale) +
        num(summary.byType["customer-payment"]) +
        num(summary.byType["cash-in"])
      : 0;
    const cashOut = session
      ? Math.abs(
          num(summary.byType.refund) +
            num(summary.byType.void) +
            num(summary.byType.purchase) +
            num(summary.byType["supplier-payment"]) +
            num(summary.byType.expense) +
            num(summary.byType["cash-out"]),
        )
      : 0;
    $("#appView").innerHTML = `<div class="page-stack phase-page register-phase-page">
      <section class="operations-subhero register-command-hero ${session ? "is-open" : "is-closed"}"><div><span class="eyebrow">Cash control</span><div class="register-command-title"><span class="register-command-icon">${I("register")}</span><div><h2>${session ? "Register is open" : "Open the register to begin"}</h2><p>${session ? `Started ${formatDateTime(session.openedAt)} by ${esc(session.cashier)}.` : "Start a controlled shift before accepting and reconciling physical cash."}</p></div></div><div class="operations-hero-actions">${session ? `<button class="button button-outline" data-action="cash-in">${I("arrowDown")}Cash in</button><button class="button button-outline" data-action="cash-out">${I("arrowUp")}Cash out</button><button class="button button-danger" data-action="close-register">${I("lock")}Close shift</button>` : `<button class="button button-primary" data-action="open-register">${I("register")}Open register</button><button class="button button-outline" data-view="pos">${I("cart")}Go to checkout</button>`}</div></div><aside class="register-balance-card"><span>${session ? "Expected drawer cash" : "Register status"}</span><strong>${session ? formatMoney(summary.expected) : "Closed"}</strong><small>${session ? `${summary.movements.length} recorded movement${summary.movements.length === 1 ? "" : "s"}` : "Cash reconciliation is not active"}</small><div class="register-shift-state ${session ? "ready" : "attention"}">${I(session ? "check" : "warning")}<span>${session ? "Shift protected and auditable" : "Cash sales will not reconcile"}</span></div></aside></section>
      <section class="operation-metric-strip" aria-label="Register summary">${operationMetric("Opening float", session ? formatMoney(session.openingFloat) : "—", session ? "Starting drawer amount" : "Open a shift to begin", "money", "info")}${operationMetric("Cash received", session ? formatMoney(cashIn) : "—", "Sales, payments and cash in", "arrowDown", "success")}${operationMetric("Cash removed", session ? formatMoney(cashOut) : "—", "Refunds, expenses and cash out", "arrowUp", cashOut ? "warning" : "success")}${operationMetric("Movements", session ? summary.movements.length : state.registerSessions.length, session ? "Current shift records" : "Previous shift records", "activity", "info")}</section>
      <section class="register-workspace-grid"><article class="panel register-composition-panel"><div class="panel-header"><div><h2>Cash composition</h2><p>${session ? "How the expected drawer balance was calculated" : "Open a register to activate live cash controls"}</p></div>${session ? '<span class="badge success">Live shift</span>' : '<span class="badge">Inactive</span>'}</div>${session ? `<div class="breakdown-list"><div class="breakdown-row"><span>Opening float</span><strong>${formatMoney(summary.byType["opening-float"] || 0)}</strong></div><div class="breakdown-row"><span>Cash sales</span><strong>${formatMoney(summary.byType.sale || 0)}</strong></div><div class="breakdown-row"><span>Customer payments</span><strong>${formatMoney(summary.byType["customer-payment"] || 0)}</strong></div><div class="breakdown-row"><span>Cash refunds and voids</span><strong>${formatMoney((summary.byType.refund || 0) + (summary.byType.void || 0))}</strong></div><div class="breakdown-row"><span>Purchases and supplier payments</span><strong>${formatMoney((summary.byType.purchase || 0) + (summary.byType["supplier-payment"] || 0))}</strong></div><div class="breakdown-row"><span>Expenses</span><strong>${formatMoney(summary.byType.expense || 0)}</strong></div><div class="breakdown-row"><span>Manual cash movements</span><strong>${formatMoney((summary.byType["cash-in"] || 0) + (summary.byType["cash-out"] || 0))}</strong></div><div class="breakdown-row total"><span>Expected drawer cash</span><strong>${formatMoney(summary.expected)}</strong></div></div>` : emptyState("No open session", "Open a register to begin cash reconciliation.", "register")}</article><article class="panel register-guidance-panel"><div class="panel-header"><div><h2>Shift controls</h2><p>Recommended register workflow</p></div></div><ol class="register-step-list"><li class="${session ? "complete" : "current"}"><span>${session ? I("check") : "1"}</span><div><strong>Open shift</strong><small>Record operator and opening float</small></div></li><li class="${session ? "current" : ""}"><span>2</span><div><strong>Operate and record</strong><small>Sales and cash movements update the drawer</small></div></li><li><span>3</span><div><strong>Count and close</strong><small>Compare physical cash with expected cash</small></div></li></ol>${session ? `<div class="register-control-grid"><button data-action="cash-in">${I("arrowDown")}<span><strong>Cash in</strong><small>Add money to drawer</small></span></button><button data-action="cash-out">${I("arrowUp")}<span><strong>Cash out</strong><small>Remove money with reason</small></span></button></div>` : `<button class="button button-primary button-full" data-action="open-register">${I("register")}Start controlled shift</button>`}</article></section>
      <section class="panel register-movements-panel"><div class="panel-header"><div><h2>${session ? "Current shift activity" : "Register session history"}</h2><p>${session ? "Every event affecting expected physical cash" : "Previous opening and closing records"}</p></div>${session ? `<span class="badge primary">${summary.movements.length} movements</span>` : `<span class="badge primary">${state.registerSessions.length} shifts</span>`}</div><div class="phase-desktop-only">${session ? cashMovementTable(summary.movements) : registerHistoryTable()}</div><div class="phase-mobile-only">${session ? cashMovementCards(summary.movements) : registerHistoryCards()}</div></section>
      <button class="mobile-sticky-primary ${session ? "danger" : ""}" data-action="${session ? "close-register" : "open-register"}">${I(session ? "lock" : "register")}<span>${session ? `Close shift · ${formatMoney(summary.expected)}` : "Open cash register"}</span></button>
    </div>`;
  }

  function cashMovementTable(movements) {
    return `<div class="table-wrap mobile-cards"><table class="data-table"><thead><tr><th>Time</th><th>Type</th><th>Reference</th><th>Note</th><th>Amount</th></tr></thead><tbody>${movements
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(
        (m) =>
          `<tr><td data-label="Time">${formatDateTime(m.createdAt)}</td><td data-label="Type"><span class="badge ${num(m.amount) >= 0 ? "success" : "danger"}">${esc(m.type)}</span></td><td data-label="Reference">${esc(m.referenceType || "manual")}</td><td data-label="Note">${esc(m.note || "—")}</td><td data-label="Amount"><strong>${num(m.amount) >= 0 ? "+ " : ""}${formatMoney(m.amount)}</strong></td></tr>`,
      )
      .join("")}</tbody></table></div>`;
  }
  function registerHistoryTable() {
    return `<div class="table-wrap mobile-cards"><table class="data-table"><thead><tr><th>Opened</th><th>Cashier</th><th>Opening</th><th>Expected</th><th>Actual</th><th>Difference</th><th>Status</th></tr></thead><tbody>${state.registerSessions.length ? state.registerSessions.map((s) => `<tr><td data-label="Opened">${formatDateTime(s.openedAt)}</td><td data-label="Cashier">${esc(s.cashier)}</td><td data-label="Opening">${formatMoney(s.openingFloat)}</td><td data-label="Expected">${formatMoney(s.expectedCash)}</td><td data-label="Actual">${formatMoney(s.actualCash)}</td><td data-label="Difference"><strong>${formatMoney(s.difference)}</strong></td><td data-label="Status">${statusBadge(s.status)}</td></tr>`).join("") : `<tr><td colspan="7">${emptyState("No register history", "Open and close a register to create shift records.", "register")}</td></tr>`}</tbody></table></div>`;
  }

  function reportData() {
    const sales = state.sales.filter(
      (s) => isInPeriod(s.createdAt) && s.status !== "voided",
    );
    const periodReturns = state.returns.filter((r) => isInPeriod(r.createdAt));
    const expenses = state.expenses.filter(
      (expense) =>
        isRecognizedExpense(expense) &&
        isInPeriod(expense.date || expense.createdAt),
    );
    const purchases = state.purchases.filter((p) =>
      isInPeriod(p.date || p.createdAt),
    );
    const grossSales = sales.reduce((s, x) => s + num(x.total), 0);
    const returns = periodReturns.reduce((s, x) => s + num(x.refundTotal), 0);
    const netSales = grossSales - returns;
    const cogs = sales.reduce(
      (s, x) =>
        s +
        (x.items || []).reduce(
          (a, i) =>
            a +
            num(i.costPrice) *
              Math.max(0, num(i.quantity) - num(i.returnedQty)),
          0,
        ),
      0,
    );
    const expenseTotal = expenses.reduce((s, x) => s + num(x.amount), 0);
    const grossProfit = netSales - cogs;
    const netProfit = grossProfit - expenseTotal;
    return {
      sales,
      periodReturns,
      expenses,
      purchases,
      grossSales,
      returns,
      netSales,
      cogs,
      expenseTotal,
      grossProfit,
      netProfit,
    };
  }

  function renderReports() {
    const data = reportData();
    const productMap = new Map();
    const paymentMap = new Map();
    const categoryMap = new Map();
    const expenseCategoryMap = new Map();
    data.expenses.forEach((expense) =>
      expenseCategoryMap.set(
        expense.category || "Other",
        (expenseCategoryMap.get(expense.category || "Other") || 0) +
          num(expense.amount),
      ),
    );
    data.sales.forEach((sale) => {
      (
        sale.payments || [{ method: sale.paymentMethod, amount: sale.total }]
      ).forEach((p) =>
        paymentMap.set(
          p.method,
          (paymentMap.get(p.method) || 0) + num(p.amount),
        ),
      );
      (sale.items || []).forEach((item) => {
        const netQuantity = Math.max(
          0,
          num(item.quantity) - num(item.returnedQty),
        );
        const unitNet = num(item.quantity)
          ? num(item.lineTotal || num(item.unitPrice) * num(item.quantity)) /
            num(item.quantity)
          : 0;
        const netRevenue = unitNet * netQuantity;
        const current = productMap.get(item.productId) || {
          name: item.name,
          qty: 0,
          revenue: 0,
        };
        current.qty += netQuantity;
        current.revenue += netRevenue;
        productMap.set(item.productId, current);
        const category = categoryName(
          state.products.find((p) => p.id === item.productId)?.categoryId,
        );
        categoryMap.set(
          category,
          (categoryMap.get(category) || 0) + netRevenue,
        );
      });
    });
    const topProducts = [...productMap.values()]
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8);
    const maxPay = Math.max(...paymentMap.values(), 1);
    const maxCat = Math.max(...categoryMap.values(), 1);
    const maxExpenseCategory = Math.max(...expenseCategoryMap.values(), 1);
    const inventoryCost = state.products.reduce(
      (s, p) => s + num(p.stock) * num(p.purchasePrice),
      0,
    );
    $("#appView").innerHTML = `<div class="page-stack phase-page reports-phase-page">
      ${workspaceHero({
        eyebrow: "Business intelligence",
        title: "Turn daily transactions into operating decisions.",
        description:
          "Review sales, profit, expenses, stock health and credit obligations using records stored on this device.",
        actions: `<button class="button button-primary" data-action="export-report">${I("download")}Export report</button><button class="button button-outline" data-view="dashboard">${I("dashboard")}Open command centre</button>`,
        spotlightLabel: "Estimated net profit",
        spotlightValue: formatMoney(data.netProfit),
        spotlightDetail: `${data.sales.length} completed receipt${data.sales.length === 1 ? "" : "s"} in the selected period`,
        iconName: "chart",
        tone: data.netProfit >= 0 ? "ready" : "attention",
      })}
      <div class="page-toolbar"><div class="toolbar-title"><h2>Business performance</h2><p>Financial estimates based on transactions stored on this device</p></div><div class="toolbar-actions"><select class="select-control" id="reportPeriod"><option value="today" ${state.reportPeriod === "today" ? "selected" : ""}>Today</option><option value="7d" ${state.reportPeriod === "7d" ? "selected" : ""}>Last 7 days</option><option value="30d" ${state.reportPeriod === "30d" ? "selected" : ""}>Last 30 days</option><option value="month" ${state.reportPeriod === "month" ? "selected" : ""}>This month</option><option value="year" ${state.reportPeriod === "year" ? "selected" : ""}>This year</option><option value="all" ${state.reportPeriod === "all" ? "selected" : ""}>All time</option></select><button class="button button-outline" data-action="export-report">${I("download")}Export report</button></div></div>
      <section class="operation-metric-strip">${operationMetric("Net sales", formatMoney(data.netSales), `${data.sales.length} completed receipts`, "money", "success")}${operationMetric("Gross profit", formatMoney(data.grossProfit), "Net sales less product cost", "chart", "info")}${operationMetric("Operating expenses", formatMoney(data.expenseTotal), `${data.expenses.length} expense entries`, "wallet", "warning")}${operationMetric("Net margin", data.netSales ? `${((data.netProfit / data.netSales) * 100).toFixed(1)}%` : "0.0%", "Estimated net profit divided by net sales", "activity", data.netProfit >= 0 ? "success" : "warning")}</section>
      <section class="report-grid">
        <article class="panel"><div class="panel-header"><div><h2>Top-selling products</h2><p>Ranked by quantity sold</p></div></div>${topProducts.length ? `<div class="ranking-list">${topProducts.map((p, index) => `<div class="ranking-row"><div class="rank">${index + 1}</div><div class="ranking-copy"><strong>${esc(p.name)}</strong><span>${num(p.qty)} units sold</span></div><div class="ranking-value">${formatMoney(p.revenue)}</div></div>`).join("")}</div>` : emptyState("No sales in period", "Change the report period or complete sales.", "chart")}</article>
        <article class="panel"><div class="panel-header"><div><h2>Payment methods</h2><p>Collected amount by payment channel</p></div></div>${
          paymentMap.size
            ? `<div class="progress-list">${[...paymentMap.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([method, value]) =>
                  progressRow(
                    paymentLabel(method),
                    value,
                    maxPay,
                    formatMoney(value),
                  ),
                )
                .join("")}</div>`
            : emptyState(
                "No payment data",
                "Payment distribution appears after sales.",
                "card",
              )
        }</article>
        <article class="panel"><div class="panel-header"><div><h2>Sales by category</h2><p>Revenue contribution by product category</p></div></div>${
          categoryMap.size
            ? `<div class="progress-list">${[...categoryMap.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([category, value]) =>
                  progressRow(category, value, maxCat, formatMoney(value)),
                )
                .join("")}</div>`
            : emptyState(
                "No category data",
                "Category performance appears after sales.",
                "tag",
              )
        }</article>
        <article class="panel"><div class="panel-header"><div><h2>Expenses by category</h2><p>Approved operating costs in the selected period</p></div><button class="text-button" data-view="expenses">Open expenses</button></div>${expenseCategoryMap.size ? `<div class="progress-list">${[...expenseCategoryMap.entries()].sort((a, b) => b[1] - a[1]).map(([category, value]) => progressRow(category, value, maxExpenseCategory, formatMoney(value))).join("")}</div>` : emptyState("No expense data", "Approved expenses will appear here.", "wallet")}</article>
        <article class="panel"><div class="panel-header"><div><h2>Profit statement</h2><p>Operational estimate for the selected period</p></div></div><div class="breakdown-list"><div class="breakdown-row"><span>Gross sales</span><strong>${formatMoney(data.grossSales)}</strong></div><div class="breakdown-row"><span>Returns</span><strong>− ${formatMoney(data.returns)}</strong></div><div class="breakdown-row"><span>Net sales</span><strong>${formatMoney(data.netSales)}</strong></div><div class="breakdown-row"><span>Cost of goods sold</span><strong>− ${formatMoney(data.cogs)}</strong></div><div class="breakdown-row"><span>Gross profit</span><strong>${formatMoney(data.grossProfit)}</strong></div><div class="breakdown-row"><span>Expenses</span><strong>− ${formatMoney(data.expenseTotal)}</strong></div><div class="breakdown-row total"><span>Estimated net profit</span><strong>${formatMoney(data.netProfit)}</strong></div></div></article>
        <article class="panel"><div class="panel-header"><div><h2>Inventory health</h2><p>Current stock position</p></div></div><div class="breakdown-list"><div class="breakdown-row"><span>Products</span><strong>${state.products.length}</strong></div><div class="breakdown-row"><span>Units in stock</span><strong>${state.products.reduce((s, p) => s + num(p.stock), 0)}</strong></div><div class="breakdown-row"><span>Low / out of stock</span><strong>${state.products.filter((p) => p.trackStock !== false && num(p.stock) <= num(p.reorderLevel)).length}</strong></div><div class="breakdown-row"><span>Cost valuation</span><strong>${formatMoney(inventoryCost)}</strong></div><div class="breakdown-row total"><span>Retail valuation</span><strong>${formatMoney(state.products.reduce((s, p) => s + num(p.stock) * num(p.sellingPrice), 0))}</strong></div></div></article>
        <article class="panel"><div class="panel-header"><div><h2>Business obligations</h2><p>Credit and supplier balances</p></div></div><div class="breakdown-list"><div class="breakdown-row"><span>Customer credit receivable</span><strong>${formatMoney(state.customers.reduce((s, c) => s + num(c.balance), 0))}</strong></div><div class="breakdown-row"><span>Supplier accounts payable</span><strong>${formatMoney(state.suppliers.reduce((s, p) => s + num(p.balance), 0))}</strong></div><div class="breakdown-row"><span>Purchase value in period</span><strong>${formatMoney(data.purchases.reduce((s, p) => s + num(p.total), 0))}</strong></div><div class="breakdown-row total"><span>Net credit position</span><strong>${formatMoney(state.customers.reduce((s, c) => s + num(c.balance), 0) - state.suppliers.reduce((s, p) => s + num(p.balance), 0))}</strong></div></div></article>
      </section>
    </div>`;
  }

  function progressRow(label, value, max, display) {
    return `<div class="progress-row"><div class="progress-label"><span>${esc(label)}</span><strong>${display}</strong></div><div class="progress-track"><div class="progress-fill" style="width:${Math.max(2, (value / max) * 100)}%"></div></div></div>`;
  }

  function settingsToggle(name, title, description, checked) {
    return `<label class="settings-toggle"><span class="settings-toggle-copy"><strong>${esc(title)}</strong><small>${esc(description)}</small></span><span class="toggle-control"><input type="checkbox" name="${name}" ${checked ? "checked" : ""}><span aria-hidden="true"></span></span></label>`;
  }

  function settingsNavButton(id, iconName, title, description) {
    return `<button class="settings-nav-item ${state.settingsSection === id ? "active" : ""}" data-action="settings-section" data-id="${id}">${I(iconName)}<span><strong>${esc(title)}</strong><small>${esc(description)}</small></span>${I("arrowRight")}</button>`;
  }

  function settingsSectionContent(installed) {
    const section = state.settingsSection;
    if (section === "appearance")
      return `<article class="panel settings-content-card"><div class="settings-content-heading"><span class="settings-heading-icon">${I("image")}</span><div><span class="eyebrow">Brand and accessibility</span><h2>App colours and display</h2><p>Personalize the complete POS interface while keeping controls readable and consistent.</p></div></div><form class="settings-form" data-form="appearance-settings"><div class="theme-preset-grid">${Object.entries(THEME_PRESETS).map(([id, preset]) => `<button type="button" class="theme-preset ${state.business.appThemePreset === id ? "active" : ""}" data-action="theme-preset" data-id="${id}" style="--preset-primary:${preset.primary};--preset-highlight:${preset.highlight};--preset-canvas:${preset.canvas}"><span><i></i><i></i><i></i></span><strong>${esc(id[0].toUpperCase() + id.slice(1))}</strong></button>`).join("")}<button type="button" class="theme-preset ${state.business.appThemePreset === "custom" ? "active" : ""}" data-action="theme-preset" data-id="custom"><span class="custom-theme-mark">${I("settings")}</span><strong>Custom</strong></button></div><input type="hidden" name="appThemePreset" value="${esc(state.business.appThemePreset || "emerald")}"><div class="appearance-layout"><div><div class="settings-field-grid"><div class="field colour-field"><label>Primary app colour</label><input type="color" name="appPrimaryColor" value="${esc(state.business.appPrimaryColor || THEME_PRESETS.emerald.primary)}"><small>Buttons, active navigation and sale controls.</small></div><div class="field colour-field"><label>Highlight colour</label><input type="color" name="appHighlightColor" value="${esc(state.business.appHighlightColor || THEME_PRESETS.emerald.highlight)}"><small>Warnings, emphasis and supporting accents.</small></div><div class="field colour-field"><label>Background colour</label><input type="color" name="appCanvasColor" value="${esc(state.business.appCanvasColor || THEME_PRESETS.emerald.canvas)}"><small>Main workspace canvas and splash backdrop.</small></div><div class="field"><label>Text size</label><select name="textScale"><option value="standard" ${state.business.textScale === "standard" ? "selected" : ""}>Standard</option><option value="large" ${state.business.textScale === "large" ? "selected" : ""}>Large</option><option value="extra-large" ${state.business.textScale === "extra-large" ? "selected" : ""}>Extra large</option></select></div></div><div class="settings-toggle-list">${settingsToggle("highContrast", "High-contrast controls", "Strengthens borders and text contrast throughout the app.", settingEnabled("highContrast", false))}${settingsToggle("reducedMotion", "Reduce motion", "Disables non-essential transitions and splash animation.", settingEnabled("reducedMotion", false))}${settingsToggle("largeTouchTargets", "Larger touch targets", "Uses roomier controls for easier one-handed operation.", settingEnabled("largeTouchTargets", false))}</div></div><aside class="theme-live-preview" id="themeLivePreview"><span>Live preview</span><div><small>New sale</small><strong>${esc(state.business.businessName || "MTECH Retail Shop")}</strong><button type="button">Charge ${formatMoney(14500)}</button></div><p>Selected colours also update the install splash and phone browser theme.</p></aside></div><div class="settings-save-bar"><span>Changes preview instantly and remain on this device.</span><button class="button button-primary" type="submit">${I("save")}Save appearance</button></div></form></article>`;
    if (section === "checkout")
      return `<article class="panel settings-content-card"><div class="settings-content-heading"><span class="settings-heading-icon">${I("cart")}</span><div><span class="eyebrow">Sales workflow</span><h2>Checkout preferences</h2><p>Choose how the sales screen behaves during daily service.</p></div></div><form class="settings-form" data-form="checkout-settings"><div class="settings-field-grid"><div class="field"><label>Default payment</label><select name="defaultPaymentMethod"><option value="cash" ${state.business.defaultPaymentMethod === "cash" ? "selected" : ""}>Cash</option><option value="mobile-money" ${state.business.defaultPaymentMethod === "mobile-money" ? "selected" : ""}>Mobile money</option><option value="card" ${state.business.defaultPaymentMethod === "card" ? "selected" : ""}>Card</option><option value="none" ${state.business.defaultPaymentMethod === "none" ? "selected" : ""}>Do not prefill</option></select><small>Prefills the full amount while still allowing split payment.</small></div><div class="field"><label>After completing a sale</label><select name="saleCompletionBehavior"><option value="receipt" ${state.business.saleCompletionBehavior !== "continue" ? "selected" : ""}>Open receipt actions</option><option value="continue" ${state.business.saleCompletionBehavior === "continue" ? "selected" : ""}>Return to a fresh cart</option></select><small>Receipts remain available from Sales either way.</small></div><div class="field"><label>Default product catalogue layout</label><select name="productView"><option value="grid" ${state.business.productView === "grid" ? "selected" : ""}>Image grid</option><option value="table" ${state.business.productView !== "grid" ? "selected" : ""}>Detailed table</option></select></div><div class="field"><label>Interface spacing</label><select name="interfaceDensity"><option value="comfortable" ${state.business.interfaceDensity !== "compact" ? "selected" : ""}>Comfortable</option><option value="compact" ${state.business.interfaceDensity === "compact" ? "selected" : ""}>Compact</option></select></div><div class="field"><label>Checkout sound</label><div class="field-action-row"><select name="checkoutSound"><option value="success" ${state.business.checkoutSound === "success" ? "selected" : ""}>Success chime</option><option value="bright" ${state.business.checkoutSound === "bright" ? "selected" : ""}>Bright confirmation</option><option value="gentle" ${state.business.checkoutSound === "gentle" ? "selected" : ""}>Gentle tone</option></select><button class="button button-outline" type="button" data-action="preview-checkout-sound">${I("play")}Preview</button></div></div><div class="field"><label>Sound volume · ${clamp(num(state.business.soundVolume) || 55, 0, 100)}%</label><input type="range" name="soundVolume" min="0" max="100" step="5" value="${clamp(num(state.business.soundVolume) || 55, 0, 100)}"></div></div><div class="settings-toggle-list">${settingsToggle("requireOpenRegister", "Require an open register for cash sales", "Blocks cash checkout until a register shift has been opened.", settingEnabled("requireOpenRegister", false))}${settingsToggle("confirmClearCart", "Confirm before clearing a cart", "Prevents accidental removal of every sale line.", settingEnabled("confirmClearCart", true))}${settingsToggle("hapticFeedback", "Vibration feedback", "Provides a short device vibration when products are added or scanned.", settingEnabled("hapticFeedback", true))}${settingsToggle("scanSound", "Barcode scan sound", "Plays a short confirmation tone after a successful scan.", settingEnabled("scanSound", true))}${settingsToggle("checkoutSoundEnabled", "Checkout completion sound", "Plays the selected confirmation after a sale is safely saved.", settingEnabled("checkoutSoundEnabled", true))}${settingsToggle("showDashboardHero", "Show dashboard welcome panel", "Keeps the monthly snapshot and quick-start actions on the dashboard.", settingEnabled("showDashboardHero", true))}</div><div class="settings-save-bar"><span>Mobile browsers enable sound after the first screen tap.</span><button class="button button-primary" type="submit">${I("save")}Save checkout settings</button></div></form></article>`;
    if (section === "receipts")
      return `<article class="panel settings-content-card"><div class="settings-content-heading"><span class="settings-heading-icon">${I("receipt")}</span><div><span class="eyebrow">Customer documents</span><h2>Receipt design</h2><p>Control branding and the information customers receive.</p></div></div><div class="settings-split"><form class="settings-form" data-form="receipt-settings"><div class="settings-field-grid"><div class="field"><label>Paper width</label><select name="receiptPaper"><option value="80mm" ${state.business.receiptPaper !== "58mm" ? "selected" : ""}>80mm thermal</option><option value="58mm" ${state.business.receiptPaper === "58mm" ? "selected" : ""}>58mm thermal</option></select></div><div class="field"><label>Brand colour</label><input type="color" name="receiptAccent" value="${esc(state.business.receiptAccent || "#0f766e")}"></div><div class="field full"><label>Receipt footer</label><textarea name="receiptFooter" placeholder="Thank customers or add a policy note">${esc(state.business.receiptFooter || "")}</textarea></div></div><div class="settings-toggle-list">${settingsToggle("showReceiptCashier", "Show cashier name", "Adds the operator responsible for the transaction.", settingEnabled("showReceiptCashier", true))}${settingsToggle("showReceiptSku", "Show product SKU", "Prints the SKU or barcode beneath each receipt line.", settingEnabled("showReceiptSku", true))}${settingsToggle("showReceiptTax", "Show tax breakdown", "Displays the tax line even when the current tax amount is zero.", settingEnabled("showReceiptTax", true))}</div><div class="settings-save-bar"><span>Applies to print, PNG download and sharing.</span><button class="button button-primary" type="submit">${I("save")}Save receipt settings</button></div></form><aside class="settings-receipt-wrap"><span class="eyebrow">Live preview</span><div id="settingsReceiptPreview" class="receipt settings-receipt-preview ${state.business.receiptPaper === "58mm" ? "receipt-58mm" : ""}" style="--receipt-accent:${esc(state.business.receiptAccent || "#0f766e")}"><div class="receipt-brand-bar"></div><div class="receipt-center"><h3>${esc(state.business.businessName || "Retail Shop")}</h3><p>${esc(state.business.address || "Business address")}</p></div><div class="receipt-rule"></div><div class="receipt-row"><span>Receipt</span><strong>SALE-000123</strong></div><div class="receipt-row" data-receipt-preview="cashier" ${settingEnabled("showReceiptCashier", true) ? "" : "hidden"}><span>Cashier</span><span>Owner</span></div><div class="receipt-rule"></div><div class="receipt-item-name">Sample product</div><div class="receipt-code" data-receipt-preview="sku" ${settingEnabled("showReceiptSku", true) ? "" : "hidden"}>SKU-001</div><div class="receipt-row receipt-meta"><span>1 × ${formatMoney(2500)}</span><span>${formatMoney(2500)}</span></div><div class="receipt-row" data-receipt-preview="tax" ${settingEnabled("showReceiptTax", true) ? "" : "hidden"}><span>Tax</span><span>${formatMoney(0)}</span></div><div class="receipt-row total"><span>TOTAL</span><span>${formatMoney(2500)}</span></div><div class="receipt-rule"></div><div class="receipt-center"><p id="settingsReceiptFooter">${esc(state.business.receiptFooter || "Thank you.")}</p></div></div></aside></div></article>`;
    if (section === "inventory")
      return `<article class="panel settings-content-card"><div class="settings-content-heading"><span class="settings-heading-icon">${I("boxes")}</span><div><span class="eyebrow">Stock policy</span><h2>Inventory controls</h2><p>Set warning windows and decide how strict checkout should be.</p></div></div><form class="settings-form" data-form="inventory-settings"><div class="inventory-settings-summary"><div><span>${I("warning")} Products below reorder level</span><strong>${state.products.filter((product) => product.active !== false && product.trackStock !== false && num(product.stock) <= num(product.reorderLevel)).length}</strong></div><div><span>${I("calendar")} Products with expiry dates</span><strong>${state.products.filter((product) => product.expiryDate).length}</strong></div><div><span>${I("boxes")} Tracked products</span><strong>${state.products.filter((product) => product.trackStock !== false).length}</strong></div></div><div class="settings-field-grid"><div class="field"><label>Expiry warning window (days)</label><input type="number" name="expiryWarningDays" min="1" max="365" step="1" value="${clamp(num(state.business.expiryWarningDays) || 30, 1, 365)}"><small>Products inside this window appear as expiring soon.</small></div></div><div class="settings-toggle-list">${settingsToggle("lowStockEnabled", "Dashboard low-stock alerts", "Shows products at or below their reorder level on the dashboard.", settingEnabled("lowStockEnabled", true))}${settingsToggle("allowNegativeStock", "Allow sales below zero stock", "Lets checkout continue for oversold items and records a negative balance. Use with care.", settingEnabled("allowNegativeStock", false))}</div><div class="notice warning settings-risk-note">${I("warning")}<div><strong>Negative stock is an operational exception.</strong><br>When enabled, the sale and stock movement remain in the audit history so the balance can be corrected later.</div></div><div class="settings-save-bar"><span>Product-specific reorder levels remain in each product record.</span><button class="button button-primary" type="submit">${I("save")}Save inventory settings</button></div></form></article>`;
    if (section === "alerts")
      return `<article class="panel settings-content-card"><div class="settings-content-heading"><span class="settings-heading-icon">${I("bell")}</span><div><span class="eyebrow">Operational attention</span><h2>Alerts and expense controls</h2><p>Choose which risks enter the alerts centre and how the device gets your attention.</p></div></div><form class="settings-form" data-form="alerts-settings"><div class="inventory-settings-summary"><div><span>${I("bell")} Open alerts</span><strong>${activeSystemAlerts().length}</strong></div><div><span>${I("lock")} Pending approvals</span><strong>${state.approvalRequests.filter((request) => request.status === "pending").length}</strong></div><div><span>${I("wallet")} Unpaid expenses</span><strong>${state.expenses.filter((expense) => isRecognizedExpense(expense) && expense.paymentStatus !== "paid").length}</strong></div></div><div class="settings-field-grid"><div class="field"><label>Default alert snooze (hours)</label><input type="number" name="alertDefaultSnoozeHours" min="1" max="168" step="1" value="${clamp(num(state.business.alertDefaultSnoozeHours) || 24, 1, 168)}"><small>Snoozed alerts return automatically if the issue remains.</small></div><div class="field"><label>Expense approval threshold</label><input type="number" name="expenseApprovalThreshold" min="0" step="1000" value="${Math.max(0, num(state.business.expenseApprovalThreshold))}"><small>Expenses at or above this value enter the manager queue.</small></div><div class="field"><label>Alert sound</label><div class="field-action-row"><select name="alertSound"><option value="gentle" ${state.business.alertSound === "gentle" ? "selected" : ""}>Gentle notice</option><option value="bright" ${state.business.alertSound === "bright" ? "selected" : ""}>Bright notice</option><option value="urgent" ${state.business.alertSound === "urgent" ? "selected" : ""}>Urgent warning</option></select><button class="button button-outline" type="button" data-action="preview-alert-sound">${I("play")}Preview</button></div></div><div class="field"><label>Sound cooldown (minutes)</label><input type="number" name="alertSoundCooldownMinutes" min="1" max="1440" step="1" value="${clamp(num(state.business.alertSoundCooldownMinutes) || 30, 1, 1440)}"><small>Prevents repeated tones for the same active risk.</small></div></div><div class="settings-toggle-list">${settingsToggle("alertSoundEnabled", "Operational alert sound", "Plays the selected tone only for newly detected alerts and respects the cooldown.", settingEnabled("alertSoundEnabled", true))}${settingsToggle("alertExpiryEnabled", "Product expiry alerts", "Warns when a dated product expires or enters the configured warning window.", settingEnabled("alertExpiryEnabled", true))}${settingsToggle("alertApprovalEnabled", "Approval queue alerts", "Surfaces pending returns, voids and controlled expenses.", settingEnabled("alertApprovalEnabled", true))}${settingsToggle("alertPurchaseEnabled", "Overdue purchase-order alerts", "Flags orders that pass their expected delivery date.", settingEnabled("alertPurchaseEnabled", true))}${settingsToggle("alertCreditEnabled", "Customer credit-limit alerts", "Flags customer balances above their configured credit limit.", settingEnabled("alertCreditEnabled", true))}${settingsToggle("alertExpenseDueEnabled", "Due and overdue expense alerts", "Highlights unpaid operating costs when their due date arrives.", settingEnabled("alertExpenseDueEnabled", true))}${settingsToggle("alertBackupEnabled", "Backup health alerts", "Uses the backup reminder interval to protect local records.", settingEnabled("alertBackupEnabled", true))}${settingsToggle("expenseApprovalEnabled", "Require approval for high-value expenses", "Prevents qualifying expenses from affecting cash or profit until a manager approves them.", settingEnabled("expenseApprovalEnabled", false))}${settingsToggle("requireExpenseReceipt", "Require receipt evidence for expenses", "Blocks expense saving until an image of the receipt, bill or invoice is attached.", settingEnabled("requireExpenseReceipt", false))}</div><div class="notice info settings-risk-note">${I("info")}<div>Acknowledging or snoozing an alert never changes business data. Resolve the underlying stock, payment, approval or backup condition to clear it.</div></div><div class="settings-save-bar"><span>Changes rebuild the alerts centre immediately.</span><button class="button button-primary" type="submit">${I("save")}Save alerts and expense controls</button></div></form></article>`;
    if (section === "security")
      return `<article class="panel settings-content-card"><div class="settings-content-heading"><span class="settings-heading-icon">${I("lock")}</span><div><span class="eyebrow">Approval policy</span><h2>Returns and void controls</h2><p>Protect reversals with a manager identity, PIN and required evidence.</p></div></div><form class="settings-form" data-form="security-settings"><div class="security-status ${state.business.approvalPinHash ? "ready" : "attention"}"><span>${I(state.business.approvalPinHash ? "check" : "warning")}</span><div><strong>${state.business.approvalPinHash ? "Approval control is active" : "Approval PIN is not configured"}</strong><small>${state.business.approvalPinHash ? "Managers can approve or reject queued return and void requests." : "Requests can be submitted, but they cannot be reviewed until a PIN is created."}</small></div></div><div class="settings-field-grid"><div class="field"><label>Manager / approver name</label><input name="managerName" required value="${esc(state.business.managerName || "Manager")}"></div><div class="field"><label>${state.business.approvalPinHash ? "Replace approval PIN" : "Create approval PIN"}</label><input type="password" name="approvalPin" inputmode="numeric" minlength="4" maxlength="8" pattern="[0-9]{4,8}" autocomplete="new-password" placeholder="${state.business.approvalPinHash ? "Leave blank to keep current PIN" : "4–8 digits"}"><small>The PIN is stored as a one-way hash in this browser.</small></div></div><div class="settings-toggle-list">${settingsToggle("requireReturnNotes", "Require notes for returns", "Makes the requester explain why selected items should be refunded.", settingEnabled("requireReturnNotes", true))}${settingsToggle("requireVoidNotes", "Require notes for full sale voids", "Requires a written explanation before a full reversal enters the queue.", settingEnabled("requireVoidNotes", true))}</div><div class="approval-policy-flow"><div><span>1</span><strong>Request</strong><small>Operator selects items and reason</small></div><div><span>2</span><strong>Review</strong><small>Manager enters PIN and decision</small></div><div><span>3</span><strong>Apply</strong><small>Stock and cash change atomically</small></div></div><div class="settings-save-bar"><span>${state.approvalRequests.filter((request) => request.status === "pending").length} request(s) currently await review.</span><button class="button button-primary" type="submit">${I("save")}Save security settings</button></div></form></article>`;
    if (section === "data") {
      const lastBackup = state.business.lastBackupAt
        ? formatDateTime(state.business.lastBackupAt)
        : "Never on this device";
      return `<article class="panel settings-content-card"><div class="settings-content-heading"><span class="settings-heading-icon">${I("database")}</span><div><span class="eyebrow">Device and recovery</span><h2>Data, backup and installation</h2><p>Protect local records and move them between devices safely.</p></div></div><form class="settings-form settings-data-form" data-form="data-settings"><div class="device-status-grid"><div><span>Application</span><strong>Version ${APP_VERSION}</strong><small>IndexedDB v6</small></div><div><span>Offline use</span><strong>Ready</strong><small>${installed ? "Installed on this device" : "Browser installation available"}</small></div><div><span>Scanner</span><strong>${"BarcodeDetector" in window ? "Native" : window.ZXingBrowser ? "Compatible" : "Manual"}</strong><small>Camera, image and typed entry</small></div><div><span>Last backup</span><strong>${esc(lastBackup)}</strong><small>Download backups regularly</small></div></div><div class="settings-field-grid"><div class="field"><label>Backup reminder interval (days)</label><input type="number" name="backupReminderDays" min="1" max="90" step="1" value="${clamp(num(state.business.backupReminderDays) || 7, 1, 90)}"><small>Used to show backup health in the alerts centre and this control centre.</small></div></div><div class="settings-actions-grid data-action-grid"><button type="button" class="settings-action featured" data-action="export-backup">${I("download")}<div><strong>Export full backup</strong><span>Products, images, sales, alerts, expenses, approvals, purchases and settings.</span></div></button><button type="button" class="settings-action" data-action="import-backup">${I("upload")}<div><strong>Import backup</strong><span>Replace this device’s database from a valid JSON backup.</span></div></button><button type="button" class="settings-action" data-action="export-products">${I("file")}<div><strong>Product CSV</strong><span>Export the current catalogue for spreadsheets.</span></div></button><button type="button" class="settings-action" data-action="export-sales">${I("receipt")}<div><strong>Sales CSV</strong><span>Export receipt totals and transaction statuses.</span></div></button><button type="button" class="settings-action" data-action="install-app">${I("download")}<div><strong>${installed ? "App installed" : "Review setup & install"}</strong><span>Check camera, notifications, sound and accessibility before installation.</span></div></button></div><div class="settings-save-bar"><span>Records live in this browser profile, not a cloud account.</span><button class="button button-primary" type="submit">${I("save")}Save reminder</button></div></form><div class="danger-zone-inline"><div><strong>Reset this device</strong><span>Permanently remove all local POS records and recreate sample data.</span></div><button class="button button-danger" data-action="reset-data">${I("trash")}Delete all data</button></div></article>`;
    }
    return `<article class="panel settings-content-card"><div class="settings-content-heading"><span class="settings-heading-icon">${I("store")}</span><div><span class="eyebrow">Business identity</span><h2>Business profile and tax</h2><p>Details used across the app, reports and branded receipts.</p></div></div><form class="settings-form" data-form="business-settings"><div class="business-identity-banner"><div class="business-avatar">${esc(initials(state.business.businessName))}</div><div><strong>${esc(state.business.businessName)}</strong><span>${esc(state.business.address || "Add your business address")}</span></div><span class="badge success">Active profile</span></div><div class="settings-field-grid"><div class="field"><label>Business name</label><input name="businessName" required value="${esc(state.business.businessName || "")}"></div><div class="field"><label>Phone</label><input name="phone" value="${esc(state.business.phone || "")}"></div><div class="field"><label>Email</label><input type="email" name="email" value="${esc(state.business.email || "")}"></div><div class="field"><label>TIN / registration number</label><input name="taxId" value="${esc(state.business.taxId || "")}"></div><div class="field full"><label>Business address</label><input name="address" value="${esc(state.business.address || "")}"></div><div class="field"><label>Currency code</label><input name="currency" maxlength="3" required value="${esc(state.business.currency || "UGX")}"></div><div class="field"><label>Tax rate (%)</label><input type="number" name="taxRate" min="0" max="100" step="0.01" value="${num(state.business.taxRate)}"></div><div class="field"><label>Tax mode</label><select name="taxMode"><option value="exclusive" ${state.business.taxMode !== "inclusive" ? "selected" : ""}>Add tax to price</option><option value="inclusive" ${state.business.taxMode === "inclusive" ? "selected" : ""}>Tax included in price</option></select></div></div><div class="notice info settings-risk-note">${I("info")}<div>Currency and tax changes apply to future sales. Existing receipts keep their recorded totals.</div></div><div class="settings-save-bar"><span>These details appear on professional receipts.</span><button class="button button-primary" type="submit">${I("save")}Save business profile</button></div></form></article>`;
  }

  function renderSettings() {
    const installed =
      window.matchMedia("(display-mode: standalone)").matches ||
      navigator.standalone === true;
    const pending = state.approvalRequests.filter(
      (request) => request.status === "pending",
    ).length;
    const lastBackup = state.business.lastBackupAt
      ? new Date(state.business.lastBackupAt)
      : null;
    const backupDays = lastBackup
      ? Math.floor((Date.now() - lastBackup.getTime()) / 86400000)
      : null;
    const backupHealthy =
      backupDays !== null &&
      backupDays <= clamp(num(state.business.backupReminderDays) || 7, 1, 90);
    $("#appView").innerHTML = `<div class="page-stack phase-page settings-page">
      <section class="settings-hero"><div><span class="eyebrow">Operations control centre</span><h2>Make the POS work your way.</h2><p>Configure branding, accessibility, checkout sounds, alerts, stock policy and device recovery from one organized workspace.</p></div><div class="settings-health"><div class="${state.business.approvalPinHash ? "ready" : "attention"}">${I("lock")}<span><strong>${state.business.approvalPinHash ? "PIN protected" : "PIN needed"}</strong><small>${pending} pending approval(s)</small></span></div><div class="${backupHealthy ? "ready" : "attention"}">${I("database")}<span><strong>${backupHealthy ? "Backup current" : "Backup due"}</strong><small>${lastBackup ? `${backupDays} day(s) ago` : "Not backed up yet"}</small></span></div><div class="ready">${I("check")}<span><strong>Offline ready</strong><small>Version ${APP_VERSION} · DB v6</small></span></div></div></section>
      <section class="settings-workspace"><aside class="settings-nav panel"><div class="settings-nav-heading"><strong>Settings</strong><span>Select a category</span></div>${settingsNavButton("business", "store", "Business profile", "Identity, currency and tax")}${settingsNavButton("appearance", "image", "Appearance", "Colours and accessibility")}${settingsNavButton("checkout", "cart", "Checkout", "Payments and sale flow")}${settingsNavButton("receipts", "receipt", "Receipts", "Branding and content")}${settingsNavButton("inventory", "boxes", "Inventory", "Alerts and stock policy")}${settingsNavButton("security", "lock", "Approvals", "Returns and void control")}${settingsNavButton("data", "database", "Data & device", "Backup, exports and install")}</aside><div class="settings-content">${settingsSectionContent(installed)}</div></section>
      <input type="file" id="backupInput" accept="application/json" hidden>
    </div>`;
    const approvalsSettingsButton = $(`[data-action="settings-section"][data-id="security"]`);
    if (approvalsSettingsButton)
      approvalsSettingsButton.insertAdjacentHTML(
        "beforebegin",
        settingsNavButton(
          "alerts",
          "bell",
          "Alerts & expenses",
          "Warnings and spending controls",
        ),
      );
    $("#backupInput")?.addEventListener("change", importBackupFile);
    if (state.settingsSection === "appearance") updateAppearancePreview();
  }

  async function handleClick(event) {
    const viewTarget = event.target.closest("[data-view]");
    if (viewTarget) {
      navigate(viewTarget.dataset.view);
      return;
    }
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const { action, id, change, tab, decision } = target.dataset;
    const actions = {
      "open-sidebar": openSidebar,
      "close-sidebar": closeSidebar,
      "close-modal": closeModal,
      "close-scanner": closeScanner,
      "install-app": triggerInstall,
      "new-product": () => openProductModal(),
      "edit-product": () =>
        openProductModal(state.products.find((p) => p.id === id)),
      "delete-product": () => confirmDeleteProduct(id),
      "view-product": () => openProductDetails(id),
      "toggle-favorite": () => toggleProductFavorite(id),
      "duplicate-product": () => duplicateProduct(id),
      "remove-product-image": removeProductImageDraft,
      "product-view": () => {
        state.productView = target.dataset.mode === "grid" ? "grid" : "table";
        try {
          localStorage.setItem("mtech-product-view", state.productView);
        } catch (_) {}
        renderProducts();
      },
      "settings-section": () => {
        state.settingsSection = id || "business";
        renderSettings();
      },
      "manage-categories": openCategoriesModal,
      "delete-category": () => deleteCategory(id),
      "adjust-product": () => openStockAdjustmentModal(id),
      "adjust-stock": () => openStockAdjustmentModal(),
      "scan-pos": () => openBarcodeScanner(handlePOSBarcode),
      "mobile-pos-stage": () => {
        state.mobilePosStage = target.dataset.stage === "cart" ? "cart" : "products";
        renderPOS();
      },
      "pos-category": () => {
        state.posCategory = id;
        renderPOS();
      },
      "add-cart": () => addToCart(id),
      "cart-qty": () => updateCartQty(id, num(change)),
      "remove-cart": () => removeCart(id),
      "clear-cart": clearCart,
      "edit-cart-line": () => openCartLineModal(id),
      "order-discount": openOrderDiscountModal,
      checkout: openCheckoutModal,
      "preview-checkout-sound": () => previewConfiguredSound("checkout"),
      "preview-alert-sound": () => previewConfiguredSound("alert"),
      "hold-sale": openHoldSaleModal,
      "resume-sale": openHeldSalesModal,
      "new-purchase": openPurchaseModal,
      "view-purchase": () => openPurchaseDetails(id),
      "new-purchase-order": () => openPurchaseOrderModal(),
      "edit-purchase-order": () =>
        openPurchaseOrderModal(state.purchaseOrders.find((order) => order.id === id)),
      "view-purchase-order": () => openPurchaseOrderDetails(id),
      "submit-purchase-order": () => changePurchaseOrderStatus(id, "ordered"),
      "cancel-purchase-order": () => changePurchaseOrderStatus(id, "cancelled"),
      "receive-purchase-order": () => openPurchaseModal(id),
      "export-purchases": exportPurchasesCSV,
      "new-supplier": () => openSupplierModal(),
      "edit-supplier": () =>
        openSupplierModal(state.suppliers.find((s) => s.id === id)),
      "view-supplier": () => openSupplierDetails(id),
      "supplier-payment": () => openSupplierPaymentModal(id),
      "new-customer": () => openCustomerModal(),
      "edit-customer": () =>
        openCustomerModal(state.customers.find((c) => c.id === id)),
      "view-customer": () => openCustomerDetails(id),
      "customer-payment": () => openCustomerPaymentModal(id),
      "sales-status": () => {
        state.salesStatusFilter = ["all", "completed", "returned", "voided"].includes(
          id,
        )
          ? id
          : "all";
        renderSales();
      },
      "view-sale": () => openSaleDetails(id),
      "print-sale": () => printSale(id),
      "download-sale": () => downloadReceiptById(id),
      "share-sale": () => shareReceiptById(id),
      "return-sale": () => openReturnModal(id),
      "request-void": () => openVoidRequestModal(id),
      "review-approval": () => openApprovalReviewModal(id, decision),
      "view-approval": () => openApprovalDetails(id),
      "new-expense": () => openExpenseModal(),
      "edit-expense": () =>
        openExpenseModal(state.expenses.find((e) => e.id === id)),
      "view-expense": () => openExpenseDetails(id),
      "pay-expense": () => openExpensePaymentModal(id),
      "void-expense": () => openExpenseVoidModal(id),
      "delete-expense": () => confirmDeleteExpense(id),
      "remove-expense-receipt": removeExpenseReceiptDraft,
      "acknowledge-alert": () => acknowledgeAlert(id),
      "snooze-alert": () => snoozeAlert(id),
      "reopen-alert": () => reopenAlert(id),
      "acknowledge-all-alerts": acknowledgeAllAlerts,
      "open-alert-target": () => openAlertTarget(id),
      "open-alert-settings": () => {
        state.settingsSection = "alerts";
        navigate("settings");
      },
      "open-approval-settings": () => {
        state.settingsSection = "security";
        navigate("settings");
      },
      "open-register": openRegisterModal,
      "close-register": openCloseRegisterModal,
      "cash-in": () => openCashMovementModal("cash-in"),
      "cash-out": () => openCashMovementModal("cash-out"),
      "inventory-tab": () => switchInventoryTab(tab),
      "new-stock-count": () => openStockCountModal(),
      "continue-stock-count": () =>
        openStockCountModal(state.stockCounts.find((c) => c.id === id)),
      "view-stock-count": () => openStockCountDetails(id),
      "export-sales": exportSalesCSV,
      "export-products": exportProductsCSV,
      "export-customers": exportCustomersCSV,
      "export-expenses": exportExpensesCSV,
      "export-report": exportReportCSV,
      "export-backup": exportBackup,
      "import-backup": () => $("#backupInput")?.click(),
      "reset-data": confirmResetData,
      "theme-preset": () => applyThemePresetToForm(id),
      "request-camera-permission": requestCameraPermission,
      "request-notification-permission": requestNotificationPermission,
      "enable-mobile-sound": enableMobileSound,
      "focus-accessibility-setup": () =>
        $("#mobileAccessibilitySetup")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      "continue-install": continueInstall,
      "scan-product-field": () =>
        openBarcodeScanner((code) => {
          const input = $("#productBarcode");
          if (input) input.value = code;
        }),
      "add-purchase-line": addPurchaseLine,
      "remove-purchase-line": () => removePurchaseLine(target),
      "add-purchase-order-line": addPurchaseOrderLine,
      "remove-purchase-order-line": () => removePurchaseOrderLine(target),
      "add-stock-count-product": addStockCountProduct,
      "toggle-torch": toggleTorch,
      "manual-barcode": manualBarcodeEntry,
      "print-current-receipt": () => window.print(),
      "download-current-receipt": downloadCurrentReceipt,
      "share-current-receipt": shareCurrentReceipt,
      "restore-held": () => restoreHeldSale(id),
      "delete-held": () => deleteHeldSale(id),
      "quick-pay": () => quickFillPayment(target.dataset.method),
      "set-return-all": () => setReturnAll(id),
    };
    try {
      if (actions[action]) await actions[action]();
    } catch (error) {
      console.error(error);
      toast("Action failed", error.message, "error");
    }
  }

  function handleInput(event) {
    const filter = event.target.dataset.filter;
    if (filter) {
      const cursor = event.target.selectionStart;
      state.filters[filter] = event.target.value;
      renderCurrentView();
      const replacement = $(`[data-filter="${filter}"]`);
      replacement?.focus({ preventScroll: true });
      if (replacement?.setSelectionRange && cursor !== null)
        replacement.setSelectionRange(cursor, cursor);
      return;
    }
    if (["posSearch", "mobilePosSearch"].includes(event.target.id)) {
      const searchId = event.target.id;
      const cursor = event.target.selectionStart;
      state.posQuery = event.target.value;
      const exact = state.products.find(
        (p) =>
          p.active !== false &&
          [p.barcode, p.sku].some(
            (v) =>
              String(v || "").toLowerCase() ===
              state.posQuery.trim().toLowerCase(),
          ),
      );
      if (exact && state.posQuery.trim().length >= 4) {
        state.posQuery = "";
        addToCart(exact.id);
      } else {
        renderPOS();
        const replacement = $(`#${searchId}`);
        replacement?.focus({ preventScroll: true });
        if (replacement?.setSelectionRange && cursor !== null)
          replacement.setSelectionRange(cursor, cursor);
      }
    }
    if (event.target.matches("[data-payment-input]")) updatePaymentStatus();
    if (event.target.matches("[data-purchase-input]")) updatePurchaseTotals();
    if (event.target.matches("[data-order-input]")) updatePurchaseOrderTotals();
    if (event.target.matches("[data-return-qty]")) updateReturnTotals();
    if (event.target.matches("[data-expense-amount]")) updateExpenseTotals();
    if (event.target.closest('form[data-form="receipt-settings"]'))
      updateReceiptSettingsPreview();
    if (event.target.closest('form[data-form="appearance-settings"]'))
      updateAppearancePreview();
    if (event.target.closest('form[data-form="mobile-setup"]'))
      updateInstallAccessibilityPreview();
  }

  function handleChange(event) {
    if (["posCustomer", "mobilePosCustomer"].includes(event.target.id))
      state.selectedCustomerId = event.target.value;
    if (event.target.id === "reportPeriod") {
      state.reportPeriod = event.target.value;
      renderReports();
    }
    if (event.target.id === "expensePeriodFilter") {
      state.expensePeriodFilter = event.target.value;
      renderExpenses();
    }
    if (event.target.id === "expenseStatusFilter") {
      state.expenseStatusFilter = event.target.value;
      renderExpenses();
    }
    if (event.target.id === "expenseCategoryFilter") {
      state.expenseCategoryFilter = event.target.value;
      renderExpenses();
    }
    if (event.target.id === "alertSeverityFilter") {
      state.alertSeverityFilter = event.target.value;
      renderAlerts();
    }
    if (event.target.id === "alertCategoryFilter") {
      state.alertCategoryFilter = event.target.value;
      renderAlerts();
    }
    if (event.target.id === "alertStatusFilter") {
      state.alertStatusFilter = event.target.value;
      renderAlerts();
    }
    if (event.target.id === "productCategoryFilter") {
      state.productCategoryFilter = event.target.value;
      renderProducts();
    }
    if (event.target.id === "productStatusFilter") {
      state.productStatusFilter = event.target.value;
      renderProducts();
    }
    if (event.target.id === "productSort") {
      state.productSort = event.target.value;
      renderProducts();
    }
    if (event.target.matches("[data-purchase-input]")) updatePurchaseTotals();
    if (event.target.matches("[data-order-input]")) updatePurchaseOrderTotals();
    if (event.target.matches("[data-return-qty], [data-return-restock]"))
      updateReturnTotals();
    if (event.target.closest('form[data-form="receipt-settings"]'))
      updateReceiptSettingsPreview();
    if (event.target.closest('form[data-form="appearance-settings"]'))
      updateAppearancePreview();
    if (event.target.closest('form[data-form="mobile-setup"]'))
      updateInstallAccessibilityPreview();
  }

  function updateReceiptSettingsPreview() {
    const form = $('form[data-form="receipt-settings"]');
    const preview = $("#settingsReceiptPreview");
    if (!form || !preview) return;
    preview.classList.toggle(
      "receipt-58mm",
      form.elements.receiptPaper.value === "58mm",
    );
    preview.style.setProperty(
      "--receipt-accent",
      form.elements.receiptAccent.value || "#0f766e",
    );
    const footer = $("#settingsReceiptFooter");
    if (footer)
      footer.textContent = form.elements.receiptFooter.value.trim() || "Thank you.";
    const visibility = {
      cashier: form.elements.showReceiptCashier.checked,
      sku: form.elements.showReceiptSku.checked,
      tax: form.elements.showReceiptTax.checked,
    };
    Object.entries(visibility).forEach(([key, visible]) => {
      const node = $(`[data-receipt-preview="${key}"]`, preview);
      if (node) node.hidden = !visible;
    });
  }

  async function handleSubmit(event) {
    const form = event.target.closest("form[data-form]");
    if (!form) return;
    event.preventDefault();
    const handlers = {
      product: saveProduct,
      category: saveCategory,
      "cart-line": saveCartLine,
      "order-discount": saveOrderDiscount,
      checkout: completeCheckout,
      "hold-sale": saveHeldSale,
      supplier: saveSupplier,
      customer: saveCustomer,
      purchase: savePurchase,
      "purchase-order": savePurchaseOrder,
      expense: saveExpense,
      "expense-payment": saveExpensePayment,
      "expense-void": saveExpenseVoid,
      "customer-payment": saveCustomerPayment,
      "supplier-payment": saveSupplierPayment,
      "open-register": saveOpenRegister,
      "close-register": saveCloseRegister,
      "cash-movement": saveCashMovement,
      "stock-adjustment": saveStockAdjustment,
      "stock-count": saveStockCount,
      return: saveReturn,
      "void-request": saveVoidRequest,
      "approval-review": saveApprovalReview,
      "business-settings": saveBusinessSettings,
      "appearance-settings": saveAppearanceSettings,
      "checkout-settings": saveCheckoutSettings,
      "receipt-settings": saveReceiptSettings,
      "inventory-settings": saveInventorySettings,
      "security-settings": saveSecuritySettings,
      "alerts-settings": saveAlertsSettings,
      "data-settings": saveDataSettings,
      "mobile-setup": saveMobileSetup,
      "manual-barcode": saveManualBarcode,
    };
    try {
      if (handlers[form.dataset.form])
        await handlers[form.dataset.form](form, event.submitter);
    } catch (error) {
      console.error(error);
      toast("Could not save", error.message, "error");
    }
  }

  function addToCart(productId) {
    const product = state.products.find((p) => p.id === productId);
    if (!product || product.active === false) return;
    const existing = state.cart.find((item) => item.productId === productId);
    const nextQty = num(existing?.quantity) + 1;
    if (
      !allowNegativeStock() &&
      product.trackStock !== false &&
      nextQty > num(product.stock)
    ) {
      toast(
        "Insufficient stock",
        `${product.name} has ${num(product.stock)} available.`,
        "warning",
      );
      return;
    }
    if (existing) existing.quantity = nextQty;
    else
      state.cart.push({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        quantity: 1,
        unitPrice: num(product.sellingPrice),
        costPrice: num(product.purchasePrice),
        taxable: product.taxable !== false,
        unit: product.unit,
        discountType: "fixed",
        discountValue: 0,
      });
    haptic(25);
    renderPOS();
  }
  function updateCartQty(productId, change) {
    const item = state.cart.find((i) => i.productId === productId);
    if (!item) return;
    const product = state.products.find((p) => p.id === productId);
    const next = num(item.quantity) + change;
    if (next <= 0) {
      removeCart(productId);
      return;
    }
    if (
      !allowNegativeStock() &&
      product?.trackStock !== false &&
      next > num(product.stock)
    ) {
      toast(
        "Insufficient stock",
        `Only ${num(product.stock)} available.`,
        "warning",
      );
      return;
    }
    item.quantity = next;
    renderPOS();
  }
  function removeCart(productId) {
    state.cart = state.cart.filter((i) => i.productId !== productId);
    renderPOS();
  }
  function clearCart() {
    if (!state.cart.length) return;
    if (!settingEnabled("confirmClearCart", true)) {
      state.cart = [];
      state.orderDiscountValue = 0;
      state.saleNotes = "";
      renderPOS();
      toast("Cart cleared", "The current sale was reset.", "success");
      return;
    }
    confirmDialog(
      "Clear current sale",
      "Remove every item and discount from the current cart?",
      () => {
        state.cart = [];
        state.orderDiscountValue = 0;
        state.saleNotes = "";
        renderPOS();
      },
    );
  }
  function handlePOSBarcode(code) {
    const clean = String(code || "").trim();
    const product = state.products.find(
      (p) =>
        p.active !== false &&
        (String(p.barcode || "") === clean ||
          String(p.sku || "").toLowerCase() === clean.toLowerCase()),
    );
    if (product) {
      addToCart(product.id);
      toast("Product scanned", product.name, "success");
    } else {
      state.posQuery = clean;
      renderPOS();
      toast(
        "Barcode not found",
        `No product uses ${clean}. Add it to a product or create a new one.`,
        "warning",
      );
    }
  }

  function openProductModal(product = null) {
    const isEdit = Boolean(product);
    state.productImageDraft = safeImageData(product?.imageData);
    state.productImageBusy = false;
    openModal(
      isEdit ? "Edit product" : "Add product",
      "Image, identity, pricing and inventory settings",
      `<form data-form="product" class="product-editor"><input type="hidden" name="id" value="${esc(product?.id || "")}"><div class="product-form-layout"><aside class="product-image-column"><div class="image-upload-card" id="productImageDropzone"><div class="product-image-preview" id="productImagePreview"></div><div class="image-upload-actions"><label class="button button-primary" for="productImageInput">${I("upload")}Choose image</label><label class="button button-outline" for="productCameraInput">${I("camera")}Take photo</label><button class="button button-ghost danger-text" type="button" id="removeProductImage" data-action="remove-product-image" hidden>${I("trash")}Remove</button></div><p id="productImageStatus">JPG, PNG or WebP · maximum 8 MB</p><input type="file" id="productImageInput" accept="image/*" hidden><input type="file" id="productCameraInput" accept="image/*" capture="environment" hidden></div><div class="image-upload-note">${I("info")}<span>Images are resized and compressed automatically, remain available offline, and are included in your JSON backup.</span></div></aside><div class="product-form-fields"><section class="editor-section"><div class="editor-section-heading"><span>01</span><div><h3>Product identity</h3><p>Information used for search, receipts and barcode lookup</p></div></div><div class="form-grid"><div class="field full"><label>Product name</label><input name="name" required autofocus value="${esc(product?.name || "")}" placeholder="e.g. Mineral Water 500ml"></div><div class="field full"><label>Description</label><textarea name="description" placeholder="Optional details such as brand, size or variant">${esc(product?.description || "")}</textarea></div><div class="field"><label>SKU</label><input name="sku" required value="${esc(product?.sku || "")}" placeholder="WAT-500"></div><div class="field"><label>Barcode</label><div class="input-with-action"><input id="productBarcode" name="barcode" inputmode="numeric" value="${esc(product?.barcode || "")}" placeholder="Scan or enter barcode"><button class="icon-button" type="button" data-action="scan-product-field" aria-label="Scan barcode">${I("scan")}</button></div></div><div class="field"><label>Category</label><select name="categoryId"><option value="">Uncategorized</option>${state.categories.map((category) => `<option value="${category.id}" ${product?.categoryId === category.id ? "selected" : ""}>${esc(category.name)}</option>`).join("")}</select></div><div class="field"><label>Preferred supplier</label><select name="supplierId"><option value="">Not assigned</option>${state.suppliers.map((supplier) => `<option value="${supplier.id}" ${product?.supplierId === supplier.id ? "selected" : ""}>${esc(supplier.name)}</option>`).join("")}</select></div></div></section><section class="editor-section"><div class="editor-section-heading"><span>02</span><div><h3>Pricing</h3><p>Set the purchase cost and customer selling price</p></div></div><div class="form-grid"><div class="field"><label>Purchase cost</label><input id="productPurchasePrice" type="number" min="0" step="0.01" name="purchasePrice" required value="${num(product?.purchasePrice)}"></div><div class="field"><label>Selling price</label><input id="productSellingPrice" type="number" min="0" step="0.01" name="sellingPrice" required value="${num(product?.sellingPrice)}"></div><div class="field full"><div class="product-margin-preview" id="productMarginPreview"></div></div></div></section><section class="editor-section"><div class="editor-section-heading"><span>03</span><div><h3>Inventory controls</h3><p>Configure stock, replenishment and batch information</p></div></div><div class="form-grid"><div class="field"><label>Opening / current stock</label><input type="number" min="0" step="0.001" name="stock" required value="${num(product?.stock)}"></div><div class="field"><label>Reorder level</label><input type="number" min="0" step="0.001" name="reorderLevel" value="${num(product?.reorderLevel)}"></div><div class="field"><label>Unit</label><select name="unit">${["piece", "pack", "bottle", "box", "kg", "gram", "litre", "metre", "service"].map((unit) => `<option value="${unit}" ${(product?.unit || "piece") === unit ? "selected" : ""}>${unit}</option>`).join("")}</select></div><div class="field"><label>Batch / lot number</label><input name="batchNo" value="${esc(product?.batchNo || "")}"></div><div class="field"><label>Expiry date</label><input type="date" name="expiryDate" value="${esc(product?.expiryDate || "")}"></div></div><div class="product-option-grid"><label class="checkbox-field"><input type="checkbox" name="trackStock" ${product?.trackStock === false ? "" : "checked"}><span><strong>Track stock</strong><small>Reduce quantities after sales</small></span></label><label class="checkbox-field"><input type="checkbox" name="taxable" ${product?.taxable === false ? "" : "checked"}><span><strong>Apply tax</strong><small>Use configured business tax</small></span></label><label class="checkbox-field"><input type="checkbox" name="active" ${product?.active === false ? "" : "checked"}><span><strong>Available for sale</strong><small>Show in the checkout catalogue</small></span></label><label class="checkbox-field"><input type="checkbox" name="favorite" ${product?.favorite ? "checked" : ""}><span><strong>Favorite product</strong><small>Keep in the fast-access filter</small></span></label></div></section></div></div><div class="form-actions product-editor-actions"><button type="button" class="button button-outline" data-action="close-modal">Cancel</button><button class="button button-primary" type="submit">${I("save")}${isEdit ? "Save changes" : "Add product"}</button></div></form>`,
      true,
    );
    bindProductImageUploader();
  }

  async function saveProduct(form) {
    if (state.productImageBusy)
      throw new Error("Wait for the product image to finish processing");
    const data = Object.fromEntries(new FormData(form));
    const existing = state.products.find((p) => p.id === data.id);
    const duplicate = state.products.find(
      (p) =>
        p.id !== data.id &&
        ((data.barcode && p.barcode === data.barcode) ||
          (data.sku &&
            String(p.sku || "").toLowerCase() ===
              String(data.sku).toLowerCase())),
    );
    if (duplicate)
      throw new Error("SKU or barcode is already used by another product");
    const timestamp = nowISO();
    const record = {
      ...existing,
      id: data.id || uid("prod"),
      name: data.name.trim(),
      description: data.description.trim(),
      sku: data.sku.trim(),
      barcode: data.barcode.trim(),
      categoryId: data.categoryId,
      supplierId: data.supplierId,
      purchasePrice: num(data.purchasePrice),
      sellingPrice: num(data.sellingPrice),
      stock: num(data.stock),
      reorderLevel: num(data.reorderLevel),
      unit: data.unit,
      batchNo: data.batchNo.trim(),
      expiryDate: data.expiryDate,
      imageData: safeImageData(state.productImageDraft),
      trackStock: form.elements.trackStock.checked,
      taxable: form.elements.taxable.checked,
      active: form.elements.active.checked,
      favorite: form.elements.favorite.checked,
      createdAt: existing?.createdAt || timestamp,
      updatedAt: timestamp,
    };
    if (record.sellingPrice < record.purchasePrice)
      toast(
        "Low margin warning",
        "Selling price is below purchase cost.",
        "warning",
      );
    await DB.put("products", record);
    closeModal();
    await refresh("products");
    toast("Product saved", record.name, "success");
  }
  function confirmDeleteProduct(id) {
    const product = state.products.find((p) => p.id === id);
    if (!product) return;
    const used =
      state.sales.some((s) => s.items?.some((i) => i.productId === id)) ||
      state.purchases.some((p) => p.items?.some((i) => i.productId === id));
    if (used) {
      toast(
        "Cannot delete product",
        "This product has transaction history. Mark it inactive instead.",
        "warning",
      );
      return;
    }
    confirmDialog(
      "Delete product",
      `Permanently delete ${product.name}?`,
      async () => {
        await DB.remove("products", id);
        await refresh("products");
        toast("Product deleted", product.name, "success");
      },
      "Delete",
    );
  }

  function openCategoriesModal() {
    openModal(
      "Product categories",
      "Organize products for faster checkout",
      `<div id="categoryList">${categoryListHTML()}</div><form data-form="category" style="margin-top:14px"><div class="form-grid"><div class="field"><label>Category name</label><input name="name" required></div><div class="field"><label>Description</label><input name="description"></div></div><div class="form-actions"><button class="button button-primary" type="submit">${I("plus")}Add category</button></div></form>`,
    );
  }
  function categoryListHTML() {
    return state.categories.length
      ? `<div class="list-stack" style="padding:0">${state.categories.map((c) => `<div class="list-row"><div class="list-main"><div class="list-icon">${I("tag")}</div><div class="list-copy"><strong>${esc(c.name)}</strong><span>${esc(c.description || `${state.products.filter((p) => p.categoryId === c.id).length} products`)}</span></div></div><button class="mini-button danger" data-action="delete-category" data-id="${c.id}">${I("trash")}</button></div>`).join("")}</div>`
      : emptyState("No categories", "Add a category below.", "tag");
  }
  async function saveCategory(form) {
    const data = Object.fromEntries(new FormData(form));
    if (
      state.categories.some(
        (c) => c.name.toLowerCase() === data.name.trim().toLowerCase(),
      )
    )
      throw new Error("Category name already exists");
    await DB.put("categories", {
      id: uid("cat"),
      name: data.name.trim(),
      description: data.description.trim(),
      createdAt: nowISO(),
    });
    await loadData();
    openCategoriesModal();
    toast("Category added", data.name, "success");
  }

  function openCartLineModal(productId) {
    const item = state.cart.find((i) => i.productId === productId);
    if (!item) return;
    openModal(
      "Edit sale item",
      item.name,
      `<form data-form="cart-line"><input type="hidden" name="productId" value="${item.productId}"><div class="form-grid"><div class="field"><label>Quantity</label><input type="number" name="quantity" min="0.001" step="0.001" required value="${num(item.quantity)}"></div><div class="field"><label>Unit price</label><input type="number" name="unitPrice" min="0" step="0.01" required value="${num(item.unitPrice)}"></div><div class="field"><label>Discount type</label><select name="discountType"><option value="fixed" ${item.discountType !== "percent" ? "selected" : ""}>Fixed amount</option><option value="percent" ${item.discountType === "percent" ? "selected" : ""}>Percentage</option></select></div><div class="field"><label>Discount value</label><input type="number" name="discountValue" min="0" step="0.01" value="${num(item.discountValue)}"></div></div><div class="form-actions"><button type="button" class="button button-outline" data-action="close-modal">Cancel</button><button class="button button-primary">Save line</button></div></form>`,
    );
  }
  async function saveCartLine(form) {
    const data = Object.fromEntries(new FormData(form));
    const item = state.cart.find((i) => i.productId === data.productId);
    const product = state.products.find((p) => p.id === data.productId);
    if (!item) return;
    const quantity = num(data.quantity);
    if (
      !allowNegativeStock() &&
      product?.trackStock !== false &&
      quantity > num(product.stock)
    )
      throw new Error(`Only ${product.stock} available`);
    item.quantity = quantity;
    item.unitPrice = num(data.unitPrice);
    item.discountType = data.discountType;
    item.discountValue = num(data.discountValue);
    closeModal();
    renderPOS();
  }
  function openOrderDiscountModal() {
    openModal(
      "Order discount",
      "Apply a discount to the entire cart",
      `<form data-form="order-discount"><div class="form-grid"><div class="field"><label>Discount type</label><select name="type"><option value="fixed" ${state.orderDiscountType !== "percent" ? "selected" : ""}>Fixed amount</option><option value="percent" ${state.orderDiscountType === "percent" ? "selected" : ""}>Percentage</option></select></div><div class="field"><label>Value</label><input type="number" name="value" min="0" step="0.01" value="${num(state.orderDiscountValue)}"></div></div><div class="form-actions"><button type="button" class="button button-outline" data-action="close-modal">Cancel</button><button class="button button-primary">Apply discount</button></div></form>`,
    );
  }
  async function saveOrderDiscount(form) {
    const data = Object.fromEntries(new FormData(form));
    state.orderDiscountType = data.type;
    state.orderDiscountValue = num(data.value);
    closeModal();
    renderPOS();
  }

  function openCheckoutModal() {
    if (!state.cart.length) return;
    const totals = cartTotals();
    const customer = state.customers.find(
      (c) => c.id === state.selectedCustomerId,
    );
    openModal(
      "Complete payment",
      `${state.cart.reduce((s, i) => s + num(i.quantity), 0)} items · ${customer?.name || "Walk-in customer"}`,
      `<form data-form="checkout"><div class="notice info">${I("info")}<div>Enter one or more payment amounts. The applied total must equal <strong>${formatMoney(totals.total)}</strong>.</div></div><div class="payment-quick"><button type="button" data-action="quick-pay" data-method="cash">All cash</button><button type="button" data-action="quick-pay" data-method="mobile-money">All mobile money</button><button type="button" data-action="quick-pay" data-method="card">All card</button>${customer ? '<button type="button" data-action="quick-pay" data-method="credit">All credit</button>' : ""}</div><div class="payment-grid"><div class="payment-card"><label>${I("cash")}Cash applied</label><input data-payment-input name="cashAmount" type="number" min="0" step="0.01" value="0"></div><div class="payment-card"><label>${I("money")}Cash tendered</label><input data-payment-input name="cashTendered" type="number" min="0" step="0.01" value="0"><small>Used only to calculate change.</small></div><div class="payment-card"><label>${I("phone")}Mobile money</label><input data-payment-input name="mobileAmount" type="number" min="0" step="0.01" value="0"></div><div class="payment-card"><label>${I("card")}Card</label><input data-payment-input name="cardAmount" type="number" min="0" step="0.01" value="0"></div><div class="payment-card"><label>${I("credit")}Customer credit</label><input data-payment-input name="creditAmount" type="number" min="0" step="0.01" value="0" ${customer ? "" : "disabled"}><small>${customer ? `Current balance ${formatMoney(customer.balance)} · limit ${customer.creditLimit ? formatMoney(customer.creditLimit) : "not set"}` : "Select a customer before using credit."}</small></div><div class="payment-card"><label>${I("file")}Sale note</label><input name="notes" value="${esc(state.saleNotes)}" placeholder="Optional reference"></div></div><div class="payment-status invalid" id="paymentStatus"><span>Applied</span><strong>${formatMoney(0)} / ${formatMoney(totals.total)}</strong></div><div class="form-actions"><button type="button" class="button button-outline" data-action="close-modal">Back</button><button type="submit" class="button button-primary" id="completeSaleButton" disabled>${I("check")}Complete sale</button></div></form>`,
      true,
    );
    updatePaymentStatus();
    const preferred = state.business.defaultPaymentMethod;
    if (["cash", "mobile-money", "card"].includes(preferred))
      quickFillPayment(preferred);
  }
  function quickFillPayment(method) {
    const form = $('form[data-form="checkout"]');
    if (!form) return;
    [
      "cashAmount",
      "cashTendered",
      "mobileAmount",
      "cardAmount",
      "creditAmount",
    ].forEach((name) => {
      if (form.elements[name]) form.elements[name].value = 0;
    });
    const total = cartTotals().total;
    if (method === "cash") {
      form.elements.cashAmount.value = total;
      form.elements.cashTendered.value = total;
    } else if (method === "mobile-money")
      form.elements.mobileAmount.value = total;
    else if (method === "card") form.elements.cardAmount.value = total;
    else if (method === "credit" && form.elements.creditAmount)
      form.elements.creditAmount.value = total;
    updatePaymentStatus();
  }
  function paymentValues() {
    const form = $('form[data-form="checkout"]');
    if (!form) return null;
    const values = {
      cash: num(form.elements.cashAmount.value),
      tendered: num(form.elements.cashTendered.value),
      mobile: num(form.elements.mobileAmount.value),
      card: num(form.elements.cardAmount.value),
      credit: num(form.elements.creditAmount?.value),
    };
    values.applied = values.cash + values.mobile + values.card + values.credit;
    values.change = Math.max(0, values.tendered - values.cash);
    return values;
  }
  function updatePaymentStatus() {
    const values = paymentValues();
    const node = $("#paymentStatus");
    if (!values || !node) return;
    const total = cartTotals().total;
    const valid =
      Math.abs(values.applied - total) < 0.01 && values.tendered >= values.cash;
    node.className = `payment-status ${valid ? "valid" : "invalid"}`;
    node.innerHTML = `<span>${valid ? `Change: ${formatMoney(values.change)}` : "Applied payment"}</span><strong>${formatMoney(values.applied)} / ${formatMoney(total)}</strong>`;
    const button = $("#completeSaleButton");
    if (button) button.disabled = !valid;
  }
  async function completeCheckout(form) {
    const values = paymentValues();
    const totals = cartTotals();
    if (!values || Math.abs(values.applied - totals.total) >= 0.01)
      throw new Error("Payment amounts must equal the sale total");
    if (values.tendered < values.cash)
      throw new Error("Cash tendered cannot be below the cash amount applied");
    if (
      values.cash > 0 &&
      settingEnabled("requireOpenRegister", false) &&
      !openSession()
    )
      throw new Error("Open the cash register before completing a cash sale");
    const customer = state.customers.find(
      (c) => c.id === state.selectedCustomerId,
    );
    if (values.credit > 0 && !customer)
      throw new Error("Select a customer for a credit sale");
    if (
      customer &&
      values.credit > 0 &&
      num(customer.creditLimit) > 0 &&
      num(customer.balance) + values.credit > num(customer.creditLimit)
    )
      throw new Error(`This sale would exceed ${customer.name}'s credit limit`);
    const receiptNo = await DB.nextSequence("receiptSequence", "SALE");
    const createdAt = nowISO();
    const payments = [
      ["cash", values.cash],
      ["mobile-money", values.mobile],
      ["card", values.card],
      ["credit", values.credit],
    ]
      .filter(([, amount]) => amount > 0)
      .map(([method, amount]) => ({ method, amount }));
    const sale = {
      id: uid("sale"),
      receiptNo,
      items: buildSaleItems(),
      customerId: customer?.id || "",
      customerName: customer?.name || "Walk-in customer",
      subtotal: totals.afterLine,
      discount: totals.lineDiscount + totals.orderDiscount,
      orderDiscountType: state.orderDiscountType,
      orderDiscountValue: num(state.orderDiscountValue),
      tax: totals.tax,
      total: totals.total,
      payments,
      paymentMethod: payments.length === 1 ? payments[0].method : "mixed",
      tendered: values.tendered,
      change: values.change,
      status: "completed",
      notes: form.elements.notes.value.trim(),
      cashier: currentOperator(),
      allowNegativeStock: allowNegativeStock(),
      registerSessionId: openSession()?.id || "",
      createdAt,
    };
    await DB.completeSale(sale);
    playConfiguredSound("checkout");
    haptic([35, 35, 75]);
    state.cart = [];
    state.mobilePosStage = "products";
    state.orderDiscountValue = 0;
    state.selectedCustomerId = "";
    state.saleNotes = "";
    closeModal();
    await loadData();
    if (state.business.saleCompletionBehavior === "continue") renderPOS();
    else openReceiptModal(sale);
    toast(
      "Sale completed",
      `${receiptNo} · ${formatMoney(sale.total)}`,
      "success",
    );
  }

  function receiptHTML(sale) {
    const business = state.business;
    const accent = /^#[0-9a-f]{6}$/i.test(business.receiptAccent || "")
      ? business.receiptAccent
      : "#0f766e";
    const items = (sale.items || [])
      .map(
        (item) =>
          `<div><div class="receipt-item-name">${esc(item.name)}</div>${settingEnabled("showReceiptSku", true) && (item.sku || item.barcode) ? `<div class="receipt-code">${esc(item.sku || item.barcode)}</div>` : ""}<div class="receipt-row receipt-meta"><span>${num(item.quantity)} × ${formatMoney(item.unitPrice)}</span><span>${formatMoney(item.lineTotal || num(item.quantity) * num(item.unitPrice))}</span></div>${num(item.returnedQty) ? `<div class="receipt-returned">Returned: ${num(item.returnedQty)}</div>` : ""}</div>`,
      )
      .join("");
    return `<div class="receipt ${business.receiptPaper === "58mm" ? "receipt-58mm" : ""}" style="--receipt-accent:${accent}"><div class="receipt-brand-bar"></div><div class="receipt-center"><h3>${esc(business.businessName || "Retail Shop")}</h3><p>${esc(business.address || "")}</p><p>${esc(business.phone || "")}${business.email ? ` · ${esc(business.email)}` : ""}</p>${business.taxId ? `<p>TIN / Registration: ${esc(business.taxId)}</p>` : ""}</div>${sale.status !== "completed" ? `<div class="receipt-status">${esc(String(sale.status).replaceAll("-", " "))}</div>` : ""}<div class="receipt-rule"></div><div class="receipt-row"><span>Receipt</span><strong>${esc(sale.receiptNo)}</strong></div><div class="receipt-row"><span>Date</span><span>${formatDateTime(sale.createdAt)}</span></div><div class="receipt-row"><span>Customer</span><span>${esc(sale.customerName || "Walk-in customer")}</span></div>${settingEnabled("showReceiptCashier", true) ? `<div class="receipt-row"><span>Cashier</span><span>${esc(sale.cashier || "Owner")}</span></div>` : ""}<div class="receipt-rule"></div><div class="receipt-items">${items}</div><div class="receipt-rule"></div><div class="receipt-row"><span>Subtotal</span><span>${formatMoney(sale.subtotal)}</span></div><div class="receipt-row"><span>Discount</span><span>− ${formatMoney(sale.discount)}</span></div>${settingEnabled("showReceiptTax", true) ? `<div class="receipt-row"><span>Tax</span><span>${formatMoney(sale.tax)}</span></div>` : ""}<div class="receipt-row total"><span>TOTAL</span><span>${formatMoney(sale.total)}</span></div>${num(sale.returnedAmount) ? `<div class="receipt-row receipt-refund"><span>Refunded</span><span>− ${formatMoney(sale.returnedAmount)}</span></div>` : ""}<div class="receipt-rule"></div>${(sale.payments || []).map((p) => `<div class="receipt-row"><span>${esc(paymentLabel(p.method))}</span><span>${formatMoney(p.amount)}</span></div>`).join("")}${num(sale.tendered) > 0 ? `<div class="receipt-row"><span>Tendered</span><span>${formatMoney(sale.tendered)}</span></div><div class="receipt-row"><span>Change</span><span>${formatMoney(sale.change)}</span></div>` : ""}${sale.notes ? `<div class="receipt-rule"></div><p><strong>Note:</strong> ${esc(sale.notes)}</p>` : ""}<div class="receipt-rule"></div><div class="receipt-center"><p>${esc(business.receiptFooter || "Thank you.")}</p><p>Powered by MTECH Retail POS</p></div></div>`;
  }
  function openReceiptModal(sale) {
    openModal(
      "Payment successful",
      `${sale.receiptNo} has been saved`,
      `${receiptHTML(sale)}<div class="receipt-actions"><button class="button button-outline" data-action="print-current-receipt">${I("print")}Print</button><button class="button button-outline" data-action="download-current-receipt">${I("download")}Download PNG</button><button class="button button-outline" data-action="share-current-receipt" data-id="${sale.id}">${I("share")}Share</button><button class="button button-primary" data-action="close-modal">Done</button></div>`,
    );
    $("#printArea").innerHTML = receiptHTML(sale);
    state.currentReceipt = sale;
  }
  function printSale(id) {
    const sale = state.sales.find((s) => s.id === id);
    if (!sale) return;
    $("#printArea").innerHTML = receiptHTML(sale);
    state.currentReceipt = sale;
    setTimeout(() => window.print(), 50);
  }

  function receiptText(sale) {
    const business = state.business;
    const lines = [
      business.businessName || "Retail Shop",
      business.address || "",
      [business.phone, business.email].filter(Boolean).join(" · "),
      business.taxId ? `TIN / Registration: ${business.taxId}` : "",
      "",
      `Receipt: ${sale.receiptNo}`,
      `Date: ${formatDateTime(sale.createdAt)}`,
      `Customer: ${sale.customerName || "Walk-in customer"}`,
      settingEnabled("showReceiptCashier", true)
        ? `Cashier: ${sale.cashier || "Owner"}`
        : "",
      "",
      ...(sale.items || []).map(
        (item) =>
          `${item.name}${settingEnabled("showReceiptSku", true) && (item.sku || item.barcode) ? ` [${item.sku || item.barcode}]` : ""} — ${num(item.quantity)} × ${formatMoney(item.unitPrice)} = ${formatMoney(item.lineTotal || num(item.quantity) * num(item.unitPrice))}`,
      ),
      "",
      `Subtotal: ${formatMoney(sale.subtotal)}`,
      `Discount: ${formatMoney(sale.discount)}`,
      settingEnabled("showReceiptTax", true)
        ? `Tax: ${formatMoney(sale.tax)}`
        : "",
      `TOTAL: ${formatMoney(sale.total)}`,
      ...(sale.payments || []).map(
        (payment) =>
          `${paymentLabel(payment.method)}: ${formatMoney(payment.amount)}`,
      ),
      num(sale.tendered) > 0 ? `Tendered: ${formatMoney(sale.tendered)}` : "",
      num(sale.change) > 0 ? `Change: ${formatMoney(sale.change)}` : "",
      sale.status !== "completed" ? `Status: ${sale.status}` : "",
      sale.notes ? `Note: ${sale.notes}` : "",
      "",
      business.receiptFooter || "Thank you.",
      "Powered by MTECH Retail POS",
    ];
    return lines.filter((line, index) => line || lines[index - 1]).join("\n");
  }

  function wrapCanvasLines(context, text, maxWidth) {
    const words = String(text || "").split(/\s+/).filter(Boolean);
    const lines = [];
    let current = "";
    words.forEach((word) => {
      const candidate = current ? `${current} ${word}` : word;
      if (current && context.measureText(candidate).width > maxWidth) {
        lines.push(current);
        current = word;
      } else current = candidate;
    });
    if (current) lines.push(current);
    return lines.length ? lines : [""];
  }

  async function createReceiptImageBlob(sale) {
    const width = 720;
    const padding = 56;
    const measureCanvas = document.createElement("canvas");
    const measure = measureCanvas.getContext("2d");
    measure.font = "600 26px Arial, sans-serif";
    const itemLayouts = (sale.items || []).map((item) => ({
      item,
      lines: wrapCanvasLines(measure, item.name, width - padding * 2 - 180),
      code:
        settingEnabled("showReceiptSku", true) && (item.sku || item.barcode)
          ? item.sku || item.barcode
          : "",
    }));
    const height =
      900 +
      itemLayouts.reduce(
        (sum, layout) =>
          sum +
          70 +
          Math.max(0, layout.lines.length - 1) * 32 +
          (layout.code ? 26 : 0),
        0,
      ) +
      (sale.notes ? 80 : 0) +
      (sale.payments || []).length * 40;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    const accent = /^#[0-9a-f]{6}$/i.test(state.business.receiptAccent || "")
      ? state.business.receiptAccent
      : "#0f766e";
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.fillStyle = accent;
    context.fillRect(0, 0, width, 18);
    let y = 74;
    const center = (text, font, color = "#102421") => {
      context.font = font;
      context.fillStyle = color;
      context.textAlign = "center";
      context.fillText(String(text || ""), width / 2, y);
    };
    const pair = (label, value, bold = false) => {
      context.textAlign = "left";
      context.font = `${bold ? "700" : "500"} 24px Arial, sans-serif`;
      context.fillStyle = "#536762";
      context.fillText(label, padding, y);
      context.textAlign = "right";
      context.fillStyle = "#102421";
      context.fillText(value, width - padding, y);
      y += 38;
    };
    const rule = () => {
      context.strokeStyle = "#cbd9d6";
      context.setLineDash([10, 8]);
      context.beginPath();
      context.moveTo(padding, y);
      context.lineTo(width - padding, y);
      context.stroke();
      context.setLineDash([]);
      y += 32;
    };
    center(state.business.businessName || "Retail Shop", "700 38px Arial, sans-serif");
    y += 42;
    center(state.business.address || "", "500 22px Arial, sans-serif", "#536762");
    y += 30;
    center(
      [state.business.phone, state.business.email].filter(Boolean).join(" · "),
      "500 22px Arial, sans-serif",
      "#536762",
    );
    y += 30;
    if (state.business.taxId) {
      center(`TIN / Registration: ${state.business.taxId}`, "500 21px Arial, sans-serif", "#536762");
      y += 30;
    }
    if (sale.status !== "completed") {
      context.fillStyle = "#fff4e5";
      context.fillRect(width / 2 - 130, y - 20, 260, 42);
      center(String(sale.status).replaceAll("-", " ").toUpperCase(), "700 20px Arial, sans-serif", "#a34b00");
      y += 42;
    }
    rule();
    pair("Receipt", sale.receiptNo, true);
    pair("Date", formatDateTime(sale.createdAt));
    pair("Customer", sale.customerName || "Walk-in customer");
    if (settingEnabled("showReceiptCashier", true))
      pair("Cashier", sale.cashier || "Owner");
    rule();
    context.textAlign = "left";
    context.font = "700 22px Arial, sans-serif";
    context.fillStyle = "#536762";
    context.fillText("ITEMS", padding, y);
    y += 38;
    itemLayouts.forEach(({ item, lines, code }) => {
      context.textAlign = "left";
      context.fillStyle = "#102421";
      context.font = "600 26px Arial, sans-serif";
      lines.forEach((line, index) => {
        context.fillText(line, padding, y + index * 30);
      });
      context.textAlign = "right";
      context.font = "700 25px Arial, sans-serif";
      context.fillText(
        formatMoney(item.lineTotal || num(item.quantity) * num(item.unitPrice)),
        width - padding,
        y,
      );
      y += lines.length * 30;
      if (code) {
        context.textAlign = "left";
        context.font = "500 18px Arial, sans-serif";
        context.fillStyle = "#7b8c88";
        context.fillText(String(code), padding, y);
        y += 25;
      }
      context.textAlign = "left";
      context.font = "500 21px Arial, sans-serif";
      context.fillStyle = "#6c7d79";
      context.fillText(
        `${num(item.quantity)} × ${formatMoney(item.unitPrice)}`,
        padding,
        y,
      );
      y += 34;
    });
    rule();
    pair("Subtotal", formatMoney(sale.subtotal));
    pair("Discount", `− ${formatMoney(sale.discount)}`);
    if (settingEnabled("showReceiptTax", true))
      pair("Tax", formatMoney(sale.tax));
    context.fillStyle = accent;
    context.fillRect(padding - 12, y - 29, width - padding * 2 + 24, 58);
    context.fillStyle = "#ffffff";
    context.font = "700 30px Arial, sans-serif";
    context.textAlign = "left";
    context.fillText("TOTAL", padding, y + 9);
    context.textAlign = "right";
    context.fillText(formatMoney(sale.total), width - padding, y + 9);
    y += 68;
    (sale.payments || []).forEach((payment) =>
      pair(paymentLabel(payment.method), formatMoney(payment.amount)),
    );
    if (num(sale.tendered) > 0) pair("Tendered", formatMoney(sale.tendered));
    if (num(sale.change) > 0) pair("Change", formatMoney(sale.change), true);
    if (sale.notes) {
      rule();
      context.textAlign = "left";
      context.font = "500 21px Arial, sans-serif";
      context.fillStyle = "#536762";
      context.fillText(`Note: ${sale.notes}`, padding, y);
      y += 38;
    }
    rule();
    center(state.business.receiptFooter || "Thank you.", "600 23px Arial, sans-serif");
    y += 36;
    center("Powered by MTECH Retail POS", "500 19px Arial, sans-serif", "#7b8c88");
    return new Promise((resolve, reject) =>
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Could not create receipt image"))),
        "image/png",
      ),
    );
  }

  function downloadFileBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  async function downloadReceipt(sale) {
    const blob = await createReceiptImageBlob(sale);
    downloadFileBlob(blob, `${sale.receiptNo}-receipt.png`);
    toast("Receipt downloaded", `${sale.receiptNo} saved as a PNG image.`, "success");
  }

  async function downloadReceiptById(id) {
    const sale = state.sales.find((item) => item.id === id);
    if (sale) await downloadReceipt(sale);
  }

  async function downloadCurrentReceipt() {
    if (state.currentReceipt) await downloadReceipt(state.currentReceipt);
  }

  async function shareReceipt(sale) {
    const text = receiptText(sale);
    try {
      const blob = await createReceiptImageBlob(sale);
      const file = new File([blob], `${sale.receiptNo}-receipt.png`, {
        type: "image/png",
      });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `Receipt ${sale.receiptNo}`,
          text: `Receipt from ${state.business.businessName || "Retail Shop"}`,
          files: [file],
        });
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: `Receipt ${sale.receiptNo}`, text });
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        toast("Receipt copied", "Receipt details copied to the clipboard.", "success");
        return;
      }
      downloadFileBlob(blob, `${sale.receiptNo}-receipt.png`);
    } catch (error) {
      if (error.name !== "AbortError") throw error;
    }
  }

  async function shareReceiptById(id) {
    const sale = state.sales.find((item) => item.id === id);
    if (sale) await shareReceipt(sale);
  }

  async function shareCurrentReceipt() {
    if (state.currentReceipt) await shareReceipt(state.currentReceipt);
  }

  function openHoldSaleModal() {
    openModal(
      "Hold current sale",
      "Save this cart and resume it later",
      `<form data-form="hold-sale"><div class="field"><label>Reference name</label><input name="label" required placeholder="For example: John, counter 2, pickup order"></div><div class="field" style="margin-top:12px"><label>Notes</label><textarea name="notes">${esc(state.saleNotes)}</textarea></div><div class="form-actions"><button type="button" class="button button-outline" data-action="close-modal">Cancel</button><button class="button button-primary">${I("hold")}Hold sale</button></div></form>`,
    );
  }
  async function saveHeldSale(form) {
    const data = Object.fromEntries(new FormData(form));
    const record = {
      id: uid("hold"),
      label: data.label.trim(),
      notes: data.notes.trim(),
      cart: structuredClone(state.cart),
      customerId: state.selectedCustomerId,
      orderDiscountType: state.orderDiscountType,
      orderDiscountValue: state.orderDiscountValue,
      createdAt: nowISO(),
    };
    await DB.put("heldSales", record);
    state.cart = [];
    state.selectedCustomerId = "";
    state.orderDiscountValue = 0;
    closeModal();
    await refresh("pos");
    toast("Sale held", record.label, "success");
  }
  function openHeldSalesModal() {
    openModal(
      "Held sales",
      "Resume or remove parked carts",
      state.heldSales.length
        ? `<div class="list-stack" style="padding:0">${state.heldSales
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(
              (h) =>
                `<div class="list-row"><div class="list-main"><div class="list-icon">${I("hold")}</div><div class="list-copy"><strong>${esc(h.label)}</strong><span>${h.cart?.length || 0} products · ${formatDateTime(h.createdAt)}</span></div></div><div class="row-actions"><button class="mini-button" data-action="restore-held" data-id="${h.id}">${I("play")}</button><button class="mini-button danger" data-action="delete-held" data-id="${h.id}">${I("trash")}</button></div></div>`,
            )
            .join("")}</div>`
        : emptyState(
            "No held sales",
            "Use Hold on the POS to park a cart.",
            "hold",
          ),
    );
  }
  async function restoreHeldSale(id) {
    const record = state.heldSales.find((h) => h.id === id);
    if (!record) return;
    if (
      state.cart.length &&
      !confirm("Replace the current cart with this held sale?")
    )
      return;
    state.cart = structuredClone(record.cart || []);
    state.selectedCustomerId = record.customerId || "";
    state.orderDiscountType = record.orderDiscountType || "fixed";
    state.orderDiscountValue = num(record.orderDiscountValue);
    state.saleNotes = record.notes || "";
    await DB.remove("heldSales", id);
    closeModal();
    await loadData();
    navigate("pos");
    toast("Held sale restored", record.label, "success");
  }
  async function deleteHeldSale(id) {
    await DB.remove("heldSales", id);
    await loadData();
    openHeldSalesModal();
    toast("Held sale removed", "The parked cart was deleted.", "success");
  }

  function purchaseOrderLineHTML(item = {}) {
    return `<div class="line-item-row purchase-order-line" data-order-row data-line-id="${esc(item.id || uid("po-line"))}"><select class="product-select" data-field="productId" data-order-input required><option value="">Select product</option>${state.products.map((product) => `<option value="${product.id}" ${item.productId === product.id ? "selected" : ""}>${esc(product.name)} · ${esc(product.sku || product.barcode || "no code")}</option>`).join("")}</select><input data-field="quantity" data-order-input type="number" min="0.001" step="0.001" placeholder="Qty" value="${item.quantity || ""}" required><input data-field="unitCost" data-order-input type="number" min="0" step="0.01" placeholder="Unit cost" value="${item.unitCost || ""}" required><div class="line-total" data-order-line-total>${formatMoney(num(item.quantity) * num(item.unitCost))}</div><button type="button" class="mini-button danger" data-action="remove-purchase-order-line">${I("trash")}</button></div>`;
  }

  function openPurchaseOrderModal(order = null) {
    if (!state.products.length || !state.suppliers.length) {
      toast(
        "Products and suppliers required",
        "Add at least one product and one supplier before creating an order.",
        "warning",
      );
      return;
    }
    if (order && order.status !== "draft") {
      toast("Order is locked", "Only draft purchase orders can be edited.", "warning");
      return;
    }
    const lines = order?.items?.length ? order.items : [{}];
    openModal(
      order ? "Edit purchase order" : "New purchase order",
      "Create an order without changing stock until goods are received",
      `<form data-form="purchase-order"><input type="hidden" name="id" value="${esc(order?.id || "")}"><div class="form-grid three"><div class="field"><label>Supplier</label><select name="supplierId" required><option value="">Select supplier</option>${state.suppliers.map((supplier) => `<option value="${supplier.id}" ${order?.supplierId === supplier.id ? "selected" : ""}>${esc(supplier.name)}</option>`).join("")}</select></div><div class="field"><label>Order date</label><input type="date" name="orderDate" required value="${esc(order?.orderDate || dateInputValue())}"></div><div class="field"><label>Expected delivery</label><input type="date" name="expectedDate" value="${esc(order?.expectedDate || "")}"></div><div class="field"><label>Supplier quotation / reference</label><input name="reference" value="${esc(order?.reference || "")}"></div><div class="field full"><label>Delivery instructions</label><input name="notes" value="${esc(order?.notes || "")}" placeholder="Optional notes for this supplier order"></div></div><div class="form-section"><div class="page-toolbar"><div><h3 class="form-section-title">Products ordered</h3><p class="form-help">Stock remains unchanged until a delivery is received.</p></div><button type="button" class="button button-outline" data-action="add-purchase-order-line">${I("plus")}Add line</button></div><div class="line-items-editor"><div class="line-item-head purchase-order-line"><span>Product</span><span>Quantity</span><span>Unit cost</span><span>Line total</span><span></span></div><div id="purchaseOrderLines">${lines.map(purchaseOrderLineHTML).join("")}</div></div></div><div class="totals-box" id="purchaseOrderTotals"></div><div class="form-actions"><button type="button" class="button button-outline" data-action="close-modal">Cancel</button><button class="button button-outline" name="status" value="draft">${I("save")}Save draft</button><button class="button button-primary" name="status" value="ordered">${I("check")}Save and mark ordered</button></div></form>`,
      true,
    );
    updatePurchaseOrderTotals();
  }

  function addPurchaseOrderLine() {
    $("#purchaseOrderLines")?.insertAdjacentHTML(
      "beforeend",
      purchaseOrderLineHTML(),
    );
    updatePurchaseOrderTotals();
  }

  function removePurchaseOrderLine(button) {
    const rows = $$("[data-order-row]");
    if (rows.length <= 1) {
      toast("One line required", "A purchase order needs at least one product.", "warning");
      return;
    }
    button.closest("[data-order-row]")?.remove();
    updatePurchaseOrderTotals();
  }

  function purchaseOrderFormTotals() {
    const rows = $$("[data-order-row]").map((row) => ({
      id: row.dataset.lineId || uid("po-line"),
      productId: $('[data-field="productId"]', row).value,
      quantity: num($('[data-field="quantity"]', row).value),
      unitCost: num($('[data-field="unitCost"]', row).value),
      receivedQuantity: 0,
    }));
    return {
      rows,
      total: rows.reduce(
        (sum, row) => sum + row.quantity * row.unitCost,
        0,
      ),
    };
  }

  function updatePurchaseOrderTotals() {
    const node = $("#purchaseOrderTotals");
    if (!node) return;
    const totals = purchaseOrderFormTotals();
    $$("[data-order-row]").forEach((row) => {
      const quantity = num($('[data-field="quantity"]', row).value);
      const unitCost = num($('[data-field="unitCost"]', row).value);
      $("[data-order-line-total]", row).textContent = formatMoney(
        quantity * unitCost,
      );
    });
    node.innerHTML = `<div class="summary-row"><span>Order lines</span><strong>${totals.rows.filter((row) => row.productId).length}</strong></div><div class="summary-row total"><span>Purchase order value</span><strong>${formatMoney(totals.total)}</strong></div>`;
  }

  async function savePurchaseOrder(form, submitter) {
    const data = Object.fromEntries(new FormData(form));
    const totals = purchaseOrderFormTotals();
    const rows = totals.rows.filter((row) => row.productId && row.quantity > 0);
    if (!data.supplierId) throw new Error("Select a supplier");
    if (!rows.length) throw new Error("Add at least one product to the order");
    const duplicate = new Set();
    rows.forEach((row) => {
      if (duplicate.has(row.productId))
        throw new Error("The same product appears more than once");
      duplicate.add(row.productId);
    });
    const existing = state.purchaseOrders.find((order) => order.id === data.id);
    if (existing && existing.status !== "draft")
      throw new Error("Only draft purchase orders can be edited");
    const supplier = state.suppliers.find(
      (candidate) => candidate.id === data.supplierId,
    );
    const timestamp = nowISO();
    const status = submitter?.value === "ordered" ? "ordered" : "draft";
    const purchaseOrderNo =
      existing?.purchaseOrderNo ||
      (await DB.nextSequence("purchaseOrderSequence", "PO"));
    const record = {
      ...existing,
      id: existing?.id || uid("purchase-order"),
      purchaseOrderNo,
      supplierId: supplier.id,
      supplierName: supplier.name,
      orderDate: data.orderDate,
      expectedDate: data.expectedDate,
      reference: data.reference.trim(),
      notes: data.notes.trim(),
      items: rows.map((row) => {
        const product = state.products.find((item) => item.id === row.productId);
        return {
          ...row,
          name: product.name,
          sku: product.sku,
          receivedQuantity: num(
            existing?.items?.find((item) => item.id === row.id)?.receivedQuantity,
          ),
          lineTotal: row.quantity * row.unitCost,
        };
      }),
      total: totals.total,
      status,
      orderedAt: status === "ordered" ? timestamp : existing?.orderedAt || null,
      createdBy: existing?.createdBy || currentOperator(),
      createdAt: existing?.createdAt || timestamp,
      updatedAt: timestamp,
    };
    await DB.savePurchaseOrder(record);
    closeModal();
    await refresh("purchases");
    toast(
      status === "ordered" ? "Purchase order submitted" : "Draft order saved",
      `${purchaseOrderNo} · ${formatMoney(record.total)}`,
      "success",
    );
  }

  function openPurchaseOrderDetails(id) {
    const order = state.purchaseOrders.find((item) => item.id === id);
    if (!order) return;
    const ordered = (order.items || []).reduce(
      (sum, item) => sum + num(item.quantity),
      0,
    );
    const received = (order.items || []).reduce(
      (sum, item) => sum + num(item.receivedQuantity),
      0,
    );
    const canReceive =
      ["ordered", "partially-received"].includes(order.status) &&
      received < ordered;
    openModal(
      "Purchase order",
      `${order.purchaseOrderNo} · ${esc(order.supplierName)}`,
      `<div class="form-grid three"><div class="notice info"><div><strong>Status</strong><br>${statusBadge(order.status)}</div></div><div class="notice info"><div><strong>Expected</strong><br>${formatDate(order.expectedDate)}</div></div><div class="notice info"><div><strong>Progress</strong><br>${received} of ${ordered} units received</div></div></div><div class="table-wrap" style="margin-top:14px"><table class="data-table"><thead><tr><th>Product</th><th>Ordered</th><th>Received</th><th>Remaining</th><th>Cost</th><th>Total</th></tr></thead><tbody>${order.items.map((item) => `<tr><td><strong>${esc(item.name)}</strong><br><span class="table-subtext">${esc(item.sku || "")}</span></td><td>${num(item.quantity)}</td><td>${num(item.receivedQuantity)}</td><td><strong>${Math.max(0, num(item.quantity) - num(item.receivedQuantity))}</strong></td><td>${formatMoney(item.unitCost)}</td><td>${formatMoney(item.lineTotal)}</td></tr>`).join("")}</tbody></table></div><div class="totals-box"><div class="summary-row"><span>Reference</span><strong>${esc(order.reference || "—")}</strong></div><div class="summary-row total"><span>Order value</span><strong>${formatMoney(order.total)}</strong></div></div><div class="form-actions">${order.status === "draft" ? `<button class="button button-outline" data-action="edit-purchase-order" data-id="${order.id}">${I("edit")}Edit draft</button><button class="button button-primary" data-action="submit-purchase-order" data-id="${order.id}">${I("check")}Mark ordered</button>` : ""}${canReceive ? `<button class="button button-primary" data-action="receive-purchase-order" data-id="${order.id}">${I("truck")}Receive delivery</button>` : ""}<button class="button button-outline" data-action="close-modal">Close</button></div>`,
      true,
    );
  }

  function changePurchaseOrderStatus(id, status) {
    const order = state.purchaseOrders.find((item) => item.id === id);
    if (!order) return;
    confirmDialog(
      status === "ordered" ? "Mark purchase order as ordered" : "Cancel purchase order",
      status === "ordered"
        ? `${order.purchaseOrderNo} will be locked and ready for stock receiving.`
        : `Cancel the remaining quantities on ${order.purchaseOrderNo}? Stock already received will not be changed.`,
      async () => {
        await DB.updatePurchaseOrderStatus(order.id, status);
        await refresh("purchases");
        toast(
          status === "ordered" ? "Order marked as ordered" : "Order cancelled",
          order.purchaseOrderNo,
          status === "ordered" ? "success" : "warning",
        );
      },
      status === "ordered" ? "Mark ordered" : "Cancel order",
    );
  }

  function purchaseLineHTML(item = {}) {
    const max = num(item.maxQuantity);
    return `<div class="line-item-row" data-purchase-row data-order-item-id="${esc(item.orderItemId || "")}"><select class="product-select" data-field="productId" data-purchase-input required><option value="">Select product</option>${state.products.map((p) => `<option value="${p.id}" ${item.productId === p.id ? "selected" : ""}>${esc(p.name)} · stock ${num(p.stock)}</option>`).join("")}</select><input data-field="quantity" data-purchase-input type="number" min="0.001" ${max ? `max="${max}"` : ""} step="0.001" placeholder="Qty" value="${item.quantity || ""}" required><input data-field="unitCost" data-purchase-input type="number" min="0" step="0.01" placeholder="Unit cost" value="${item.unitCost || ""}" required><input class="batch-field" data-field="batchNo" placeholder="Batch" value="${esc(item.batchNo || "")}"><button type="button" class="mini-button danger" data-action="remove-purchase-line">${I("trash")}</button><input class="expiry-field" data-field="expiryDate" type="date" value="${esc(item.expiryDate || "")}" style="display:none"></div>`;
  }
  function openPurchaseModal(purchaseOrderId = "") {
    if (!state.products.length) {
      toast(
        "Products required",
        "Add products before receiving a purchase.",
        "warning",
      );
      return;
    }
    const order = state.purchaseOrders.find(
      (item) => item.id === purchaseOrderId,
    );
    const orderLines = order
      ? (order.items || [])
          .map((item) => ({
            productId: item.productId,
            orderItemId: item.id,
            quantity: Math.max(
              0,
              num(item.quantity) - num(item.receivedQuantity),
            ),
            maxQuantity: Math.max(
              0,
              num(item.quantity) - num(item.receivedQuantity),
            ),
            unitCost: item.unitCost,
          }))
          .filter((item) => item.quantity > 0)
      : [{}];
    if (order && !orderLines.length) {
      toast("Order already received", "No quantities remain on this order.", "info");
      return;
    }
    openModal(
      order ? "Receive purchase order" : "Receive supplier purchase",
      order
        ? `${order.purchaseOrderNo} · enter the quantities delivered now`
        : "Stock quantities increase when this purchase is saved",
      `<form data-form="purchase"><input type="hidden" name="purchaseOrderId" value="${esc(order?.id || "")}"><div class="form-grid three"><div class="field"><label>Supplier</label><select name="supplierId" required><option value="">Select supplier</option>${state.suppliers.map((s) => `<option value="${s.id}" ${order?.supplierId === s.id ? "selected" : ""}>${esc(s.name)}</option>`).join("")}</select></div><div class="field"><label>Purchase date</label><input type="date" name="date" required value="${dateInputValue()}"></div><div class="field"><label>Supplier invoice / reference</label><input name="reference" value="${esc(order?.reference || "")}"></div></div>${order ? `<div class="notice info" style="margin-top:13px">${I("info")}<div>Linked to <strong>${esc(order.purchaseOrderNo)}</strong>. You can receive a partial delivery; remaining quantities stay open.</div></div>` : ""}<div class="form-section"><div class="page-toolbar"><h3 class="form-section-title">Products received</h3>${order ? "" : `<button type="button" class="button button-outline" data-action="add-purchase-line">${I("plus")}Add line</button>`}</div><div class="line-items-editor"><div class="line-item-head"><span>Product</span><span>Quantity</span><span>Unit cost</span><span>Batch</span><span></span></div><div id="purchaseLines">${orderLines.map(purchaseLineHTML).join("")}</div></div></div><div class="form-grid" style="margin-top:14px"><div class="field"><label>Delivery discount</label><input data-purchase-input name="discount" type="number" min="0" step="0.01" value="0"></div><div class="field"><label>Tax amount</label><input data-purchase-input name="tax" type="number" min="0" step="0.01" value="0"></div><div class="field"><label>Amount paid now</label><input data-purchase-input name="paid" type="number" min="0" step="0.01" value="0"></div><div class="field"><label>Payment method</label><select name="paymentMethod"><option value="cash">Cash</option><option value="mobile-money">Mobile Money</option><option value="card">Card</option><option value="bank-transfer">Bank transfer</option><option value="credit">Supplier credit</option></select></div><div class="field full"><label>Receiving notes</label><textarea name="notes"></textarea></div></div><div class="totals-box" id="purchaseTotals"></div><div class="form-actions"><button type="button" class="button button-outline" data-action="close-modal">Cancel</button><button class="button button-primary">${I("truck")}Receive stock</button></div></form>`,
      true,
    );
    updatePurchaseTotals();
  }
  function addPurchaseLine() {
    const container = $("#purchaseLines");
    if (container)
      container.insertAdjacentHTML("beforeend", purchaseLineHTML());
  }
  function removePurchaseLine(button) {
    const rows = $$("[data-purchase-row]");
    if (rows.length <= 1) {
      toast(
        "One line required",
        "A purchase must contain at least one product.",
        "warning",
      );
      return;
    }
    button.closest("[data-purchase-row]")?.remove();
    updatePurchaseTotals();
  }
  function purchaseFormTotals() {
    const rows = $$("[data-purchase-row]").map((row) => ({
      orderItemId: row.dataset.orderItemId || "",
      productId: $('[data-field="productId"]', row).value,
      quantity: num($('[data-field="quantity"]', row).value),
      unitCost: num($('[data-field="unitCost"]', row).value),
      batchNo: $('[data-field="batchNo"]', row).value,
      expiryDate: $('[data-field="expiryDate"]', row)?.value || "",
    }));
    const form = $('form[data-form="purchase"]');
    const subtotal = rows.reduce((s, r) => s + r.quantity * r.unitCost, 0);
    const discount = num(form?.elements.discount.value);
    const tax = num(form?.elements.tax.value);
    const total = Math.max(0, subtotal - discount + tax);
    const paid = num(form?.elements.paid.value);
    return {
      rows,
      subtotal,
      discount,
      tax,
      total,
      paid,
      balance: Math.max(0, total - paid),
    };
  }
  function updatePurchaseTotals() {
    const node = $("#purchaseTotals");
    if (!node) return;
    const t = purchaseFormTotals();
    node.innerHTML = `<div class="summary-row"><span>Subtotal</span><strong>${formatMoney(t.subtotal)}</strong></div><div class="summary-row"><span>Discount</span><strong>− ${formatMoney(t.discount)}</strong></div><div class="summary-row"><span>Tax</span><strong>${formatMoney(t.tax)}</strong></div><div class="summary-row total"><span>Total</span><strong>${formatMoney(t.total)}</strong></div><div class="summary-row"><span>Supplier balance</span><strong>${formatMoney(t.balance)}</strong></div>`;
  }
  async function savePurchase(form) {
    const data = Object.fromEntries(new FormData(form));
    const totals = purchaseFormTotals();
    const rows = totals.rows.filter((r) => r.productId && r.quantity > 0);
    if (!data.supplierId) throw new Error("Select a supplier");
    if (!rows.length) throw new Error("Add at least one purchase item");
    if (totals.paid > totals.total)
      throw new Error("Amount paid cannot exceed the purchase total");
    const duplicate = new Set();
    for (const row of rows) {
      if (duplicate.has(row.productId))
        throw new Error("The same product appears more than once");
      duplicate.add(row.productId);
    }
    const supplier = state.suppliers.find((s) => s.id === data.supplierId);
    const purchaseNo = await DB.nextSequence("purchaseSequence", "PUR");
    const createdAt = nowISO();
    const purchase = {
      id: uid("purchase"),
      purchaseNo,
      purchaseOrderId: data.purchaseOrderId || "",
      purchaseOrderNo:
        state.purchaseOrders.find((order) => order.id === data.purchaseOrderId)
          ?.purchaseOrderNo || "",
      supplierId: supplier.id,
      supplierName: supplier.name,
      date: data.date,
      reference: data.reference.trim(),
      items: rows.map((row) => {
        const p = state.products.find((x) => x.id === row.productId);
        return {
          ...row,
          name: p.name,
          sku: p.sku,
          lineTotal: row.quantity * row.unitCost,
        };
      }),
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
      paid: totals.paid,
      balance: totals.balance,
      paymentMethod: data.paymentMethod,
      status:
        totals.balance <= 0 ? "paid" : totals.paid > 0 ? "partial" : "due",
      notes: data.notes.trim(),
      registerSessionId: openSession()?.id || "",
      createdAt,
    };
    await DB.receivePurchase(purchase);
    closeModal();
    await refresh("purchases");
    toast("Purchase received", `${purchaseNo} · stock updated`, "success");
  }
  function openPurchaseDetails(id) {
    const p = state.purchases.find((x) => x.id === id);
    if (!p) return;
    openModal(
      "Purchase details",
      p.purchaseNo,
      `<div class="form-grid three"><div class="notice info"><div><strong>Supplier</strong><br>${esc(p.supplierName)}</div></div><div class="notice info"><div><strong>Date</strong><br>${formatDate(p.date)}</div></div><div class="notice info"><div><strong>Status</strong><br>${esc(p.status)}</div></div></div><div class="table-wrap" style="margin-top:14px"><table class="data-table"><thead><tr><th>Product</th><th>Quantity</th><th>Cost</th><th>Total</th></tr></thead><tbody>${p.items.map((i) => `<tr><td><strong>${esc(i.name)}</strong></td><td>${num(i.quantity)}</td><td>${formatMoney(i.unitCost)}</td><td>${formatMoney(i.lineTotal)}</td></tr>`).join("")}</tbody></table></div><div class="totals-box"><div class="summary-row"><span>Total</span><strong>${formatMoney(p.total)}</strong></div><div class="summary-row"><span>Paid</span><strong>${formatMoney(p.paid)}</strong></div><div class="summary-row total"><span>Balance</span><strong>${formatMoney(p.balance)}</strong></div></div>`,
      true,
    );
  }

  function openSupplierModal(supplier = null) {
    openModal(
      supplier ? "Edit supplier" : "Add supplier",
      "Contact and account information",
      `<form data-form="supplier"><input type="hidden" name="id" value="${esc(supplier?.id || "")}"><div class="form-grid"><div class="field full"><label>Supplier name</label><input name="name" required value="${esc(supplier?.name || "")}"></div><div class="field"><label>Phone</label><input name="phone" value="${esc(supplier?.phone || "")}"></div><div class="field"><label>Email</label><input type="email" name="email" value="${esc(supplier?.email || "")}"></div><div class="field"><label>Tax / registration number</label><input name="taxId" value="${esc(supplier?.taxId || "")}"></div><div class="field full"><label>Address</label><input name="address" value="${esc(supplier?.address || "")}"></div><div class="field full"><label>Notes</label><textarea name="notes">${esc(supplier?.notes || "")}</textarea></div></div><div class="form-actions"><button type="button" class="button button-outline" data-action="close-modal">Cancel</button><button class="button button-primary">Save supplier</button></div></form>`,
    );
  }
  async function saveSupplier(form) {
    const data = Object.fromEntries(new FormData(form));
    const existing = state.suppliers.find((s) => s.id === data.id);
    const timestamp = nowISO();
    const record = {
      ...existing,
      id: data.id || uid("supplier"),
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      address: data.address.trim(),
      taxId: data.taxId.trim(),
      notes: data.notes.trim(),
      balance: num(existing?.balance),
      totalPurchases: num(existing?.totalPurchases),
      lastPurchaseAt: existing?.lastPurchaseAt || null,
      createdAt: existing?.createdAt || timestamp,
      updatedAt: timestamp,
    };
    await DB.put("suppliers", record);
    closeModal();
    await refresh("suppliers");
    toast("Supplier saved", record.name, "success");
  }
  function openSupplierDetails(id) {
    const s = state.suppliers.find((x) => x.id === id);
    if (!s) return;
    const purchases = state.purchases.filter((p) => p.supplierId === id);
    const payments = state.supplierPayments.filter((p) => p.supplierId === id);
    openModal(
      "Supplier account",
      s.name,
      `<div class="form-grid three"><div class="notice info"><div><strong>Outstanding</strong><br>${formatMoney(s.balance)}</div></div><div class="notice info"><div><strong>Total purchases</strong><br>${formatMoney(s.totalPurchases)}</div></div><div class="notice info"><div><strong>Contact</strong><br>${esc(s.phone || s.email || "Not provided")}</div></div></div><h3 class="form-section-title" style="margin-top:16px">Recent purchases</h3>${
        purchases.length
          ? `<div class="list-stack" style="padding:0">${purchases
              .slice(0, 6)
              .map(
                (p) =>
                  `<div class="list-row"><div class="list-copy"><strong>${esc(p.purchaseNo)}</strong><span>${formatDate(p.date)}</span></div><div class="list-value"><strong>${formatMoney(p.total)}</strong><span>${esc(p.status)}</span></div></div>`,
              )
              .join("")}</div>`
          : emptyState(
              "No purchases",
              "This supplier has no purchase history.",
              "truck",
            )
      }<h3 class="form-section-title" style="margin-top:16px">Payments</h3>${
        payments.length
          ? `<div class="list-stack" style="padding:0">${payments
              .slice(0, 6)
              .map(
                (p) =>
                  `<div class="list-row"><div class="list-copy"><strong>${formatMoney(p.amount)}</strong><span>${formatDate(p.date)}</span></div><div class="list-value"><span>${esc(paymentLabel(p.paymentMethod))}</span></div></div>`,
              )
              .join("")}</div>`
          : emptyState(
              "No payments",
              "Supplier payments will appear here.",
              "money",
            )
      }`,
      true,
    );
  }
  function openSupplierPaymentModal(id) {
    const s = state.suppliers.find((x) => x.id === id);
    if (!s) return;
    openModal(
      "Pay supplier",
      `${s.name} · balance ${formatMoney(s.balance)}`,
      `<form data-form="supplier-payment"><input type="hidden" name="supplierId" value="${s.id}"><div class="form-grid"><div class="field"><label>Amount</label><input type="number" name="amount" min="0.01" step="0.01" max="${num(s.balance) || ""}" required></div><div class="field"><label>Payment method</label><select name="paymentMethod"><option value="cash">Cash</option><option value="mobile-money">Mobile Money</option><option value="card">Card</option><option value="bank-transfer">Bank transfer</option></select></div><div class="field"><label>Date</label><input type="date" name="date" value="${dateInputValue()}" required></div><div class="field"><label>Reference / note</label><input name="note"></div></div><div class="form-actions"><button type="button" class="button button-outline" data-action="close-modal">Cancel</button><button class="button button-primary">Record payment</button></div></form>`,
    );
  }
  async function saveSupplierPayment(form) {
    const data = Object.fromEntries(new FormData(form));
    const supplier = state.suppliers.find((s) => s.id === data.supplierId);
    if (num(data.amount) > num(supplier.balance) && num(supplier.balance) > 0)
      throw new Error("Payment exceeds supplier balance");
    const payment = {
      id: uid("spay"),
      supplierId: data.supplierId,
      amount: num(data.amount),
      paymentMethod: data.paymentMethod,
      date: data.date,
      note: data.note.trim(),
      registerSessionId: openSession()?.id || "",
      createdAt: nowISO(),
    };
    await DB.recordSupplierPayment(payment);
    closeModal();
    await refresh("suppliers");
    toast("Supplier payment recorded", formatMoney(payment.amount), "success");
  }

  function openCustomerModal(customer = null) {
    openModal(
      customer ? "Edit customer" : "Add customer",
      "Contact details and credit controls",
      `<form data-form="customer"><input type="hidden" name="id" value="${esc(customer?.id || "")}"><div class="form-grid"><div class="field full"><label>Customer name</label><input name="name" required value="${esc(customer?.name || "")}"></div><div class="field"><label>Phone</label><input name="phone" value="${esc(customer?.phone || "")}"></div><div class="field"><label>Email</label><input type="email" name="email" value="${esc(customer?.email || "")}"></div><div class="field"><label>Credit limit</label><input type="number" name="creditLimit" min="0" step="0.01" value="${num(customer?.creditLimit)}"></div><div class="field full"><label>Address</label><input name="address" value="${esc(customer?.address || "")}"></div><div class="field full"><label>Notes</label><textarea name="notes">${esc(customer?.notes || "")}</textarea></div></div><div class="form-actions"><button type="button" class="button button-outline" data-action="close-modal">Cancel</button><button class="button button-primary">Save customer</button></div></form>`,
    );
  }
  async function saveCustomer(form) {
    const data = Object.fromEntries(new FormData(form));
    const existing = state.customers.find((c) => c.id === data.id);
    const timestamp = nowISO();
    const record = {
      ...existing,
      id: data.id || uid("cust"),
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      address: data.address.trim(),
      creditLimit: num(data.creditLimit),
      notes: data.notes.trim(),
      balance: num(existing?.balance),
      totalPurchases: num(existing?.totalPurchases),
      purchaseCount: num(existing?.purchaseCount),
      lastPurchaseAt: existing?.lastPurchaseAt || null,
      createdAt: existing?.createdAt || timestamp,
      updatedAt: timestamp,
    };
    await DB.put("customers", record);
    closeModal();
    await refresh("customers");
    toast("Customer saved", record.name, "success");
  }
  function openCustomerDetails(id) {
    const c = state.customers.find((x) => x.id === id);
    if (!c) return;
    const sales = state.sales.filter((s) => s.customerId === id);
    const payments = state.customerPayments
      .filter((p) => p.customerId === id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    openModal(
      "Customer account",
      c.name,
      `<div class="form-grid three"><div class="notice info"><div><strong>Credit balance</strong><br>${formatMoney(c.balance)}</div></div><div class="notice info"><div><strong>Lifetime purchases</strong><br>${formatMoney(c.totalPurchases)}</div></div><div class="notice info"><div><strong>Credit limit</strong><br>${c.creditLimit ? formatMoney(c.creditLimit) : "Not configured"}</div></div></div><h3 class="form-section-title" style="margin-top:16px">Recent sales</h3>${
        sales.length
          ? `<div class="list-stack" style="padding:0">${sales
              .slice(0, 6)
              .map(
                (s) =>
                  `<div class="list-row"><div class="list-copy"><strong>${esc(s.receiptNo)}</strong><span>${formatDateTime(s.createdAt)}</span></div><div class="list-value"><strong>${formatMoney(s.total)}</strong><span>${esc(s.status)}</span></div></div>`,
              )
              .join("")}</div>`
          : emptyState(
              "No customer sales",
              "Sales assigned to this customer will appear here.",
              "receipt",
            )
      }<h3 class="form-section-title" style="margin-top:16px">Account payments</h3>${
        payments.length
          ? `<div class="list-stack" style="padding:0">${payments
              .slice(0, 8)
              .map(
                (p) =>
                  `<div class="list-row"><div class="list-copy"><strong>${formatMoney(p.amount)}</strong><span>${formatDate(p.date)} · ${esc(paymentLabel(p.paymentMethod))}</span></div><div class="list-value"><span>${esc(p.note || "Payment")}</span></div></div>`,
              )
              .join("")}</div>`
          : emptyState(
              "No payments",
              "Customer account payments appear here.",
              "money",
            )
      }`,
      true,
    );
  }
  function openCustomerPaymentModal(id) {
    const c = state.customers.find((x) => x.id === id);
    if (!c) return;
    openModal(
      "Receive customer payment",
      `${c.name} · owes ${formatMoney(c.balance)}`,
      `<form data-form="customer-payment"><input type="hidden" name="customerId" value="${c.id}"><div class="form-grid"><div class="field"><label>Amount received</label><input type="number" name="amount" min="0.01" step="0.01" max="${num(c.balance) || ""}" required></div><div class="field"><label>Payment method</label><select name="paymentMethod"><option value="cash">Cash</option><option value="mobile-money">Mobile Money</option><option value="card">Card</option><option value="bank-transfer">Bank transfer</option></select></div><div class="field"><label>Date</label><input type="date" name="date" value="${dateInputValue()}" required></div><div class="field"><label>Note</label><input name="note"></div></div><div class="form-actions"><button type="button" class="button button-outline" data-action="close-modal">Cancel</button><button class="button button-primary">Record payment</button></div></form>`,
    );
  }
  async function saveCustomerPayment(form) {
    const data = Object.fromEntries(new FormData(form));
    const customer = state.customers.find((c) => c.id === data.customerId);
    if (num(data.amount) > num(customer.balance) && num(customer.balance) > 0)
      throw new Error("Payment exceeds the customer balance");
    const payment = {
      id: uid("cpay"),
      customerId: data.customerId,
      amount: num(data.amount),
      paymentMethod: data.paymentMethod,
      date: data.date,
      note: data.note.trim(),
      registerSessionId: openSession()?.id || "",
      createdAt: nowISO(),
    };
    await DB.recordCustomerPayment(payment);
    closeModal();
    await refresh("customers");
    toast("Customer payment received", formatMoney(payment.amount), "success");
  }

  function openExpenseModal(expense = null) {
    if (
      expense &&
      (expense.paymentStatus === "paid" ||
        ["pending", "rejected"].includes(expense.approvalStatus) ||
        expense.status === "voided")
    ) {
      openExpenseDetails(expense.id);
      return;
    }
    state.expenseReceiptDraft = safeImageData(expense?.receiptData);
    openModal(
      expense ? "Edit expense" : "Add expense",
      "Cost, due date, payment, approval and receipt evidence",
      `<form data-form="expense" class="expense-editor"><input type="hidden" name="id" value="${esc(expense?.id || "")}"><div class="expense-form-layout"><div><div class="form-section-block"><h3>Expense identity</h3><div class="form-grid three"><div class="field"><label>Expense date</label><input type="date" name="date" required value="${esc(expense?.date || dateInputValue())}"></div><div class="field"><label>Due date</label><input type="date" name="dueDate" value="${esc(expense?.dueDate || expense?.date || dateInputValue())}"></div><div class="field"><label>Category</label><select name="category">${EXPENSE_CATEGORIES.map((category) => `<option ${expense?.category === category ? "selected" : ""}>${esc(category)}</option>`).join("")}</select></div><div class="field"><label>Vendor / payee</label><input name="vendor" value="${esc(expense?.vendor || "")}" placeholder="Who receives the payment?"></div><div class="field"><label>Invoice / reference</label><input name="reference" value="${esc(expense?.reference || "")}" placeholder="Invoice, bill or transaction ID"></div><div class="field"><label>Recurrence</label><select name="recurrence"><option value="none">One-time</option>${["weekly", "monthly", "quarterly", "annually"].map((value) => `<option value="${value}" ${expense?.recurrence === value ? "selected" : ""}>${value[0].toUpperCase() + value.slice(1)}</option>`).join("")}</select></div><div class="field full"><label>Description</label><input name="description" required value="${esc(expense?.description || "")}" placeholder="What was this expense for?"></div><div class="field full"><label>Internal notes</label><textarea name="notes" placeholder="Optional context for the audit record">${esc(expense?.notes || "")}</textarea></div></div></div><div class="form-section-block"><h3>Amount and payment</h3><div class="form-grid three"><div class="field"><label>Subtotal</label><input type="number" name="subtotal" data-expense-amount min="0.01" step="0.01" required value="${num(expense?.subtotal || expense?.amount) || ""}"></div><div class="field"><label>Tax / VAT</label><input type="number" name="taxAmount" data-expense-amount min="0" step="0.01" value="${num(expense?.taxAmount)}"></div><div class="field"><label>Total</label><input id="expenseTotalDisplay" value="${formatMoney(expense?.amount || 0)}" disabled></div><div class="field"><label>Payment state</label><select name="paymentStatus"><option value="unpaid" ${expense?.paymentStatus === "unpaid" ? "selected" : ""}>Unpaid / due</option><option value="paid" ${!expense || expense?.paymentStatus === "paid" ? "selected" : ""}>Paid now</option></select></div><div class="field"><label>Payment method</label><select name="paymentMethod"><option value="cash" ${!expense || expense?.paymentMethod === "cash" ? "selected" : ""}>Cash</option><option value="mobile-money" ${expense?.paymentMethod === "mobile-money" ? "selected" : ""}>Mobile Money</option><option value="card" ${expense?.paymentMethod === "card" ? "selected" : ""}>Card</option><option value="bank-transfer" ${expense?.paymentMethod === "bank-transfer" ? "selected" : ""}>Bank transfer</option><option value="credit" ${expense?.paymentMethod === "credit" ? "selected" : ""}>Supplier credit</option></select></div><div class="field"><label>Payment reference</label><input name="paymentReference" value="${esc(expense?.paymentReference || "")}" placeholder="Optional transaction reference"></div><div class="field full"><label>Recorded / requested by</label><input name="requestedBy" required value="${esc(expense?.requestedBy || currentOperator())}"></div></div><div class="expense-total-strip"><span>Expense total</span><strong id="expenseTotalText">${formatMoney(expense?.amount || 0)}</strong><small>${settingEnabled("expenseApprovalEnabled", false) ? `Approval required from ${formatMoney(state.business.expenseApprovalThreshold)}` : "Approval threshold is currently disabled"}</small></div></div></div><aside class="expense-evidence-column"><div class="image-upload-card expense-receipt-card" id="expenseReceiptDropzone"><div class="expense-receipt-preview" id="expenseReceiptPreview"></div><div class="image-upload-actions"><label class="button button-primary" for="expenseReceiptInput">${I("upload")}Attach receipt</label><label class="button button-outline" for="expenseReceiptCamera">${I("camera")}Take photo</label><button class="button button-ghost danger-text" type="button" id="removeExpenseReceipt" data-action="remove-expense-receipt" hidden>${I("trash")}Remove</button></div><p id="expenseReceiptStatus">JPG, PNG or WebP · optimized for offline storage</p><input type="file" id="expenseReceiptInput" accept="image/*" hidden><input type="file" id="expenseReceiptCamera" accept="image/*" capture="environment" hidden></div><div class="notice info">${I("info")}<div><strong>Audit-ready evidence</strong><br>The receipt image stays with the expense in backups and on this device.</div></div>${settingEnabled("expenseApprovalEnabled", false) ? `<div class="notice warning">${I("lock")}<div>Expenses at or above ${formatMoney(state.business.expenseApprovalThreshold)} enter the manager approval queue before affecting cash or reports.</div></div>` : ""}</aside></div><div class="form-actions"><button type="button" class="button button-outline" data-action="close-modal">Cancel</button><button class="button button-primary">${I("save")}Save expense</button></div></form>`,
      true,
    );
    bindExpenseReceiptUploader();
    updateExpenseTotals();
  }

  function updateExpenseReceiptPreview(message = "") {
    const preview = $("#expenseReceiptPreview");
    if (!preview) return;
    const image = safeImageData(state.expenseReceiptDraft);
    preview.classList.toggle("has-image", Boolean(image));
    preview.innerHTML = image
      ? `<img src="${image}" alt="Expense receipt preview">`
      : `<div class="image-placeholder-art">${I("receipt")}<strong>No receipt attached</strong><span>Add a bill, invoice or payment slip</span></div>`;
    const remove = $("#removeExpenseReceipt");
    if (remove) remove.hidden = !image;
    const status = $("#expenseReceiptStatus");
    if (status && message) status.textContent = message;
  }

  async function processExpenseReceiptFile(file) {
    if (!file) return;
    state.expenseReceiptBusy = true;
    $("#expenseReceiptDropzone")?.classList.add("is-processing");
    try {
      const optimized = await optimizeProductImage(file);
      state.expenseReceiptDraft = optimized.dataUrl;
      updateExpenseReceiptPreview(
        `${optimized.width} × ${optimized.height} · ${Math.max(1, Math.round(optimized.bytes / 1024))} KB`,
      );
      toast("Receipt attached", "The evidence image is ready to save.", "success");
    } catch (error) {
      updateExpenseReceiptPreview(error.message);
      toast("Receipt upload failed", error.message, "error");
    } finally {
      state.expenseReceiptBusy = false;
      $("#expenseReceiptDropzone")?.classList.remove("is-processing");
      ["expenseReceiptInput", "expenseReceiptCamera"].forEach((id) => {
        const input = $(`#${id}`);
        if (input) input.value = "";
      });
    }
  }

  function bindExpenseReceiptUploader() {
    const dropzone = $("#expenseReceiptDropzone");
    [$("#expenseReceiptInput"), $("#expenseReceiptCamera")].forEach((input) =>
      input?.addEventListener("change", () =>
        processExpenseReceiptFile(input.files?.[0]),
      ),
    );
    if (dropzone) {
      ["dragenter", "dragover"].forEach((name) =>
        dropzone.addEventListener(name, (event) => {
          event.preventDefault();
          dropzone.classList.add("is-dragging");
        }),
      );
      ["dragleave", "drop"].forEach((name) =>
        dropzone.addEventListener(name, (event) => {
          event.preventDefault();
          dropzone.classList.remove("is-dragging");
        }),
      );
      dropzone.addEventListener("drop", (event) =>
        processExpenseReceiptFile(event.dataTransfer?.files?.[0]),
      );
    }
    updateExpenseReceiptPreview();
  }

  function removeExpenseReceiptDraft() {
    state.expenseReceiptDraft = "";
    updateExpenseReceiptPreview("Receipt removed · save to apply the change");
  }

  function updateExpenseTotals() {
    const form = $('form[data-form="expense"]');
    if (!form) return;
    const total = num(form.elements.subtotal.value) + num(form.elements.taxAmount.value);
    const display = $("#expenseTotalDisplay");
    const text = $("#expenseTotalText");
    if (display) display.value = formatMoney(total);
    if (text) text.textContent = formatMoney(total);
  }

  async function saveExpense(form) {
    const data = Object.fromEntries(new FormData(form));
    const previous = state.expenses.find((e) => e.id === data.id);
    if (state.expenseReceiptBusy)
      throw new Error("Wait for the receipt image to finish processing");
    if (settingEnabled("requireExpenseReceipt", false) && !state.expenseReceiptDraft)
      throw new Error("Attach receipt evidence before saving this expense");
    const subtotal = num(data.subtotal);
    const taxAmount = num(data.taxAmount);
    const total = subtotal + taxAmount;
    if (total <= 0) throw new Error("Expense total must be greater than zero");
    const paymentStatus = data.paymentStatus === "unpaid" ? "unpaid" : "paid";
    const threshold = Math.max(0, num(state.business.expenseApprovalThreshold));
    const requiresApproval =
      settingEnabled("expenseApprovalEnabled", false) &&
      total >= threshold &&
      previous?.approvalStatus !== "approved";
    if (
      paymentStatus === "paid" &&
      data.paymentMethod === "cash" &&
      !requiresApproval &&
      !openSession()
    )
      throw new Error("Open the cash register before recording a paid cash expense");
    const timestamp = nowISO();
    const expenseNo =
      previous?.expenseNo || (await DB.nextSequence("expenseSequence", "EXP"));
    const approvalStatus = requiresApproval
      ? "pending"
      : previous?.approvalStatus === "approved"
        ? "approved"
        : "not-required";
    const record = {
      ...previous,
      id: data.id || uid("expense"),
      expenseNo,
      date: data.date,
      dueDate: data.dueDate,
      category: data.category,
      vendor: data.vendor.trim(),
      reference: data.reference.trim(),
      description: data.description.trim(),
      notes: data.notes.trim(),
      recurrence: data.recurrence,
      subtotal,
      taxAmount,
      amount: total,
      paymentStatus,
      paymentMethod: data.paymentMethod,
      paymentReference: data.paymentReference.trim(),
      requestedBy: data.requestedBy.trim(),
      approvalStatus,
      status: requiresApproval ? "pending-approval" : paymentStatus,
      receiptData: safeImageData(state.expenseReceiptDraft),
      registerSessionId:
        paymentStatus === "paid" && data.paymentMethod === "cash"
          ? openSession()?.id || previous?.registerSessionId || ""
          : "",
      createdAt: previous?.createdAt || timestamp,
      updatedAt: timestamp,
    };
    let approvalRequest = null;
    if (requiresApproval) {
      const approvalNo = await DB.nextSequence("approvalSequence", "APR");
      approvalRequest = {
        id: uid("approval"),
        approvalNo,
        type: "expense",
        expenseId: record.id,
        amount: record.amount,
        reason: `${record.category} · ${record.description}`,
        notes: record.notes,
        requestedBy: record.requestedBy,
        requestedAt: timestamp,
        payload: { expenseId: record.id },
      };
      record.approvalId = approvalRequest.id;
    }
    await DB.saveExpense(record, previous, approvalRequest);
    closeModal();
    await refresh("expenses");
    toast(
      requiresApproval ? "Expense sent for approval" : "Expense saved",
      requiresApproval
        ? `${record.expenseNo} will not affect cash until approved.`
        : record.description,
      requiresApproval ? "warning" : "success",
    );
  }

  function openExpenseDetails(id) {
    const expense = state.expenses.find((item) => item.id === id);
    if (!expense) return;
    const status = expenseDisplayStatus(expense);
    const approval = state.approvalRequests.find(
      (request) => request.expenseId === expense.id,
    );
    const receipt = safeImageData(expense.receiptData)
      ? `<div class="expense-detail-receipt"><img src="${safeImageData(expense.receiptData)}" alt="Receipt for ${esc(expense.expenseNo)}"></div>`
      : `<div class="expense-detail-no-receipt">${I("receipt")}<span>No receipt evidence attached</span></div>`;
    openModal(
      "Expense record",
      `${expense.expenseNo || "Legacy expense"} · ${expense.vendor || expense.category}`,
      `<div class="expense-detail-layout"><div><div class="approval-audit expense-audit"><div><span>Status</span>${statusBadge(status)}</div><div><span>Total</span><strong>${formatMoney(expense.amount)}</strong></div><div><span>Vendor</span><strong>${esc(expense.vendor || "—")}</strong></div><div><span>Category</span><strong>${esc(expense.category)}</strong></div><div><span>Expense date</span><strong>${formatDate(expense.date)}</strong></div><div><span>Due date</span><strong>${formatDate(expense.dueDate)}</strong></div><div><span>Payment</span><strong>${esc(paymentLabel(expense.paymentMethod))}</strong><small>${esc(expense.paymentReference || "No reference")}</small></div><div><span>Recorded by</span><strong>${esc(expense.requestedBy || "—")}</strong><small>${formatDateTime(expense.createdAt)}</small></div></div><div class="breakdown-list expense-detail-totals"><div class="breakdown-row"><span>Subtotal</span><strong>${formatMoney(expense.subtotal)}</strong></div><div class="breakdown-row"><span>Tax / VAT</span><strong>${formatMoney(expense.taxAmount)}</strong></div><div class="breakdown-row total"><span>Total</span><strong>${formatMoney(expense.amount)}</strong></div></div><div class="notice info"><div><strong>${esc(expense.description)}</strong><br>${esc(expense.notes || "No additional notes")}</div></div>${approval ? `<button class="approval-link-card" data-action="view-approval" data-id="${approval.id}">${I("lock")}<span><strong>${esc(approval.approvalNo)} · ${approval.status}</strong><small>Open the complete manager decision record</small></span>${I("arrowRight")}</button>` : ""}</div>${receipt}</div><div class="form-actions">${status === "pending-approval" && approval ? `<button class="button button-primary" data-action="review-approval" data-decision="approve" data-id="${approval.id}">${I("lock")}Review approval</button>` : ""}${["unpaid", "overdue"].includes(status) ? `<button class="button button-primary" data-action="pay-expense" data-id="${expense.id}">${I("money")}Mark paid</button>` : ""}${expense.status !== "voided" && expense.approvalStatus !== "pending" && expense.status !== "rejected" ? `<button class="button button-danger" data-action="void-expense" data-id="${expense.id}">${I("close")}Void record</button>` : ""}<button class="button button-outline" data-action="close-modal">Close</button></div>`,
      true,
    );
  }

  function openExpensePaymentModal(id) {
    const expense = state.expenses.find((item) => item.id === id);
    if (!expense || expense.paymentStatus === "paid") return;
    openModal(
      "Pay expense",
      `${expense.expenseNo} · ${formatMoney(expense.amount)}`,
      `<form data-form="expense-payment"><input type="hidden" name="expenseId" value="${expense.id}"><div class="notice info">${I("wallet")}<div><strong>${esc(expense.vendor || expense.description)}</strong><br>This payment will update the expense status${openSession() ? " and the current cash register when paid in cash" : ". Open a register before selecting cash"}.</div></div><div class="form-grid" style="margin-top:13px"><div class="field"><label>Payment date</label><input type="date" name="paymentDate" required value="${dateInputValue()}"></div><div class="field"><label>Payment method</label><select name="paymentMethod"><option value="cash">Cash</option><option value="mobile-money">Mobile Money</option><option value="card">Card</option><option value="bank-transfer">Bank transfer</option></select></div><div class="field"><label>Payment reference</label><input name="paymentReference" placeholder="Optional transaction reference"></div><div class="field"><label>Paid by</label><input name="paidBy" required value="${esc(currentOperator())}"></div></div><div class="totals-box"><div class="summary-row total"><span>Amount due</span><strong>${formatMoney(expense.amount)}</strong></div></div><div class="form-actions"><button type="button" class="button button-outline" data-action="close-modal">Cancel</button><button class="button button-primary">${I("check")}Confirm payment</button></div></form>`,
    );
  }

  async function saveExpensePayment(form) {
    const data = Object.fromEntries(new FormData(form));
    if (data.paymentMethod === "cash" && !openSession())
      throw new Error("Open the cash register before paying this expense in cash");
    const paidAt = new Date(`${data.paymentDate}T12:00:00`).toISOString();
    await DB.markExpensePaid(data.expenseId, {
      paymentMethod: data.paymentMethod,
      paymentReference: data.paymentReference.trim(),
      paidBy: data.paidBy.trim(),
      paidAt,
      registerSessionId: openSession()?.id || "",
    });
    closeModal();
    await refresh("expenses");
    toast("Expense paid", "Payment and cash controls were updated.", "success");
  }

  function openExpenseVoidModal(id) {
    const expense = state.expenses.find((item) => item.id === id);
    if (!expense || expense.status === "voided") return;
    openModal(
      "Void expense record",
      `${expense.expenseNo} · ${formatMoney(expense.amount)}`,
      `<form data-form="expense-void"><input type="hidden" name="expenseId" value="${expense.id}"><div class="notice danger">${I("warning")}<div><strong>This preserves the expense as voided.</strong><br>Any linked cash movement is reversed from the register audit record. The original expense remains visible.</div></div><div class="form-grid" style="margin-top:13px"><div class="field"><label>Manager name</label><input name="voidedBy" required value="${esc(state.business.managerName || "Manager")}"></div><div class="field"><label>Manager PIN</label><input name="pin" type="password" inputmode="numeric" minlength="4" maxlength="8" pattern="[0-9]{4,8}" required autocomplete="off"></div><div class="field full"><label>Void reason</label><textarea name="voidReason" required placeholder="Explain why this record must be voided"></textarea></div></div><div class="form-actions"><button type="button" class="button button-outline" data-action="close-modal">Cancel</button><button class="button button-danger" ${state.business.approvalPinHash ? "" : "disabled"}>${I("lock")}Void expense</button></div></form>`,
    );
  }

  async function saveExpenseVoid(form) {
    await verifyApprovalPin(form.elements.pin.value);
    await DB.voidExpense(form.elements.expenseId.value, {
      voidedBy: form.elements.voidedBy.value.trim(),
      voidReason: form.elements.voidReason.value.trim(),
      voidedAt: nowISO(),
    });
    closeModal();
    await refresh("expenses");
    toast("Expense voided", "The audit record was preserved and cash was reversed.", "warning");
  }

  function confirmDeleteExpense(id) {
    const e = state.expenses.find((x) => x.id === id);
    if (!e) return;
    confirmDialog(
      "Delete expense",
      `Delete ${e.expenseNo || e.description} for ${formatMoney(e.amount)}? This is only allowed for unpaid, non-pending records.`,
      async () => {
        await DB.deleteExpense(id);
        await refresh("expenses");
        toast("Expense deleted", e.description, "success");
      },
      "Delete",
    );
  }

  function openRegisterModal() {
    openModal(
      "Open cash register",
      "Start a cash-control session for this device",
      `<form data-form="open-register"><div class="form-grid"><div class="field"><label>Cashier / operator name</label><input name="cashier" required placeholder="Enter operator name"></div><div class="field"><label>Opening cash float</label><input type="number" name="openingFloat" min="0" step="0.01" required value="0"></div><div class="field full"><label>Opening note</label><input name="notes" placeholder="Optional shift note"></div></div><div class="form-actions"><button type="button" class="button button-outline" data-action="close-modal">Cancel</button><button class="button button-primary">${I("register")}Open register</button></div></form>`,
    );
    $("#modalCard")?.classList.add("register-workflow-sheet");
  }
  async function saveOpenRegister(form) {
    const data = Object.fromEntries(new FormData(form));
    const session = {
      id: uid("session"),
      cashier: data.cashier.trim(),
      openingFloat: num(data.openingFloat),
      notes: data.notes.trim(),
      status: "open",
      openedAt: nowISO(),
      closedAt: null,
      expectedCash: 0,
      actualCash: null,
      difference: null,
    };
    await DB.openRegister(session);
    closeModal();
    await refresh("register");
    toast("Register opened", `Operator: ${session.cashier}`, "success");
  }
  function openCloseRegisterModal() {
    const session = openSession();
    if (!session) return;
    const summary = sessionCashSummary(session.id);
    openModal(
      "Close cash register",
      `Expected drawer cash: ${formatMoney(summary.expected)}`,
      `<form data-form="close-register"><input type="hidden" name="sessionId" value="${session.id}"><div class="notice warning">${I("warning")}<div>Count the physical cash in the drawer. The system will calculate any shortage or overage.</div></div><div class="form-grid" style="margin-top:13px"><div class="field"><label>Expected cash</label><input value="${formatMoney(summary.expected)}" disabled></div><div class="field"><label>Actual counted cash</label><input type="number" name="actualCash" min="0" step="0.01" required></div><div class="field full"><label>Closing notes</label><textarea name="notes"></textarea></div></div><div class="form-actions"><button type="button" class="button button-outline" data-action="close-modal">Cancel</button><button class="button button-danger">${I("lock")}Close register</button></div></form>`,
    );
    $("#modalCard")?.classList.add("register-workflow-sheet");
  }
  async function saveCloseRegister(form) {
    const data = Object.fromEntries(new FormData(form));
    const result = await DB.closeRegister(
      data.sessionId,
      num(data.actualCash),
      data.notes.trim(),
    );
    closeModal();
    await refresh("register");
    toast(
      "Register closed",
      `Difference: ${formatMoney(result.difference)}`,
      Math.abs(result.difference) < 0.01 ? "success" : "warning",
    );
  }
  function openCashMovementModal(type) {
    const session = openSession();
    if (!session) {
      toast(
        "Register closed",
        "Open the register before recording cash movements.",
        "warning",
      );
      return;
    }
    openModal(
      type === "cash-in" ? "Add cash to drawer" : "Remove cash from drawer",
      "Manual cash movement for the active register",
      `<form data-form="cash-movement"><input type="hidden" name="type" value="${type}"><div class="form-grid"><div class="field"><label>Amount</label><input type="number" name="amount" min="0.01" step="0.01" required></div><div class="field"><label>Reason</label><input name="note" required placeholder="Explain the movement"></div></div><div class="form-actions"><button type="button" class="button button-outline" data-action="close-modal">Cancel</button><button class="button button-primary">Record movement</button></div></form>`,
    );
    $("#modalCard")?.classList.add("register-workflow-sheet");
  }
  async function saveCashMovement(form) {
    const data = Object.fromEntries(new FormData(form));
    const session = openSession();
    const amount = num(data.amount) * (data.type === "cash-out" ? -1 : 1);
    await DB.addCashMovement({
      id: uid("cash"),
      sessionId: session.id,
      type: data.type,
      amount,
      paymentMethod: "cash",
      referenceType: "manual",
      referenceId: null,
      note: data.note.trim(),
      createdAt: nowISO(),
    });
    closeModal();
    await refresh("register");
    toast(
      "Cash movement saved",
      `${data.type}: ${formatMoney(amount)}`,
      "success",
    );
  }

  function openStockAdjustmentModal(productId = "") {
    const product = state.products.find((p) => p.id === productId);
    openModal(
      "Adjust stock",
      "Record stock received, damaged, lost or corrected",
      `<form data-form="stock-adjustment"><div class="form-grid"><div class="field full"><label>Product</label><select name="productId" required><option value="">Select product</option>${state.products
        .filter((p) => p.trackStock !== false)
        .map(
          (p) =>
            `<option value="${p.id}" ${product?.id === p.id ? "selected" : ""}>${esc(p.name)} · current ${num(p.stock)}</option>`,
        )
        .join(
          "",
        )}</select></div><div class="field"><label>Adjustment type</label><select name="type"><option value="stock-in">Stock received</option><option value="stock-out">Stock removed</option><option value="damage">Damaged / expired</option><option value="correction">Correction</option></select></div><div class="field"><label>Quantity</label><input type="number" name="quantity" min="0.001" step="0.001" required></div><div class="field full"><label>Reason / note</label><input name="note" required></div></div><div class="form-actions"><button type="button" class="button button-outline" data-action="close-modal">Cancel</button><button class="button button-primary">Save adjustment</button></div></form>`,
    );
  }
  async function saveStockAdjustment(form) {
    const data = Object.fromEntries(new FormData(form));
    let quantity = num(data.quantity);
    if (["stock-out", "damage"].includes(data.type)) quantity *= -1;
    await DB.adjustStock(data.productId, quantity, data.note.trim(), data.type);
    closeModal();
    await refresh("inventory");
    toast(
      "Stock adjusted",
      `${quantity >= 0 ? "+" : ""}${quantity} units`,
      "success",
    );
  }
  function switchInventoryTab(tab) {
    $$(".tab-button").forEach((button) =>
      button.classList.toggle("active", button.dataset.tab === tab),
    );
    const body = $("#inventoryTabBody");
    if (!body) return;
    body.innerHTML =
      tab === "movements"
        ? inventoryMovementsHTML()
        : tab === "alerts"
          ? inventoryAlertsHTML()
          : inventoryLevelsHTML();
  }

  function stockCountRowHTML(product, counted = "") {
    return `<div class="line-item-row" data-count-row data-product-id="${product.id}" style="grid-template-columns:minmax(180px,1fr) 100px 100px 100px"><div class="cell-copy"><strong>${esc(product.name)}</strong><span>${esc(product.sku || product.barcode || "No code")}</span></div><input value="${num(product.stock)}" disabled title="System stock"><input data-field="counted" type="number" min="0" step="0.001" value="${counted ?? ""}" placeholder="Counted"><div data-count-difference>—</div></div>`;
  }
  function openStockCountModal(count = null) {
    const items = count?.items || [];
    openModal(
      count ? "Continue stock count" : "New stock count",
      "Enter the physical quantity counted for each product",
      `<form data-form="stock-count"><input type="hidden" name="id" value="${esc(count?.id || "")}"><div class="notice warning">${I("warning")}<div>For accurate results, pause sales and stock receiving until the count is completed.</div></div><div class="form-grid" style="margin-top:13px"><div class="field"><label>Count reference</label><input name="countNo" value="${esc(count?.countNo || "Will be generated")}" ${count ? "" : "disabled"}></div><div class="field"><label>Notes</label><input name="notes" value="${esc(count?.notes || "")}"></div></div><div class="form-section"><div class="page-toolbar"><h3 class="form-section-title">Products to count</h3><button type="button" class="button button-outline" data-action="add-stock-count-product">${I("plus")}Add product</button></div><div class="line-items-editor"><div class="line-item-head" style="grid-template-columns:minmax(180px,1fr) 100px 100px 100px"><span>Product</span><span>System</span><span>Counted</span><span>Difference</span></div><div id="stockCountRows">${
        items.length
          ? items
              .map((item) =>
                stockCountRowHTML(
                  state.products.find((p) => p.id === item.productId) || {
                    id: item.productId,
                    name: item.name || "Deleted product",
                    stock: item.systemStock || 0,
                    sku: "",
                  },
                  item.counted,
                ),
              )
              .join("")
          : state.products
              .filter((p) => p.trackStock !== false)
              .slice(0, 10)
              .map((p) => stockCountRowHTML(p, ""))
              .join("")
      }</div></div></div><div class="form-actions"><button type="button" class="button button-outline" data-action="close-modal">Cancel</button><button class="button button-outline" type="submit" value="draft">${I("save")}Save draft</button><button class="button button-primary" type="submit" value="complete">${I("check")}Complete and adjust</button></div></form>`,
      true,
    );
    bindStockCountInputs();
  }
  function bindStockCountInputs() {
    $$('[data-count-row] input[data-field="counted"]').forEach((input) =>
      input.addEventListener("input", () => {
        const row = input.closest("[data-count-row]");
        const product = state.products.find(
          (p) => p.id === row.dataset.productId,
        );
        const diff = num(input.value) - num(product?.stock);
        $("[data-count-difference]", row).textContent =
          input.value === "" ? "—" : `${diff >= 0 ? "+" : ""}${diff}`;
      }),
    );
  }
  function addStockCountProduct() {
    const existing = new Set(
      $$("[data-count-row]").map((r) => r.dataset.productId),
    );
    const product = state.products.find(
      (p) => p.trackStock !== false && !existing.has(p.id),
    );
    if (!product) {
      toast(
        "All products included",
        "Every tracked product is already in this count.",
        "warning",
      );
      return;
    }
    $("#stockCountRows")?.insertAdjacentHTML(
      "beforeend",
      stockCountRowHTML(product, ""),
    );
    bindStockCountInputs();
    toast("Product added", product.name, "success");
  }
  async function saveStockCount(form, submitter) {
    const data = Object.fromEntries(new FormData(form));
    const rows = $$("[data-count-row]").map((row) => {
      const product = state.products.find(
        (p) => p.id === row.dataset.productId,
      );
      const input = $('[data-field="counted"]', row);
      return {
        productId: row.dataset.productId,
        name: product?.name || "Product",
        systemStock: num(product?.stock),
        counted: input.value === "" ? null : num(input.value),
      };
    });
    if (!rows.length) throw new Error("Add products to the stock count");
    if (
      submitter?.value === "complete" &&
      rows.some((row) => row.counted === null)
    )
      throw new Error(
        "Enter the physical count for every included product before completing",
      );
    const existing = state.stockCounts.find((c) => c.id === data.id);
    const countNo =
      existing?.countNo ||
      (await DB.nextSequence("stockCountSequence", "COUNT"));
    const record = {
      ...existing,
      id: data.id || uid("count"),
      countNo,
      items: rows,
      notes: data.notes.trim(),
      status: "draft",
      startedAt: existing?.startedAt || nowISO(),
      completedAt: null,
    };
    if (submitter?.value === "complete") {
      await DB.completeStockCount(record);
      toast(
        "Stock count completed",
        `${countNo} adjusted inventory.`,
        "success",
      );
    } else {
      await DB.put("stockCounts", record);
      toast("Stock count saved", `${countNo} remains a draft.`, "success");
    }
    closeModal();
    await refresh("stock-count");
  }
  function openStockCountDetails(id) {
    const count = state.stockCounts.find((c) => c.id === id);
    if (!count) return;
    openModal(
      "Stock count details",
      count.countNo,
      `<div class="notice ${count.status === "completed" ? "success" : "info"}">${I(count.status === "completed" ? "check" : "info")}<div>Status: <strong>${esc(count.status)}</strong> · Started ${formatDateTime(count.startedAt)}${count.completedAt ? ` · Completed ${formatDateTime(count.completedAt)}` : ""}</div></div><div class="table-wrap" style="margin-top:13px"><table class="data-table"><thead><tr><th>Product</th><th>System</th><th>Counted</th><th>Difference</th></tr></thead><tbody>${count.items.map((i) => `<tr><td><strong>${esc(i.name)}</strong></td><td>${num(i.systemStock)}</td><td>${num(i.counted)}</td><td><span class="badge ${num(i.difference) >= 0 ? "success" : "danger"}">${num(i.difference) >= 0 ? "+" : ""}${num(i.difference)}</span></td></tr>`).join("")}</tbody></table></div>`,
      true,
    );
  }

  function openSaleDetails(id) {
    const sale = state.sales.find((s) => s.id === id);
    if (!sale) return;
    const hasReturn = state.returns.some((item) => item.saleId === sale.id);
    const pending = pendingApproval(sale.id);
    const canReturn = !["refunded", "voided"].includes(sale.status) && !pending;
    const canVoid = sale.status === "completed" && !hasReturn && !pending;
    openModal(
      "Sale details",
      sale.receiptNo,
      `${pending ? `<div class="notice warning">${I("lock")}<div><strong>${esc(pending.approvalNo)} is awaiting manager approval.</strong><br>No stock or cash has changed yet.</div></div>` : ""}<div class="form-grid three" style="margin-top:${pending ? "13px" : "0"}"><div class="notice info"><div><strong>Customer</strong><br>${esc(sale.customerName || customerName(sale.customerId))}</div></div><div class="notice info"><div><strong>Payment</strong><br>${esc(paymentLabel(sale.paymentMethod))}</div></div><div class="notice info"><div><strong>Status</strong><br>${statusBadge(sale.status)}</div></div></div><div class="table-wrap" style="margin-top:13px"><table class="data-table"><thead><tr><th>Product</th><th>Qty</th><th>Returned</th><th>Unit price</th><th>Total</th></tr></thead><tbody>${sale.items.map((i) => `<tr><td><strong>${esc(i.name)}</strong></td><td>${num(i.quantity)}</td><td>${num(i.returnedQty)}</td><td>${formatMoney(i.unitPrice)}</td><td>${formatMoney(i.lineTotal || num(i.quantity) * num(i.unitPrice))}</td></tr>`).join("")}</tbody></table></div><div class="totals-box"><div class="summary-row"><span>Subtotal</span><strong>${formatMoney(sale.subtotal)}</strong></div><div class="summary-row"><span>Discount</span><strong>${formatMoney(sale.discount)}</strong></div><div class="summary-row"><span>Tax</span><strong>${formatMoney(sale.tax)}</strong></div><div class="summary-row total"><span>Total</span><strong>${formatMoney(sale.total)}</strong></div></div><div class="form-actions receipt-detail-actions"><button class="button button-outline" data-action="print-sale" data-id="${sale.id}">${I("print")}Print</button><button class="button button-outline" data-action="download-sale" data-id="${sale.id}">${I("download")}Download</button><button class="button button-outline" data-action="share-sale" data-id="${sale.id}">${I("share")}Share</button>${canReturn ? `<button class="button button-warning" data-action="return-sale" data-id="${sale.id}">${I("return")}Request return</button>` : ""}${canVoid ? `<button class="button button-danger" data-action="request-void" data-id="${sale.id}">${I("close")}Request void</button>` : ""}<button class="button button-primary" data-action="close-modal">Close</button></div>`,
      true,
    );
    $("#modalCard")?.classList.add("receipt-detail-sheet");
  }
  function openReturnModal(id) {
    const sale = state.sales.find((s) => s.id === id);
    if (!sale) return;
    openModal(
      "Request product return",
      `${sale.receiptNo} · manager approval required`,
      `<form data-form="return"><input type="hidden" name="saleId" value="${sale.id}"><div class="notice warning">${I("lock")}<div><strong>This request will not change stock or cash immediately.</strong><br>A manager must approve it using the configured approval PIN. Damaged items should not be restocked.</div></div><div class="table-wrap" style="margin-top:13px"><table class="data-table"><thead><tr><th>Product</th><th>Sold</th><th>Already returned</th><th>Return now</th><th>Restock</th><th>Refund</th></tr></thead><tbody>${sale.items
        .map((i) => {
          const available = num(i.quantity) - num(i.returnedQty);
          const perUnit =
            num(i.lineTotal || num(i.quantity) * num(i.unitPrice)) /
            num(i.quantity);
          return `<tr data-return-row data-product-id="${i.productId}" data-name="${esc(i.name)}" data-max="${available}" data-unit-refund="${perUnit}"><td><strong>${esc(i.name)}</strong></td><td>${num(i.quantity)}</td><td>${num(i.returnedQty)}</td><td><input data-return-qty type="number" min="0" max="${available}" step="0.001" value="0" class="input-control" style="width:85px"></td><td><input data-return-restock type="checkbox" checked></td><td data-return-line>${formatMoney(0)}</td></tr>`;
        })
        .join(
          "",
        )}</tbody></table></div><div class="form-grid" style="margin-top:13px"><div class="field"><label>Requested by</label><input name="requestedBy" required value="${esc(currentOperator())}"></div><div class="field"><label>Refund method</label><select name="refundMethod"><option value="cash">Cash</option><option value="mobile-money">Mobile Money</option><option value="card">Card</option>${sale.customerId ? '<option value="credit-account">Reduce customer account</option>' : ""}</select></div><div class="field"><label>Reason</label><select name="reason"><option>Customer changed mind</option><option>Damaged product</option><option>Wrong product</option><option>Expired product</option><option>Pricing error</option><option>Other</option></select></div><div class="field full"><label>Notes${settingEnabled("requireReturnNotes", true) ? " *" : ""}</label><input name="notes" ${settingEnabled("requireReturnNotes", true) ? "required" : ""} placeholder="Explain the request for the reviewer"></div></div><div class="totals-box" id="returnTotals"><div class="summary-row total"><span>Refund total</span><strong>${formatMoney(0)}</strong></div></div><div class="form-actions"><button type="button" class="button button-outline" data-action="set-return-all" data-id="${sale.id}">Return all available</button><button type="button" class="button button-outline" data-action="close-modal">Cancel</button><button class="button button-warning">${I("lock")}Submit for approval</button></div></form>`,
      true,
    );
    $("#modalCard")?.classList.add("controlled-workflow-sheet");
  }
  function updateReturnTotals() {
    let total = 0;
    $$("[data-return-row]").forEach((row) => {
      const qty = num($("[data-return-qty]", row).value);
      const amount = qty * num(row.dataset.unitRefund);
      total += amount;
      $("[data-return-line]", row).textContent = formatMoney(amount);
    });
    const node = $("#returnTotals");
    if (node)
      node.innerHTML = `<div class="summary-row total"><span>Refund total</span><strong>${formatMoney(total)}</strong></div>`;
    return total;
  }
  function setReturnAll() {
    $$("[data-return-row]").forEach((row) => {
      $("[data-return-qty]", row).value = row.dataset.max;
    });
    updateReturnTotals();
  }
  async function saveReturn(form) {
    const sale = state.sales.find((s) => s.id === form.elements.saleId.value);
    const items = $$("[data-return-row]")
      .map((row) => ({
        productId: row.dataset.productId,
        name: row.dataset.name,
        quantity: num($("[data-return-qty]", row).value),
        restock: $("[data-return-restock]", row).checked,
        refundAmount:
          num($("[data-return-qty]", row).value) * num(row.dataset.unitRefund),
      }))
      .filter((i) => i.quantity > 0);
    if (!items.length)
      throw new Error("Enter a return quantity for at least one item");
    if (
      settingEnabled("requireReturnNotes", true) &&
      !form.elements.notes.value.trim()
    )
      throw new Error("Add notes explaining this return request");
    const refundTotal = items.reduce((s, i) => s + i.refundAmount, 0);
    const returnNo = await DB.nextSequence("returnSequence", "RET");
    const approvalNo = await DB.nextSequence("approvalSequence", "APR");
    const requestedAt = nowISO();
    const record = {
      id: uid("return"),
      returnNo,
      saleId: sale.id,
      receiptNo: sale.receiptNo,
      items,
      refundTotal,
      refundMethod: form.elements.refundMethod.value,
      reason: form.elements.reason.value,
      notes: form.elements.notes.value.trim(),
      requestedAt,
    };
    await DB.requestApproval({
      id: uid("approval"),
      approvalNo,
      type: "return",
      saleId: sale.id,
      receiptNo: sale.receiptNo,
      amount: refundTotal,
      refundMethod: record.refundMethod,
      reason: record.reason,
      notes: record.notes,
      requestedBy: form.elements.requestedBy.value.trim(),
      requestedAt,
      payload: record,
    });
    closeModal();
    await refresh("sales");
    toast(
      "Return sent for approval",
      `${approvalNo} · ${formatMoney(refundTotal)} pending`,
      "warning",
    );
  }

  function openVoidRequestModal(id) {
    const sale = state.sales.find((item) => item.id === id);
    if (!sale) return;
    if (sale.status !== "completed") {
      toast("Void unavailable", "Only an untouched completed sale can be voided.", "warning");
      return;
    }
    if (state.returns.some((item) => item.saleId === sale.id)) {
      toast("Void unavailable", "This sale already has a processed return.", "warning");
      return;
    }
    openModal(
      "Request sale void",
      `${sale.receiptNo} · ${formatMoney(sale.total)}`,
      `<form data-form="void-request"><input type="hidden" name="saleId" value="${sale.id}"><div class="notice danger">${I("warning")}<div><strong>Voiding reverses the complete transaction.</strong><br>After manager approval, sold stock is restored, customer credit is reversed and cash is removed from the register record.</div></div><div class="form-grid" style="margin-top:13px"><div class="field"><label>Requested by</label><input name="requestedBy" required value="${esc(currentOperator())}"></div><div class="field"><label>Reason</label><select name="reason"><option>Sale entered by mistake</option><option>Duplicate transaction</option><option>Payment failed</option><option>Customer cancelled immediately</option><option>Wrong customer selected</option><option>Other</option></select></div><div class="field full"><label>Detailed notes${settingEnabled("requireVoidNotes", true) ? " *" : ""}</label><textarea name="notes" ${settingEnabled("requireVoidNotes", true) ? "required" : ""} placeholder="Explain why the entire sale must be voided"></textarea></div></div><div class="totals-box"><div class="summary-row"><span>Items restored after approval</span><strong>${sale.items.reduce((sum, item) => sum + num(item.quantity), 0)}</strong></div><div class="summary-row total"><span>Transaction value</span><strong>${formatMoney(sale.total)}</strong></div></div><div class="form-actions"><button type="button" class="button button-outline" data-action="close-modal">Cancel</button><button class="button button-danger">${I("lock")}Submit void request</button></div></form>`,
      true,
    );
    $("#modalCard")?.classList.add("controlled-workflow-sheet");
  }

  async function saveVoidRequest(form) {
    const sale = state.sales.find(
      (item) => item.id === form.elements.saleId.value,
    );
    if (!sale || sale.status !== "completed")
      throw new Error("Only a completed sale can be submitted for voiding");
    const approvalNo = await DB.nextSequence("approvalSequence", "APR");
    const requestedAt = nowISO();
    const reason = form.elements.reason.value;
    const notes = form.elements.notes.value.trim();
    if (settingEnabled("requireVoidNotes", true) && !notes)
      throw new Error("Add notes explaining this void request");
    await DB.requestApproval({
      id: uid("approval"),
      approvalNo,
      type: "void",
      saleId: sale.id,
      receiptNo: sale.receiptNo,
      amount: sale.total,
      reason,
      notes,
      requestedBy: form.elements.requestedBy.value.trim(),
      requestedAt,
      payload: {
        saleId: sale.id,
        reason,
        notes,
        requestedAt,
      },
    });
    closeModal();
    await refresh("sales");
    toast(
      "Void sent for approval",
      `${approvalNo} · ${sale.receiptNo} remains active until approved`,
      "warning",
    );
  }

  function openApprovalReviewModal(id, decision = "approve") {
    const approval = state.approvalRequests.find((item) => item.id === id);
    if (!approval || approval.status !== "pending") return;
    const approving = decision !== "reject";
    const expense =
      approval.type === "expense"
        ? state.expenses.find((item) => item.id === approval.expenseId)
        : null;
    openModal(
      approving ? "Approve request" : "Reject request",
      `${approval.approvalNo} · ${approval.receiptNo || expense?.expenseNo || "Control request"}`,
      `<form data-form="approval-review"><input type="hidden" name="approvalId" value="${approval.id}"><input type="hidden" name="decision" value="${approving ? "approve" : "reject"}"><div class="approval-summary ${approving ? "approve" : "reject"}"><div><span>Request type</span><strong>${esc(approval.type.toUpperCase())}</strong></div><div><span>Amount</span><strong>${formatMoney(approval.amount)}</strong></div><div><span>Requested by</span><strong>${esc(approval.requestedBy)}</strong></div></div><div class="notice ${state.business.approvalPinHash ? "info" : "warning"}" style="margin-top:13px">${I(state.business.approvalPinHash ? "lock" : "warning")}<div>${state.business.approvalPinHash ? "Enter the manager PIN to create a verified approval record." : "No approval PIN is configured. Open Settings and create one before reviewing this request."}</div></div><div class="form-grid" style="margin-top:13px"><div class="field"><label>Reviewer name</label><input name="reviewedBy" required value="${esc(state.business.managerName || "Manager")}"></div><div class="field"><label>Manager PIN</label><input name="pin" type="password" inputmode="numeric" minlength="4" maxlength="8" pattern="[0-9]{4,8}" autocomplete="off" required placeholder="4–8 digits"></div><div class="field full"><label>Review note</label><textarea name="reviewNote" placeholder="Optional decision note"></textarea></div></div><div class="form-actions"><button type="button" class="button button-outline" data-action="close-modal">Cancel</button><button class="button ${approving ? "button-primary" : "button-danger"}" ${state.business.approvalPinHash ? "" : "disabled"}>${I(approving ? "check" : "close")}${approving ? "Approve and process" : "Reject request"}</button></div></form>`,
      true,
    );
    $("#modalCard")?.classList.add("controlled-workflow-sheet");
  }

  async function saveApprovalReview(form) {
    await verifyApprovalPin(form.elements.pin.value);
    const approval = state.approvalRequests.find(
      (item) => item.id === form.elements.approvalId.value,
    );
    if (!approval || approval.status !== "pending")
      throw new Error("This request is no longer pending");
    const expense =
      approval.type === "expense"
        ? state.expenses.find((item) => item.id === approval.expenseId)
        : null;
    if (
      form.elements.decision.value === "approve" &&
      expense?.paymentStatus === "paid" &&
      expense.paymentMethod === "cash" &&
      !openSession()
    )
      throw new Error("Open the cash register before approving a paid cash expense");
    const review = {
      reviewedBy: form.elements.reviewedBy.value.trim(),
      reviewNote: form.elements.reviewNote.value.trim(),
      reviewedAt: nowISO(),
      registerSessionId: openSession()?.id || "",
    };
    if (form.elements.decision.value === "approve")
      await DB.approveApprovalRequest(approval.id, review);
    else await DB.rejectApprovalRequest(approval.id, review);
    closeModal();
    await refresh(approval.type === "expense" ? "expenses" : "sales");
    toast(
      form.elements.decision.value === "approve"
        ? `${approval.type === "return" ? "Return" : approval.type === "expense" ? "Expense" : "Void"} approved`
        : "Request rejected",
      `${approval.approvalNo} reviewed by ${review.reviewedBy}`,
      form.elements.decision.value === "approve" ? "success" : "warning",
    );
  }

  function openApprovalDetails(id) {
    const approval = state.approvalRequests.find((item) => item.id === id);
    if (!approval) return;
    const expense =
      approval.type === "expense"
        ? state.expenses.find((item) => item.id === approval.expenseId)
        : null;
    const itemRows =
      approval.type === "return" && approval.payload?.items?.length
        ? `<div class="table-wrap" style="margin-top:13px"><table class="data-table"><thead><tr><th>Product</th><th>Quantity</th><th>Restock</th><th>Refund</th></tr></thead><tbody>${approval.payload.items.map((item) => `<tr><td><strong>${esc(item.name)}</strong></td><td>${num(item.quantity)}</td><td>${item.restock ? "Yes" : "No"}</td><td>${formatMoney(item.refundAmount)}</td></tr>`).join("")}</tbody></table></div>`
        : expense
          ? `<div class="expense-approval-detail"><div><span>Expense</span><strong>${esc(expense.expenseNo || "—")}</strong></div><div><span>Vendor</span><strong>${esc(expense.vendor || "—")}</strong></div><div><span>Category</span><strong>${esc(expense.category)}</strong></div><div><span>Due date</span><strong>${formatDate(expense.dueDate)}</strong></div></div>`
          : "";
    openModal(
      "Approval record",
      `${approval.approvalNo} · ${approval.receiptNo || expense?.expenseNo || "Control request"}`,
      `<div class="approval-audit"><div><span>Status</span>${statusBadge(approval.status)}</div><div><span>Type</span><strong>${esc(approval.type)}</strong></div><div><span>Amount</span><strong>${formatMoney(approval.amount)}</strong></div><div><span>Reason</span><strong>${esc(approval.reason || "—")}</strong></div><div><span>Requested by</span><strong>${esc(approval.requestedBy || "—")}</strong><small>${formatDateTime(approval.requestedAt)}</small></div><div><span>Reviewed by</span><strong>${esc(approval.reviewedBy || "Not reviewed")}</strong><small>${formatDateTime(approval.reviewedAt)}</small></div></div>${itemRows}<div class="notice info" style="margin-top:13px">${I("info")}<div><strong>Request notes:</strong> ${esc(approval.notes || "No notes")}<br><strong>Review note:</strong> ${esc(approval.reviewNote || "No review note")}</div></div><div class="form-actions">${approval.status === "pending" ? `<button class="button button-primary" data-action="review-approval" data-decision="approve" data-id="${approval.id}">${I("check")}Approve</button><button class="button button-danger" data-action="review-approval" data-decision="reject" data-id="${approval.id}">${I("close")}Reject</button>` : ""}<button class="button button-outline" data-action="close-modal">Close</button></div>`,
      true,
    );
  }

  async function saveBusinessSettings(form) {
    const data = Object.fromEntries(new FormData(form));
    await persistBusinessSettings(
      {
      businessName: data.businessName.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      address: data.address.trim(),
      taxId: data.taxId.trim(),
      currency: data.currency.trim().toUpperCase(),
      taxRate: num(data.taxRate),
      taxMode: data.taxMode,
      },
      "Business profile updated",
    );
  }

  function applyThemePresetToForm(id) {
    const form = $('form[data-form="appearance-settings"]');
    if (!form) return;
    const preset = THEME_PRESETS[id];
    form.elements.appThemePreset.value = preset ? id : "custom";
    if (preset) {
      form.elements.appPrimaryColor.value = preset.primary;
      form.elements.appHighlightColor.value = preset.highlight;
      form.elements.appCanvasColor.value = preset.canvas;
    }
    $$(".theme-preset", form).forEach((button) =>
      button.classList.toggle("active", button.dataset.id === form.elements.appThemePreset.value),
    );
    updateAppearancePreview();
  }

  function updateAppearancePreview() {
    const form = $('form[data-form="appearance-settings"]');
    if (!form) return;
    const primary = form.elements.appPrimaryColor.value;
    const highlight = form.elements.appHighlightColor.value;
    const canvas = form.elements.appCanvasColor.value;
    if (!validHex(primary) || !validHex(highlight) || !validHex(canvas)) return;
    const preview = $("#themeLivePreview");
    if (preview) {
      preview.style.setProperty("--preview-primary", primary);
      preview.style.setProperty("--preview-highlight", highlight);
      preview.style.setProperty("--preview-canvas", canvas);
    }
    const presetMatch = Object.entries(THEME_PRESETS).find(
      ([, preset]) =>
        preset.primary.toLowerCase() === primary.toLowerCase() &&
        preset.highlight.toLowerCase() === highlight.toLowerCase() &&
        preset.canvas.toLowerCase() === canvas.toLowerCase(),
    );
    form.elements.appThemePreset.value = presetMatch?.[0] || "custom";
    $$(".theme-preset", form).forEach((button) =>
      button.classList.toggle("active", button.dataset.id === form.elements.appThemePreset.value),
    );
  }

  async function saveAppearanceSettings(form) {
    const data = Object.fromEntries(new FormData(form));
    if (
      !validHex(data.appPrimaryColor) ||
      !validHex(data.appHighlightColor) ||
      !validHex(data.appCanvasColor)
    )
      throw new Error("Choose valid colours for the app theme");
    await persistBusinessSettings(
      {
        appThemePreset: THEME_PRESETS[data.appThemePreset]
          ? data.appThemePreset
          : "custom",
        appPrimaryColor: data.appPrimaryColor,
        appHighlightColor: data.appHighlightColor,
        appCanvasColor: data.appCanvasColor,
        textScale: ["standard", "large", "extra-large"].includes(data.textScale)
          ? data.textScale
          : "standard",
        highContrast: form.elements.highContrast.checked,
        reducedMotion: form.elements.reducedMotion.checked,
        largeTouchTargets: form.elements.largeTouchTargets.checked,
        accessibilityConfigured: true,
      },
      "App colours and accessibility updated",
    );
  }

  async function saveCheckoutSettings(form) {
    const data = Object.fromEntries(new FormData(form));
    const productView = data.productView === "grid" ? "grid" : "table";
    state.productView = productView;
    try {
      localStorage.setItem("mtech-product-view", productView);
    } catch (_) {}
    await persistBusinessSettings(
      {
        defaultPaymentMethod: data.defaultPaymentMethod,
        saleCompletionBehavior:
          data.saleCompletionBehavior === "continue" ? "continue" : "receipt",
        productView,
        interfaceDensity:
          data.interfaceDensity === "compact" ? "compact" : "comfortable",
        requireOpenRegister: form.elements.requireOpenRegister.checked,
        confirmClearCart: form.elements.confirmClearCart.checked,
        hapticFeedback: form.elements.hapticFeedback.checked,
        scanSound: form.elements.scanSound.checked,
        checkoutSoundEnabled: form.elements.checkoutSoundEnabled.checked,
        checkoutSound: ["success", "bright", "gentle"].includes(
          data.checkoutSound,
        )
          ? data.checkoutSound
          : "success",
        soundVolume: clamp(num(data.soundVolume), 0, 100),
        showDashboardHero: form.elements.showDashboardHero.checked,
      },
      "Checkout preferences updated",
    );
  }

  async function saveReceiptSettings(form) {
    const data = Object.fromEntries(new FormData(form));
    await persistBusinessSettings(
      {
        receiptPaper: data.receiptPaper === "58mm" ? "58mm" : "80mm",
        receiptAccent: data.receiptAccent,
        receiptFooter: data.receiptFooter.trim(),
        showReceiptCashier: form.elements.showReceiptCashier.checked,
        showReceiptSku: form.elements.showReceiptSku.checked,
        showReceiptTax: form.elements.showReceiptTax.checked,
      },
      "Receipt design updated",
    );
  }

  async function saveInventorySettings(form) {
    const data = Object.fromEntries(new FormData(form));
    await persistBusinessSettings(
      {
        expiryWarningDays: clamp(num(data.expiryWarningDays) || 30, 1, 365),
        lowStockEnabled: form.elements.lowStockEnabled.checked,
        allowNegativeStock: form.elements.allowNegativeStock.checked,
      },
      "Inventory controls updated",
    );
  }

  async function saveAlertsSettings(form) {
    const data = Object.fromEntries(new FormData(form));
    await persistBusinessSettings(
      {
        alertDefaultSnoozeHours: clamp(
          num(data.alertDefaultSnoozeHours) || 24,
          1,
          168,
        ),
        expenseApprovalThreshold: Math.max(
          0,
          num(data.expenseApprovalThreshold),
        ),
        alertSoundEnabled: form.elements.alertSoundEnabled.checked,
        alertSound: ["gentle", "bright", "urgent"].includes(data.alertSound)
          ? data.alertSound
          : "gentle",
        alertSoundCooldownMinutes: clamp(
          num(data.alertSoundCooldownMinutes) || 30,
          1,
          1440,
        ),
        alertExpiryEnabled: form.elements.alertExpiryEnabled.checked,
        alertApprovalEnabled: form.elements.alertApprovalEnabled.checked,
        alertPurchaseEnabled: form.elements.alertPurchaseEnabled.checked,
        alertCreditEnabled: form.elements.alertCreditEnabled.checked,
        alertExpenseDueEnabled: form.elements.alertExpenseDueEnabled.checked,
        alertBackupEnabled: form.elements.alertBackupEnabled.checked,
        expenseApprovalEnabled: form.elements.expenseApprovalEnabled.checked,
        requireExpenseReceipt: form.elements.requireExpenseReceipt.checked,
      },
      "Alerts and expense controls updated",
    );
  }

  async function saveSecuritySettings(form) {
    const data = Object.fromEntries(new FormData(form));
    const pin = String(data.approvalPin || "").trim();
    if (pin && !/^\d{4,8}$/.test(pin))
      throw new Error("Manager approval PIN must contain 4 to 8 digits");
    await persistBusinessSettings(
      {
        managerName: data.managerName.trim(),
        approvalPinHash: pin
          ? await hashApprovalPin(pin)
          : state.business.approvalPinHash || "",
        requireReturnNotes: form.elements.requireReturnNotes.checked,
        requireVoidNotes: form.elements.requireVoidNotes.checked,
      },
      "Approval policy updated",
    );
  }

  async function saveDataSettings(form) {
    const data = Object.fromEntries(new FormData(form));
    await persistBusinessSettings(
      {
        backupReminderDays: clamp(num(data.backupReminderDays) || 7, 1, 90),
      },
      "Backup reminder updated",
    );
  }

  async function persistBusinessSettings(updates, message) {
    await DB.setSetting("business", { ...state.business, ...updates });
    await refresh("settings");
    toast("Settings saved", message, "success");
  }

  async function exportBackup() {
    const backup = await DB.exportAll();
    downloadBlob(
      JSON.stringify(backup, null, 2),
      `mtech-pos-backup-${dateInputValue()}.json`,
      "application/json",
    );
    state.business = { ...state.business, lastBackupAt: nowISO() };
    await DB.setSetting("business", state.business);
    renderAlertIndicators();
    if (state.currentView === "settings") renderSettings();
    toast(
      "Backup exported",
      "Store the downloaded file somewhere safe.",
      "success",
    );
  }
  async function importBackupFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const backup = JSON.parse(await file.text());
      await DB.importAll(backup);
      state.cart = [];
      closeModal();
      await refresh("settings");
      toast(
        "Backup restored",
        "All local POS records were replaced by the backup.",
        "success",
      );
    } catch (error) {
      toast("Import failed", error.message, "error");
    } finally {
      event.target.value = "";
    }
  }
  function confirmResetData() {
    confirmDialog(
      "Delete all POS data",
      "This permanently removes products, stock, sales, customers, purchases, expenses and settings from this browser. Export a backup first.",
      async () => {
        await DB.clearAll();
        await DB.seed();
        state.cart = [];
        closeModal();
        await refresh("dashboard");
        toast(
          "Application reset",
          "Fresh demonstration data has been created.",
          "success",
        );
      },
      "Delete everything",
    );
  }

  function csvCell(value) {
    return `"${String(value ?? "").replace(/"/g, '""')}"`;
  }
  function downloadBlob(content, filename, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function exportSalesCSV() {
    const rows = [
      [
        "Receipt",
        "Date",
        "Customer",
        "Payment",
        "Subtotal",
        "Discount",
        "Tax",
        "Total",
        "Status",
      ],
      ...state.sales.map((s) => [
        s.receiptNo,
        s.createdAt,
        s.customerName,
        paymentLabel(s.paymentMethod),
        s.subtotal,
        s.discount,
        s.tax,
        s.total,
        s.status,
      ]),
    ];
    downloadBlob(
      rows.map((r) => r.map(csvCell).join(",")).join("\n"),
      `sales-${dateInputValue()}.csv`,
      "text/csv",
    );
  }
  function exportProductsCSV() {
    const rows = [
      [
        "Name",
        "SKU",
        "Barcode",
        "Category",
        "Supplier",
        "Unit",
        "Cost",
        "Price",
        "Stock",
        "Reorder Level",
        "Active",
      ],
      ...state.products.map((p) => [
        p.name,
        p.sku,
        p.barcode,
        categoryName(p.categoryId),
        supplierName(p.supplierId),
        p.unit,
        p.purchasePrice,
        p.sellingPrice,
        p.stock,
        p.reorderLevel,
        p.active !== false,
      ]),
    ];
    downloadBlob(
      rows.map((r) => r.map(csvCell).join(",")).join("\n"),
      `products-${dateInputValue()}.csv`,
      "text/csv",
    );
  }
  function exportCustomersCSV() {
    const rows = [
      [
        "Name",
        "Phone",
        "Email",
        "Address",
        "Total Purchases",
        "Credit Balance",
        "Credit Limit",
      ],
      ...state.customers.map((c) => [
        c.name,
        c.phone,
        c.email,
        c.address,
        c.totalPurchases,
        c.balance,
        c.creditLimit,
      ]),
    ];
    downloadBlob(
      rows.map((r) => r.map(csvCell).join(",")).join("\n"),
      `customers-${dateInputValue()}.csv`,
      "text/csv",
    );
  }
  function exportExpensesCSV() {
    const rows = [
      [
        "Expense No",
        "Date",
        "Due Date",
        "Vendor",
        "Category",
        "Description",
        "Reference",
        "Subtotal",
        "Tax",
        "Total",
        "Payment Method",
        "Payment Status",
        "Approval Status",
        "Record Status",
        "Receipt Attached",
      ],
      ...state.expenses.map((e) => [
        e.expenseNo,
        e.date,
        e.dueDate,
        e.vendor,
        e.category,
        e.description,
        e.reference,
        e.subtotal,
        e.taxAmount,
        e.amount,
        paymentLabel(e.paymentMethod),
        e.paymentStatus,
        e.approvalStatus,
        expenseDisplayStatus(e),
        e.receiptData ? "Yes" : "No",
      ]),
    ];
    downloadBlob(
      rows.map((r) => r.map(csvCell).join(",")).join("\n"),
      `expenses-${dateInputValue()}.csv`,
      "text/csv",
    );
  }
  function exportPurchasesCSV() {
    const rows = [
      [
        "Purchase",
        "Date",
        "Supplier",
        "Reference",
        "Total",
        "Paid",
        "Balance",
        "Status",
      ],
      ...state.purchases.map((p) => [
        p.purchaseNo,
        p.date,
        p.supplierName,
        p.reference,
        p.total,
        p.paid,
        p.balance,
        p.status,
      ]),
    ];
    downloadBlob(
      rows.map((r) => r.map(csvCell).join(",")).join("\n"),
      `purchases-${dateInputValue()}.csv`,
      "text/csv",
    );
  }
  function exportReportCSV() {
    const d = reportData();
    const rows = [
      ["MTECH POS Report", state.reportPeriod],
      ["Metric", "Value"],
      ["Gross sales", d.grossSales],
      ["Returns", d.returns],
      ["Net sales", d.netSales],
      ["Cost of goods", d.cogs],
      ["Gross profit", d.grossProfit],
      ["Expenses", d.expenseTotal],
      ["Net profit", d.netProfit],
      ["Transactions", d.sales.length],
    ];
    downloadBlob(
      rows.map((r) => r.map(csvCell).join(",")).join("\n"),
      `pos-report-${state.reportPeriod}-${dateInputValue()}.csv`,
      "text/csv",
    );
  }

  async function openBarcodeScanner(callback) {
    state.scanCallback = callback;
    if (!window.isSecureContext) {
      toast(
        "Secure connection required",
        "Camera access works only on HTTPS or localhost.",
        "error",
      );
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      manualBarcodePrompt("Camera access is not available in this browser.");
      return;
    }
    if (!("BarcodeDetector" in window) && !window.ZXingBrowser) {
      manualBarcodePrompt(
        "This browser cannot start the camera scanner. Use a Bluetooth/USB scanner or enter the code manually.",
      );
      return;
    }
    $("#scannerLayer").hidden = false;
    document.body.style.overflow = "hidden";
    $("#scannerStatus").textContent = "Requesting camera permission…";
    try {
      const video = $("#scannerVideo");
      const constraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };
      if ("BarcodeDetector" in window) {
        const supported = (await BarcodeDetector.getSupportedFormats?.()) || [];
        const wanted = [
          "ean_13",
          "ean_8",
          "upc_a",
          "upc_e",
          "code_128",
          "code_39",
          "codabar",
          "itf",
          "qr_code",
          "data_matrix",
        ];
        const formats = wanted.filter(
          (format) => !supported.length || supported.includes(format),
        );
        const detector = new BarcodeDetector(
          formats.length ? { formats } : undefined,
        );
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        await video.play();
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities?.() || {};
        $("#torchButton").hidden = !capabilities.torch;
        state.scanner = {
          stream,
          track,
          detector,
          running: true,
          lastScan: 0,
          torch: false,
          engine: "native",
        };
        $("#scannerStatus").textContent =
          "Align the barcode inside the frame · native scanner";
        scanLoop();
      } else {
        const reader = new ZXingBrowser.BrowserMultiFormatReader(undefined, {
          delayBetweenScanAttempts: 100,
          delayBetweenScanSuccess: 500,
        });
        state.scanner = {
          reader,
          running: true,
          torch: false,
          engine: "compatibility",
        };
        const controls = await reader.decodeFromConstraints(
          constraints,
          video,
          (result) => {
            if (result?.getText) completeBarcodeScan(result.getText());
          },
        );
        if (!state.scanner?.running) {
          controls.stop();
          return;
        }
        const stream = video.srcObject;
        const track = stream?.getVideoTracks?.()[0] || null;
        state.scanner.controls = controls;
        state.scanner.stream = stream;
        state.scanner.track = track;
        $("#torchButton").hidden = !controls.switchTorch;
        $("#scannerStatus").textContent =
          "Align the barcode inside the frame · compatibility scanner";
      }
    } catch (error) {
      console.error(error);
      closeScanner();
      const message =
        error.name === "NotAllowedError"
          ? "Camera permission was denied. Allow camera access in the browser site settings."
          : error.message;
      if (window.ZXingBrowser) {
        $("#scannerLayer").hidden = false;
        document.body.style.overflow = "hidden";
        state.scanner = {
          reader: new ZXingBrowser.BrowserMultiFormatReader(),
          running: false,
          torch: false,
          engine: "image",
        };
        $("#torchButton").hidden = true;
        $("#scannerStatus").textContent =
          `${message} Choose a saved image or enter the code manually.`;
        toast("Camera unavailable", message, "warning");
      } else manualBarcodePrompt(message);
    }
  }
  async function scanLoop() {
    const scanner = state.scanner;
    if (!scanner?.running) return;
    const time = performance.now();
    if (time - scanner.lastScan > 180) {
      scanner.lastScan = time;
      try {
        const results = await scanner.detector.detect($("#scannerVideo"));
        if (results?.length) {
          completeBarcodeScan(results[0].rawValue);
          return;
        }
      } catch (error) {
        if (error.name !== "InvalidStateError")
          console.debug("Barcode scan frame failed", error);
      }
    }
    requestAnimationFrame(scanLoop);
  }
  function completeBarcodeScan(code) {
    if (!code) return;
    haptic([70, 40, 70]);
    playBeep();
    const callback = state.scanCallback;
    closeScanner();
    setTimeout(() => callback?.(String(code).trim()), 100);
  }
  function playBeep() {
    playConfiguredSound("scan");
  }
  function closeScanner() {
    if (state.scanner) {
      state.scanner.running = false;
      state.scanner.controls?.stop?.();
      state.scanner.stream?.getTracks().forEach((track) => track.stop());
    }
    state.scanner = null;
    const video = $("#scannerVideo");
    video?.srcObject?.getTracks?.().forEach((track) => track.stop());
    if (video) video.srcObject = null;
    $("#scannerLayer").hidden = true;
    document.body.style.overflow = "";
  }
  async function toggleTorch() {
    const scanner = state.scanner;
    if (!scanner?.track) return;
    try {
      scanner.torch = !scanner.torch;
      if (scanner.controls?.switchTorch)
        await scanner.controls.switchTorch(scanner.torch);
      else
        await scanner.track.applyConstraints({
          advanced: [{ torch: scanner.torch }],
        });
      $("#torchButton").classList.toggle("button-primary", scanner.torch);
    } catch (error) {
      toast("Torch unavailable", error.message, "warning");
    }
  }
  function manualBarcodeEntry() {
    closeScanner();
    manualBarcodePrompt("Enter the barcode exactly as printed on the product.");
  }

  function manualBarcodePrompt(message) {
    closeScanner();
    openManualBarcodeModal(message);
  }
  function openManualBarcodeModal(message) {
    openModal(
      "Enter barcode manually",
      "Camera fallback and external scanner input",
      `<form data-form="manual-barcode"><div class="notice info">${I("info")}<div>${esc(message)}</div></div><div class="field" style="margin-top:13px"><label>Barcode, GTIN or SKU</label><input name="barcode" inputmode="numeric" autocomplete="off" autofocus required></div><div class="form-actions"><button type="button" class="button button-outline" data-action="close-modal">Cancel</button><button class="button button-primary">Use code</button></div></form>`,
    );
  }
  async function saveManualBarcode(form) {
    const code = form.elements.barcode.value.trim();
    const callback = state.scanCallback;
    closeModal();
    callback?.(code);
  }
  async function scanImageFile(event) {
    const file = event.target.files?.[0];
    if (!file || !state.scanner) return;
    try {
      $("#scannerStatus").textContent = "Scanning selected image…";
      if (state.scanner.detector) {
        const bitmap = await createImageBitmap(file);
        const results = await state.scanner.detector.detect(bitmap);
        bitmap.close?.();
        if (results?.length) completeBarcodeScan(results[0].rawValue);
        else throw new Error("No supported barcode found in that image");
      } else if (state.scanner.reader) {
        const url = URL.createObjectURL(file);
        try {
          const result = await state.scanner.reader.decodeFromImageUrl(url);
          if (result?.getText) completeBarcodeScan(result.getText());
          else throw new Error("No supported barcode found in that image");
        } finally {
          URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      $("#scannerStatus").textContent = "No barcode detected in that image";
      toast(
        "Image scan failed",
        `${error.message}. Try a sharper image with better lighting.`,
        "warning",
      );
    } finally {
      event.target.value = "";
    }
  }

  function setupInstallability() {
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      state.deferredPrompt = event;
      $("#installButton").hidden = false;
    });
    window.addEventListener("appinstalled", () => {
      state.deferredPrompt = null;
      closeModal();
      toast(
        "App installed",
        "MTECH Retail POS is now available from your home screen.",
        "success",
      );
      renderRegisterChip();
    });
  }

  async function updateReadinessStatuses() {
    try {
      const storedSound = localStorage.getItem("mtech-mobile-sound-ready");
      if (storedSound === "granted") state.readiness.sound = "granted";
      const storedCamera = localStorage.getItem("mtech-camera-ready");
      if (storedCamera === "granted") state.readiness.camera = "granted";
    } catch (_) {}
    if (navigator.permissions?.query) {
      try {
        const cameraPermission = await navigator.permissions.query({
          name: "camera",
        });
        state.readiness.camera = cameraPermission.state;
        cameraPermission.onchange = () => {
          state.readiness.camera = cameraPermission.state;
          if (state.currentView === "pos") renderPOS();
        };
      } catch (_) {
        /* Camera permission querying is not supported in every browser. */
      }
    }
    state.readiness.notifications =
      "Notification" in window ? Notification.permission : "unsupported";
    if (state.currentView === "pos") renderPOS();
  }

  function installReadinessModalBody() {
    const readiness = mobileReadinessStatus();
    const installed =
      window.matchMedia("(display-mode: standalone)").matches ||
      navigator.standalone === true;
    return `<div class="install-readiness-summary"><span>${I(readiness.ready === 4 ? "check" : "download")}</span><div><strong>${installed ? "This app is already installed" : `${readiness.ready} of 4 setup items ready`}</strong><p>Review each mobile capability before opening the browser’s install prompt. Camera, notifications and sound are optional and stay under your control.</p></div></div><div class="install-permission-grid">${readiness.items
      .map((item) => {
        const action = {
          camera: "request-camera-permission",
          notifications: "request-notification-permission",
          sound: "enable-mobile-sound",
          accessibility: "focus-accessibility-setup",
        }[item.key];
        return `<button type="button" class="install-permission ${item.ready ? "ready" : "pending"}" data-action="${action}" ${item.key === "notifications" && state.readiness.notifications === "unsupported" ? "disabled" : ""}>${I(item.icon)}<span><strong>${esc(item.label)}</strong><small>${esc(item.key === "accessibility" ? "App preferences, not an OS permission" : item.status)}</small></span><i>${item.ready ? I("check") : I("arrowRight")}</i></button>`;
      })
      .join("")}</div><form class="mobile-accessibility-form" data-form="mobile-setup" id="mobileAccessibilitySetup"><div class="settings-divider">Accessibility preferences</div><div class="form-grid"><div class="field"><label>Text size</label><select name="textScale"><option value="standard" ${state.business.textScale === "standard" ? "selected" : ""}>Standard</option><option value="large" ${state.business.textScale === "large" ? "selected" : ""}>Large</option><option value="extra-large" ${state.business.textScale === "extra-large" ? "selected" : ""}>Extra large</option></select></div><label class="checkbox-field"><input type="checkbox" name="highContrast" ${settingEnabled("highContrast", false) ? "checked" : ""}><span><strong>High contrast</strong><small>Stronger borders and text</small></span></label><label class="checkbox-field"><input type="checkbox" name="reducedMotion" ${settingEnabled("reducedMotion", false) ? "checked" : ""}><span><strong>Reduce motion</strong><small>Quieter transitions</small></span></label><label class="checkbox-field"><input type="checkbox" name="largeTouchTargets" ${settingEnabled("largeTouchTargets", false) ? "checked" : ""}><span><strong>Larger controls</strong><small>Easier one-handed use</small></span></label></div><div class="form-actions"><button class="button button-outline" type="submit">${I("save")}Save accessibility</button><button class="button button-primary" type="button" data-action="continue-install" ${installed ? "disabled" : ""}>${I("download")}${state.deferredPrompt ? "Continue to install" : "Show install steps"}</button></div></form><div class="notice info install-privacy-note">${I("lock")}<div><strong>Nothing is requested automatically.</strong><br>Each permission is requested only after you tap its control. You can install without enabling optional permissions.</div></div>`;
  }

  async function openInstallReadinessModal() {
    await updateReadinessStatuses();
    openModal(
      "Mobile setup & installation",
      "Prepare this device before adding MTECH POS to the home screen",
      installReadinessModalBody(),
      true,
    );
  }

  async function triggerInstall() {
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      navigator.standalone === true
    ) {
      toast(
        "Already installed",
        "The POS is already running as an installed application.",
        "success",
      );
      return;
    }
    await openInstallReadinessModal();
  }

  async function requestCameraPermission() {
    if (!navigator.mediaDevices?.getUserMedia) {
      state.readiness.camera = "unsupported";
      toast("Camera unavailable", "This browser does not expose camera access.", "warning");
      await openInstallReadinessModal();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      stream.getTracks().forEach((track) => track.stop());
      state.readiness.camera = "granted";
      try {
        localStorage.setItem("mtech-camera-ready", "granted");
      } catch (_) {}
      toast("Camera ready", "Barcode scanning can use the rear camera.", "success");
    } catch (error) {
      state.readiness.camera =
        error.name === "NotAllowedError" ? "denied" : "prompt";
      toast(
        "Camera not enabled",
        error.name === "NotAllowedError"
          ? "Camera access was denied. You can change it later in browser site settings."
          : error.message,
        "warning",
      );
    }
    await openInstallReadinessModal();
  }

  async function requestNotificationPermission() {
    if (!("Notification" in window)) {
      state.readiness.notifications = "unsupported";
      toast("Notifications unavailable", "This browser does not support web notifications.", "warning");
      await openInstallReadinessModal();
      return;
    }
    try {
      state.readiness.notifications = await Notification.requestPermission();
      toast(
        state.readiness.notifications === "granted"
          ? "Notifications ready"
          : "Notifications not enabled",
        state.readiness.notifications === "granted"
          ? "The browser can show permitted POS notifications."
          : "You can continue without notifications.",
        state.readiness.notifications === "granted" ? "success" : "warning",
      );
    } catch (error) {
      toast("Notification request failed", error.message, "warning");
    }
    await openInstallReadinessModal();
  }

  async function enableMobileSound() {
    await primeAudioFromGesture();
    if (state.audioUnlocked) {
      state.readiness.sound = "granted";
      try {
        localStorage.setItem("mtech-mobile-sound-ready", "granted");
      } catch (_) {}
      playTonePattern("bright");
      toast("Sound ready", "Checkout and alert tones can now play on this device.", "success");
    } else {
      toast("Sound unavailable", "The browser did not allow audio on this tap.", "warning");
    }
    await openInstallReadinessModal();
  }

  function updateInstallAccessibilityPreview() {
    const form = $('form[data-form="mobile-setup"]');
    if (!form) return;
    form.classList.add("is-configured");
  }

  async function saveMobileSetup(form) {
    const data = Object.fromEntries(new FormData(form));
    state.business = {
      ...state.business,
      textScale: ["standard", "large", "extra-large"].includes(data.textScale)
        ? data.textScale
        : "standard",
      highContrast: form.elements.highContrast.checked,
      reducedMotion: form.elements.reducedMotion.checked,
      largeTouchTargets: form.elements.largeTouchTargets.checked,
      accessibilityConfigured: true,
    };
    await DB.setSetting("business", state.business);
    applyDisplayPreferences();
    toast("Accessibility saved", "The display preferences are active now.", "success");
    await openInstallReadinessModal();
  }

  async function continueInstall() {
    if (state.deferredPrompt) {
      const prompt = state.deferredPrompt;
      closeModal();
      prompt.prompt();
      const choice = await prompt.userChoice;
      state.deferredPrompt = null;
      if (choice?.outcome !== "accepted")
        toast("Installation paused", "You can reopen setup and install later.", "info");
      return;
    }
    const isiOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    openModal(
      "Install from your browser",
      "The setup review is complete",
      `<div class="notice info">${I("download")}<div>${isiOS ? "In Safari, tap Share, then choose “Add to Home Screen”." : "Open the browser menu and choose “Install app” or “Add to Home screen”. If the option is missing, reload this secure page and try again."}</div></div><div class="breakdown-list"><div class="breakdown-row"><span>Secure HTTPS connection</span><strong>${location.protocol === "https:" ? "Ready" : "Required"}</strong></div><div class="breakdown-row"><span>Offline service worker</span><strong>${"serviceWorker" in navigator ? "Ready" : "Unavailable"}</strong></div><div class="breakdown-row"><span>App manifest</span><strong>Ready</strong></div><div class="breakdown-row"><span>Permissions</span><strong>User controlled</strong></div></div><div class="form-actions"><button class="button button-primary" data-action="close-modal">Done</button></div>`,
    );
  }
  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    try {
      await navigator.serviceWorker.register("/service-worker.js", {
        scope: "/",
      });
    } catch (error) {
      console.warn("Service worker registration failed", error);
    }
  }

  function updateConnectionStatus() {
    const online = navigator.onLine;
    $("#connectionText").textContent = online
      ? "Online · offline ready"
      : "Working offline";
    $("#databaseStatus").textContent = "Local IndexedDB active";
  }
  function openSidebar() {
    $("#sidebar").classList.add("open");
    $("#drawerOverlay").hidden = false;
  }
  function closeSidebar() {
    $("#sidebar").classList.remove("open");
    $("#drawerOverlay").hidden = true;
  }
  function openModal(title, subtitle, body, wide = false) {
    $("#modalTitle").textContent = title;
    $("#modalSubtitle").textContent = subtitle || "";
    $("#modalBody").innerHTML = body;
    $("#modalCard").className = `modal-card ${wide ? "wide" : ""}`;
    $("#modalLayer").hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(
      () =>
        $(
          '#modalBody input[autofocus],#modalBody input:not([type="hidden"]),#modalBody select',
        )?.focus(),
      40,
    );
  }
  function closeModal() {
    if ($("#modalLayer").hidden) return;
    $("#modalLayer").hidden = true;
    $("#modalBody").innerHTML = "";
    document.body.style.overflow = "";
    state.currentReceipt = null;
  }
  function confirmDialog(title, message, onConfirm, label = "Confirm") {
    openModal(
      title,
      "This action requires confirmation",
      `<div class="notice warning">${I("warning")}<div>${esc(message)}</div></div><div class="form-actions"><button class="button button-outline" data-action="close-modal">Cancel</button><button class="button ${label.toLowerCase().includes("delete") ? "button-danger" : "button-primary"}" id="confirmAction">${esc(label)}</button></div>`,
    );
    $("#confirmAction").addEventListener("click", async () => {
      try {
        await onConfirm();
        closeModal();
      } catch (error) {
        toast("Action failed", error.message, "error");
      }
    });
  }
  function toast(title, message, type = "success") {
    const node = document.createElement("div");
    node.className = `toast ${type}`;
    node.innerHTML = `${I(type === "error" ? "warning" : type === "warning" ? "warning" : "check")}<div><strong>${esc(title)}</strong><span>${esc(message)}</span></div>`;
    $("#toastStack").appendChild(node);
    setTimeout(() => node.remove(), 4300);
  }

  async function deleteCategory(id) {
    const category = state.categories.find((c) => c.id === id);
    if (!category) return;
    if (state.products.some((p) => p.categoryId === id)) {
      toast(
        "Category in use",
        "Move its products to another category before deleting it.",
        "warning",
      );
      return;
    }
    await DB.remove("categories", id);
    await loadData();
    openCategoriesModal();
    toast("Category deleted", category.name, "success");
  }
})();
