(() => {
  "use strict";

  const DB_NAME = "RetailPOSDB";
  const DB_VERSION = 6;
  const APP_ID = "MTECH Retail POS";
  let dbPromise;

  const STORE_NAMES = [
    "products",
    "categories",
    "customers",
    "sales",
    "expenses",
    "settings",
    "stockMovements",
    "suppliers",
    "purchaseOrders",
    "purchases",
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

  const uid = (prefix = "id") =>
    globalThis.crypto?.randomUUID
      ? `${prefix}-${globalThis.crypto.randomUUID()}`
      : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const nowISO = () => new Date().toISOString();

  const requestToPromise = (request) =>
    new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(request.error || new Error("Database request failed"));
    });

  const transactionDone = (transaction) =>
    new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(transaction.error || new Error("Database transaction failed"));
      transaction.onabort = () =>
        reject(transaction.error || new Error("Database transaction aborted"));
    });

  function createStore(db, name, keyPath = "id") {
    return db.objectStoreNames.contains(name)
      ? null
      : db.createObjectStore(name, { keyPath });
  }

  function addIndex(store, name, keyPath, options = { unique: false }) {
    if (store && !store.indexNames.contains(name))
      store.createIndex(name, keyPath, options);
  }

  function openDatabase() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const tx = event.target.transaction;

        let store = createStore(db, "products");
        if (!store && tx) store = tx.objectStore("products");
        addIndex(store, "name", "name");
        addIndex(store, "sku", "sku");
        addIndex(store, "barcode", "barcode");
        addIndex(store, "categoryId", "categoryId");
        addIndex(store, "supplierId", "supplierId");
        addIndex(store, "active", "active");

        store = createStore(db, "categories");
        if (!store && tx) store = tx.objectStore("categories");
        addIndex(store, "name", "name", { unique: true });

        store = createStore(db, "customers");
        if (!store && tx) store = tx.objectStore("customers");
        addIndex(store, "name", "name");
        addIndex(store, "phone", "phone");
        addIndex(store, "balance", "balance");

        store = createStore(db, "sales");
        if (!store && tx) store = tx.objectStore("sales");
        addIndex(store, "receiptNo", "receiptNo", { unique: true });
        addIndex(store, "createdAt", "createdAt");
        addIndex(store, "customerId", "customerId");
        addIndex(store, "status", "status");
        addIndex(store, "registerSessionId", "registerSessionId");

        store = createStore(db, "expenses");
        if (!store && tx) store = tx.objectStore("expenses");
        addIndex(store, "date", "date");
        addIndex(store, "category", "category");
        addIndex(store, "registerSessionId", "registerSessionId");
        addIndex(store, "expenseNo", "expenseNo");
        addIndex(store, "vendor", "vendor");
        addIndex(store, "dueDate", "dueDate");
        addIndex(store, "status", "status");
        addIndex(store, "approvalStatus", "approvalStatus");
        addIndex(store, "paymentStatus", "paymentStatus");

        createStore(db, "settings", "key");

        store = createStore(db, "stockMovements");
        if (!store && tx) store = tx.objectStore("stockMovements");
        addIndex(store, "productId", "productId");
        addIndex(store, "createdAt", "createdAt");
        addIndex(store, "referenceId", "referenceId");
        addIndex(store, "type", "type");

        store = createStore(db, "suppliers");
        addIndex(store, "name", "name");
        addIndex(store, "phone", "phone");
        addIndex(store, "balance", "balance");

        store = createStore(db, "purchases");
        addIndex(store, "purchaseNo", "purchaseNo", { unique: true });
        addIndex(store, "supplierId", "supplierId");
        addIndex(store, "date", "date");
        addIndex(store, "status", "status");

        store = createStore(db, "purchaseOrders");
        addIndex(store, "purchaseOrderNo", "purchaseOrderNo", {
          unique: true,
        });
        addIndex(store, "supplierId", "supplierId");
        addIndex(store, "expectedDate", "expectedDate");
        addIndex(store, "status", "status");
        addIndex(store, "createdAt", "createdAt");

        store = createStore(db, "customerPayments");
        addIndex(store, "customerId", "customerId");
        addIndex(store, "date", "date");

        store = createStore(db, "supplierPayments");
        addIndex(store, "supplierId", "supplierId");
        addIndex(store, "date", "date");

        store = createStore(db, "heldSales");
        addIndex(store, "createdAt", "createdAt");

        store = createStore(db, "registerSessions");
        addIndex(store, "status", "status");
        addIndex(store, "openedAt", "openedAt");

        store = createStore(db, "cashMovements");
        addIndex(store, "sessionId", "sessionId");
        addIndex(store, "createdAt", "createdAt");
        addIndex(store, "type", "type");

        store = createStore(db, "stockCounts");
        addIndex(store, "status", "status");
        addIndex(store, "startedAt", "startedAt");

        store = createStore(db, "returns");
        addIndex(store, "saleId", "saleId");
        addIndex(store, "createdAt", "createdAt");
        addIndex(store, "returnNo", "returnNo", { unique: true });

        store = createStore(db, "approvalRequests");
        if (!store && tx) store = tx.objectStore("approvalRequests");
        addIndex(store, "approvalNo", "approvalNo", { unique: true });
        addIndex(store, "saleId", "saleId");
        addIndex(store, "expenseId", "expenseId");
        addIndex(store, "type", "type");
        addIndex(store, "status", "status");
        addIndex(store, "requestedAt", "requestedAt");

        store = createStore(db, "alertStates");
        if (!store && tx) store = tx.objectStore("alertStates");
        addIndex(store, "status", "status");
        addIndex(store, "updatedAt", "updatedAt");

        store = createStore(db, "activityLog");
        addIndex(store, "createdAt", "createdAt");
        addIndex(store, "type", "type");
      };

      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => db.close();
        resolve(db);
      };
      request.onerror = () =>
        reject(
          request.error || new Error("Could not open the local POS database"),
        );
      request.onblocked = () =>
        reject(
          new Error(
            "Database upgrade is blocked. Close other tabs running this POS and reload.",
          ),
        );
    });
    return dbPromise;
  }

  async function getStore(storeName, mode = "readonly") {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, mode);
    return { store: transaction.objectStore(storeName), transaction };
  }

  async function getAll(storeName) {
    const { store } = await getStore(storeName);
    return requestToPromise(store.getAll());
  }

  async function get(storeName, key) {
    const { store } = await getStore(storeName);
    return requestToPromise(store.get(key));
  }

  async function put(storeName, value) {
    const { store, transaction } = await getStore(storeName, "readwrite");
    store.put(value);
    await transactionDone(transaction);
    return value;
  }

  async function add(storeName, value) {
    const { store, transaction } = await getStore(storeName, "readwrite");
    store.add(value);
    await transactionDone(transaction);
    return value;
  }

  async function remove(storeName, key) {
    const { store, transaction } = await getStore(storeName, "readwrite");
    store.delete(key);
    await transactionDone(transaction);
  }

  async function clear(storeName) {
    const { store, transaction } = await getStore(storeName, "readwrite");
    store.clear();
    await transactionDone(transaction);
  }

  async function bulkPut(storeName, values) {
    const { store, transaction } = await getStore(storeName, "readwrite");
    values.forEach((value) => store.put(value));
    await transactionDone(transaction);
    return values;
  }

  async function getSetting(key, fallback = null) {
    const record = await get("settings", key);
    return record ? record.value : fallback;
  }

  async function setSetting(key, value) {
    return put("settings", { key, value });
  }

  async function nextSequence(key, prefix) {
    const db = await openDatabase();
    const transaction = db.transaction("settings", "readwrite");
    const store = transaction.objectStore("settings");
    const current = await requestToPromise(store.get(key));
    const sequence = Number(current?.value || 1);
    store.put({ key, value: sequence + 1 });
    await transactionDone(transaction);
    return `${prefix}-${String(sequence).padStart(6, "0")}`;
  }

  function logRecord(
    store,
    type,
    summary,
    referenceId = null,
    timestamp = nowISO(),
  ) {
    store.put({
      id: uid("log"),
      type,
      summary,
      referenceId,
      createdAt: timestamp,
    });
  }

  async function completeSale(sale) {
    const db = await openDatabase();
    const names = [
      "products",
      "sales",
      "customers",
      "stockMovements",
      "cashMovements",
      "activityLog",
    ];
    const transaction = db.transaction(names, "readwrite");
    const products = transaction.objectStore("products");
    const sales = transaction.objectStore("sales");
    const customers = transaction.objectStore("customers");
    const movements = transaction.objectStore("stockMovements");
    const cashMovements = transaction.objectStore("cashMovements");
    const activity = transaction.objectStore("activityLog");

    try {
      for (const item of sale.items) {
        const product = await requestToPromise(products.get(item.productId));
        if (!product) throw new Error(`Product not found: ${item.name}`);
        if (
          !sale.allowNegativeStock &&
          product.trackStock !== false &&
          Number(product.stock || 0) < Number(item.quantity)
        ) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${product.stock || 0}`,
          );
        }
        if (product.trackStock !== false) {
          const stockBefore = Number(product.stock || 0);
          const stockAfter = stockBefore - Number(item.quantity);
          products.put({
            ...product,
            stock: stockAfter,
            updatedAt: sale.createdAt,
          });
          movements.put({
            id: uid("mov"),
            productId: product.id,
            productName: product.name,
            type: "sale",
            quantity: -Number(item.quantity),
            stockBefore,
            stockAfter,
            referenceType: "sale",
            referenceId: sale.id,
            note: sale.receiptNo,
            createdAt: sale.createdAt,
          });
        }
      }

      const creditAmount = (sale.payments || [])
        .filter((p) => p.method === "credit")
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
      if (sale.customerId) {
        const customer = await requestToPromise(customers.get(sale.customerId));
        if (customer) {
          const balance = Number(customer.balance || 0) + creditAmount;
          if (
            Number(customer.creditLimit || 0) > 0 &&
            balance > Number(customer.creditLimit)
          ) {
            throw new Error(`Credit limit exceeded for ${customer.name}`);
          }
          customers.put({
            ...customer,
            balance,
            totalPurchases:
              Number(customer.totalPurchases || 0) + Number(sale.total || 0),
            purchaseCount: Number(customer.purchaseCount || 0) + 1,
            lastPurchaseAt: sale.createdAt,
            updatedAt: sale.createdAt,
          });
        }
      } else if (creditAmount > 0) {
        throw new Error("A customer is required for a credit sale");
      }

      for (const payment of sale.payments || []) {
        if (
          payment.method === "cash" &&
          Number(payment.amount) > 0 &&
          sale.registerSessionId
        ) {
          cashMovements.put({
            id: uid("cash"),
            sessionId: sale.registerSessionId,
            type: "sale",
            amount: Number(payment.amount),
            paymentMethod: "cash",
            referenceType: "sale",
            referenceId: sale.id,
            note: sale.receiptNo,
            createdAt: sale.createdAt,
          });
        }
      }

      sales.add(sale);
      logRecord(
        activity,
        "sale",
        `Completed ${sale.receiptNo} for ${Number(sale.total || 0)}`,
        sale.id,
        sale.createdAt,
      );
      await transactionDone(transaction);
      return sale;
    } catch (error) {
      try {
        transaction.abort();
      } catch (_) {
        /* no-op */
      }
      throw error;
    }
  }

  async function requestApproval(request) {
    const db = await openDatabase();
    const transaction = db.transaction(
      ["approvalRequests", "activityLog"],
      "readwrite",
    );
    const approvals = transaction.objectStore("approvalRequests");
    const activity = transaction.objectStore("activityLog");
    try {
      const relationIndex = request.type === "expense" ? "expenseId" : "saleId";
      const relationValue =
        request.type === "expense" ? request.expenseId : request.saleId;
      const related = relationValue
        ? await requestToPromise(
            approvals.index(relationIndex).getAll(relationValue),
          )
        : [];
      if (
        related.some(
          (item) => item.status === "pending" && item.type === request.type,
        )
      ) {
        throw new Error(
          `A pending ${request.type} request already exists for this record`,
        );
      }
      const record = {
        ...request,
        status: "pending",
        requestedAt: request.requestedAt || nowISO(),
      };
      approvals.add(record);
      logRecord(
        activity,
        "approval-request",
        `Requested ${record.type} approval ${record.approvalNo}`,
        record.id,
        record.requestedAt,
      );
      await transactionDone(transaction);
      return record;
    } catch (error) {
      try {
        transaction.abort();
      } catch (_) {
        /* no-op */
      }
      throw error;
    }
  }

  async function rejectApprovalRequest(approvalId, review) {
    const db = await openDatabase();
    const transaction = db.transaction(
      ["approvalRequests", "expenses", "activityLog"],
      "readwrite",
    );
    const approvals = transaction.objectStore("approvalRequests");
    const expenses = transaction.objectStore("expenses");
    const activity = transaction.objectStore("activityLog");
    try {
      const approval = await requestToPromise(approvals.get(approvalId));
      if (!approval) throw new Error("Approval request not found");
      if (approval.status !== "pending")
        throw new Error("This approval request has already been reviewed");
      const reviewedAt = review.reviewedAt || nowISO();
      const updated = {
        ...approval,
        status: "rejected",
        reviewedAt,
        reviewedBy: review.reviewedBy,
        reviewNote: review.reviewNote || "",
      };
      approvals.put(updated);
      if (approval.type === "expense" && approval.expenseId) {
        const expense = await requestToPromise(expenses.get(approval.expenseId));
        if (expense) {
          expenses.put({
            ...expense,
            approvalStatus: "rejected",
            status: "rejected",
            rejectedAt: reviewedAt,
            rejectedBy: review.reviewedBy,
            reviewNote: review.reviewNote || "",
            updatedAt: reviewedAt,
          });
        }
      }
      logRecord(
        activity,
        "approval-rejected",
        `Rejected ${approval.approvalNo} by ${review.reviewedBy}`,
        approval.id,
        reviewedAt,
      );
      await transactionDone(transaction);
      return updated;
    } catch (error) {
      try {
        transaction.abort();
      } catch (_) {
        /* no-op */
      }
      throw error;
    }
  }

  async function processReturn(returnData, approvalReview = null) {
    const db = await openDatabase();
    const names = [
      "products",
      "sales",
      "customers",
      "stockMovements",
      "returns",
      "cashMovements",
      "approvalRequests",
      "activityLog",
    ];
    const transaction = db.transaction(names, "readwrite");
    const products = transaction.objectStore("products");
    const sales = transaction.objectStore("sales");
    const customers = transaction.objectStore("customers");
    const movements = transaction.objectStore("stockMovements");
    const returns = transaction.objectStore("returns");
    const cashMovements = transaction.objectStore("cashMovements");
    const approvals = transaction.objectStore("approvalRequests");
    const activity = transaction.objectStore("activityLog");

    try {
      let approval = null;
      if (approvalReview?.approvalId) {
        approval = await requestToPromise(
          approvals.get(approvalReview.approvalId),
        );
        if (!approval || approval.type !== "return")
          throw new Error("Return approval request not found");
        if (approval.status !== "pending")
          throw new Error("This return request has already been reviewed");
        returnData = {
          ...approval.payload,
          approvalId: approval.id,
          createdAt: approvalReview.reviewedAt || nowISO(),
        };
      }
      const sale = await requestToPromise(sales.get(returnData.saleId));
      if (!sale) throw new Error("Sale not found");
      if (sale.status === "voided")
        throw new Error("A voided sale cannot be returned");

      const updatedItems = sale.items.map((item) => ({ ...item }));
      for (const returnItem of returnData.items) {
        const saleItem = updatedItems.find(
          (item) => item.productId === returnItem.productId,
        );
        if (!saleItem)
          throw new Error(`Sale item not found: ${returnItem.name}`);
        const alreadyReturned = Number(saleItem.returnedQty || 0);
        const available = Number(saleItem.quantity) - alreadyReturned;
        if (
          Number(returnItem.quantity) <= 0 ||
          Number(returnItem.quantity) > available
        ) {
          throw new Error(`Invalid return quantity for ${saleItem.name}`);
        }
        saleItem.returnedQty = alreadyReturned + Number(returnItem.quantity);

        if (returnItem.restock !== false) {
          const product = await requestToPromise(
            products.get(returnItem.productId),
          );
          if (product && product.trackStock !== false) {
            const stockBefore = Number(product.stock || 0);
            const stockAfter = stockBefore + Number(returnItem.quantity);
            products.put({
              ...product,
              stock: stockAfter,
              updatedAt: returnData.createdAt,
            });
            movements.put({
              id: uid("mov"),
              productId: product.id,
              productName: product.name,
              type: "return",
              quantity: Number(returnItem.quantity),
              stockBefore,
              stockAfter,
              referenceType: "return",
              referenceId: returnData.id,
              note: `${sale.receiptNo} return`,
              createdAt: returnData.createdAt,
            });
          }
        }
      }

      const allReturned = updatedItems.every(
        (item) => Number(item.returnedQty || 0) >= Number(item.quantity),
      );
      const updatedSale = {
        ...sale,
        items: updatedItems,
        returnedAmount:
          Number(sale.returnedAmount || 0) +
          Number(returnData.refundTotal || 0),
        status: allReturned ? "refunded" : "partially-refunded",
        updatedAt: returnData.createdAt,
      };
      sales.put(updatedSale);

      if (sale.customerId) {
        const customer = await requestToPromise(customers.get(sale.customerId));
        if (customer) {
          const debtReduction =
            returnData.refundMethod === "credit-account"
              ? Number(returnData.refundTotal || 0)
              : 0;
          customers.put({
            ...customer,
            balance: Math.max(0, Number(customer.balance || 0) - debtReduction),
            totalPurchases: Math.max(
              0,
              Number(customer.totalPurchases || 0) -
                Number(returnData.refundTotal || 0),
            ),
            updatedAt: returnData.createdAt,
          });
        }
      }

      if (returnData.refundMethod === "cash" && sale.registerSessionId) {
        cashMovements.put({
          id: uid("cash"),
          sessionId: sale.registerSessionId,
          type: "refund",
          amount: -Number(returnData.refundTotal || 0),
          paymentMethod: "cash",
          referenceType: "return",
          referenceId: returnData.id,
          note: `${sale.receiptNo} return`,
          createdAt: returnData.createdAt,
        });
      }

      returns.add(returnData);
      if (approval) {
        approvals.put({
          ...approval,
          status: "approved",
          reviewedAt: returnData.createdAt,
          reviewedBy: approvalReview.reviewedBy,
          reviewNote: approvalReview.reviewNote || "",
          processedRecordId: returnData.id,
        });
      }
      logRecord(
        activity,
        "return",
        `Returned ${returnData.returnNo} against ${sale.receiptNo}${approvalReview?.reviewedBy ? ` approved by ${approvalReview.reviewedBy}` : ""}`,
        returnData.id,
        returnData.createdAt,
      );
      await transactionDone(transaction);
      return { sale: updatedSale, returnRecord: returnData };
    } catch (error) {
      try {
        transaction.abort();
      } catch (_) {
        /* no-op */
      }
      throw error;
    }
  }

  async function processVoid(approvalId, review) {
    const db = await openDatabase();
    const names = [
      "products",
      "sales",
      "customers",
      "stockMovements",
      "cashMovements",
      "returns",
      "approvalRequests",
      "activityLog",
    ];
    const transaction = db.transaction(names, "readwrite");
    const products = transaction.objectStore("products");
    const sales = transaction.objectStore("sales");
    const customers = transaction.objectStore("customers");
    const movements = transaction.objectStore("stockMovements");
    const cashMovements = transaction.objectStore("cashMovements");
    const returns = transaction.objectStore("returns");
    const approvals = transaction.objectStore("approvalRequests");
    const activity = transaction.objectStore("activityLog");
    try {
      const approval = await requestToPromise(approvals.get(approvalId));
      if (!approval || approval.type !== "void")
        throw new Error("Void approval request not found");
      if (approval.status !== "pending")
        throw new Error("This void request has already been reviewed");
      const sale = await requestToPromise(sales.get(approval.saleId));
      if (!sale) throw new Error("Sale not found");
      if (sale.status !== "completed")
        throw new Error("Only a completed sale with no returns can be voided");
      const existingReturns = await requestToPromise(
        returns.index("saleId").getAll(sale.id),
      );
      if (existingReturns.length)
        throw new Error("A sale with processed returns cannot be voided");

      const reviewedAt = review.reviewedAt || nowISO();
      for (const item of sale.items || []) {
        const product = await requestToPromise(products.get(item.productId));
        if (!product || product.trackStock === false) continue;
        const stockBefore = Number(product.stock || 0);
        const stockAfter = stockBefore + Number(item.quantity || 0);
        products.put({ ...product, stock: stockAfter, updatedAt: reviewedAt });
        movements.put({
          id: uid("mov"),
          productId: product.id,
          productName: product.name,
          type: "void",
          quantity: Number(item.quantity || 0),
          stockBefore,
          stockAfter,
          referenceType: "void",
          referenceId: approval.id,
          note: `${sale.receiptNo} void`,
          createdAt: reviewedAt,
        });
      }

      if (sale.customerId) {
        const customer = await requestToPromise(customers.get(sale.customerId));
        if (customer) {
          const creditAmount = (sale.payments || [])
            .filter((payment) => payment.method === "credit")
            .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
          customers.put({
            ...customer,
            balance: Math.max(0, Number(customer.balance || 0) - creditAmount),
            totalPurchases: Math.max(
              0,
              Number(customer.totalPurchases || 0) - Number(sale.total || 0),
            ),
            purchaseCount: Math.max(
              0,
              Number(customer.purchaseCount || 0) - 1,
            ),
            updatedAt: reviewedAt,
          });
        }
      }

      const cashAmount = (sale.payments || [])
        .filter((payment) => payment.method === "cash")
        .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
      const registerSessionId =
        review.registerSessionId || sale.registerSessionId || "";
      if (cashAmount > 0 && registerSessionId) {
        cashMovements.put({
          id: uid("cash"),
          sessionId: registerSessionId,
          type: "void",
          amount: -cashAmount,
          paymentMethod: "cash",
          referenceType: "void",
          referenceId: approval.id,
          note: `${sale.receiptNo} void`,
          createdAt: reviewedAt,
        });
      }

      const updatedSale = {
        ...sale,
        status: "voided",
        voidedAt: reviewedAt,
        voidedBy: review.reviewedBy,
        voidReason: approval.reason,
        voidNotes: approval.notes || "",
        approvalId: approval.id,
        updatedAt: reviewedAt,
      };
      sales.put(updatedSale);
      approvals.put({
        ...approval,
        status: "approved",
        reviewedAt,
        reviewedBy: review.reviewedBy,
        reviewNote: review.reviewNote || "",
        processedRecordId: sale.id,
      });
      logRecord(
        activity,
        "void",
        `Voided ${sale.receiptNo} approved by ${review.reviewedBy}`,
        sale.id,
        reviewedAt,
      );
      await transactionDone(transaction);
      return { sale: updatedSale, approvalId: approval.id };
    } catch (error) {
      try {
        transaction.abort();
      } catch (_) {
        /* no-op */
      }
      throw error;
    }
  }

  async function processExpenseApproval(approvalId, review) {
    const db = await openDatabase();
    const transaction = db.transaction(
      ["expenses", "cashMovements", "approvalRequests", "activityLog"],
      "readwrite",
    );
    const expenses = transaction.objectStore("expenses");
    const cash = transaction.objectStore("cashMovements");
    const approvals = transaction.objectStore("approvalRequests");
    const activity = transaction.objectStore("activityLog");
    try {
      const approval = await requestToPromise(approvals.get(approvalId));
      if (!approval || approval.type !== "expense")
        throw new Error("Expense approval request not found");
      if (approval.status !== "pending")
        throw new Error("This expense request has already been reviewed");
      const expense = await requestToPromise(expenses.get(approval.expenseId));
      if (!expense) throw new Error("Expense record not found");
      const reviewedAt = review.reviewedAt || nowISO();
      const registerSessionId =
        review.registerSessionId || expense.registerSessionId || "";
      let cashMovementId = expense.cashMovementId || null;
      if (
        expense.paymentStatus === "paid" &&
        expense.paymentMethod === "cash" &&
        registerSessionId &&
        !cashMovementId
      ) {
        cashMovementId = uid("cash");
        cash.put({
          id: cashMovementId,
          sessionId: registerSessionId,
          type: "expense",
          amount: -Number(expense.amount || 0),
          paymentMethod: "cash",
          referenceType: "expense",
          referenceId: expense.id,
          note: expense.description,
          createdAt: reviewedAt,
        });
      }
      const updatedExpense = {
        ...expense,
        approvalStatus: "approved",
        status: expense.paymentStatus === "paid" ? "paid" : "unpaid",
        approvedAt: reviewedAt,
        approvedBy: review.reviewedBy,
        reviewNote: review.reviewNote || "",
        registerSessionId,
        cashMovementId,
        updatedAt: reviewedAt,
      };
      expenses.put(updatedExpense);
      approvals.put({
        ...approval,
        status: "approved",
        reviewedAt,
        reviewedBy: review.reviewedBy,
        reviewNote: review.reviewNote || "",
        processedRecordId: expense.id,
      });
      logRecord(
        activity,
        "expense-approved",
        `Approved ${expense.expenseNo || "expense"} by ${review.reviewedBy}`,
        expense.id,
        reviewedAt,
      );
      await transactionDone(transaction);
      return { expense: updatedExpense, approvalId };
    } catch (error) {
      try {
        transaction.abort();
      } catch (_) {
        /* no-op */
      }
      throw error;
    }
  }

  async function approveApprovalRequest(approvalId, review) {
    const approval = await get("approvalRequests", approvalId);
    if (!approval) throw new Error("Approval request not found");
    if (approval.type === "return")
      return processReturn(null, { ...review, approvalId });
    if (approval.type === "void") return processVoid(approvalId, review);
    if (approval.type === "expense")
      return processExpenseApproval(approvalId, review);
    throw new Error(`Unsupported approval type: ${approval.type}`);
  }

  async function savePurchaseOrder(order) {
    const db = await openDatabase();
    const transaction = db.transaction(
      ["purchaseOrders", "activityLog"],
      "readwrite",
    );
    const orders = transaction.objectStore("purchaseOrders");
    const activity = transaction.objectStore("activityLog");
    try {
      orders.put(order);
      logRecord(
        activity,
        "purchase-order",
        `${order.status === "ordered" ? "Submitted" : "Saved"} ${order.purchaseOrderNo}`,
        order.id,
        order.updatedAt || order.createdAt,
      );
      await transactionDone(transaction);
      return order;
    } catch (error) {
      try {
        transaction.abort();
      } catch (_) {
        /* no-op */
      }
      throw error;
    }
  }

  async function updatePurchaseOrderStatus(orderId, status, note = "") {
    const allowed = {
      draft: ["ordered", "cancelled"],
      ordered: ["cancelled"],
      "partially-received": ["cancelled"],
    };
    const db = await openDatabase();
    const transaction = db.transaction(
      ["purchaseOrders", "activityLog"],
      "readwrite",
    );
    const orders = transaction.objectStore("purchaseOrders");
    const activity = transaction.objectStore("activityLog");
    try {
      const order = await requestToPromise(orders.get(orderId));
      if (!order) throw new Error("Purchase order not found");
      if (!(allowed[order.status] || []).includes(status))
        throw new Error(`Cannot change ${order.status} order to ${status}`);
      const updatedAt = nowISO();
      const updated = {
        ...order,
        status,
        statusNote: note,
        orderedAt: status === "ordered" ? updatedAt : order.orderedAt,
        cancelledAt: status === "cancelled" ? updatedAt : order.cancelledAt,
        updatedAt,
      };
      orders.put(updated);
      logRecord(
        activity,
        "purchase-order",
        `${order.purchaseOrderNo} marked ${status}`,
        order.id,
        updatedAt,
      );
      await transactionDone(transaction);
      return updated;
    } catch (error) {
      try {
        transaction.abort();
      } catch (_) {
        /* no-op */
      }
      throw error;
    }
  }

  async function receivePurchase(purchase) {
    const db = await openDatabase();
    const names = [
      "products",
      "purchaseOrders",
      "purchases",
      "suppliers",
      "stockMovements",
      "cashMovements",
      "activityLog",
    ];
    const transaction = db.transaction(names, "readwrite");
    const products = transaction.objectStore("products");
    const purchaseOrders = transaction.objectStore("purchaseOrders");
    const purchases = transaction.objectStore("purchases");
    const suppliers = transaction.objectStore("suppliers");
    const movements = transaction.objectStore("stockMovements");
    const cashMovements = transaction.objectStore("cashMovements");
    const activity = transaction.objectStore("activityLog");

    try {
      let purchaseOrder = null;
      let orderItems = null;
      if (purchase.purchaseOrderId) {
        purchaseOrder = await requestToPromise(
          purchaseOrders.get(purchase.purchaseOrderId),
        );
        if (!purchaseOrder)
          throw new Error("Linked purchase order was not found");
        if (!['ordered', 'partially-received'].includes(purchaseOrder.status))
          throw new Error("Only ordered purchase orders can receive stock");
        orderItems = (purchaseOrder.items || []).map((item) => ({ ...item }));
      }
      for (const item of purchase.items) {
        if (purchaseOrder) {
          const orderItem = orderItems.find(
            (candidate) =>
              candidate.id === item.orderItemId ||
              candidate.productId === item.productId,
          );
          if (!orderItem)
            throw new Error(`Product is not part of ${purchaseOrder.purchaseOrderNo}`);
          const remaining =
            Number(orderItem.quantity || 0) -
            Number(orderItem.receivedQuantity || 0);
          if (Number(item.quantity || 0) > remaining)
            throw new Error(
              `Received quantity for ${item.name} exceeds the ${remaining} remaining`,
            );
          orderItem.receivedQuantity =
            Number(orderItem.receivedQuantity || 0) +
            Number(item.quantity || 0);
          item.orderItemId = orderItem.id;
        }
        const product = await requestToPromise(products.get(item.productId));
        if (!product) throw new Error(`Product not found: ${item.name}`);
        const stockBefore = Number(product.stock || 0);
        const stockAfter = stockBefore + Number(item.quantity || 0);
        products.put({
          ...product,
          stock: stockAfter,
          purchasePrice: Number(item.unitCost || product.purchasePrice || 0),
          supplierId: purchase.supplierId || product.supplierId || "",
          batchNo: item.batchNo || product.batchNo || "",
          expiryDate: item.expiryDate || product.expiryDate || "",
          updatedAt: purchase.createdAt,
        });
        movements.put({
          id: uid("mov"),
          productId: product.id,
          productName: product.name,
          type: "purchase",
          quantity: Number(item.quantity || 0),
          stockBefore,
          stockAfter,
          referenceType: "purchase",
          referenceId: purchase.id,
          note: purchase.purchaseNo,
          createdAt: purchase.createdAt,
        });
      }

      if (purchaseOrder) {
        const fullyReceived = orderItems.every(
          (item) =>
            Number(item.receivedQuantity || 0) >= Number(item.quantity || 0),
        );
        purchaseOrders.put({
          ...purchaseOrder,
          items: orderItems,
          status: fullyReceived ? "received" : "partially-received",
          lastReceivedAt: purchase.createdAt,
          receivedAt: fullyReceived ? purchase.createdAt : null,
          updatedAt: purchase.createdAt,
        });
      }

      if (purchase.supplierId) {
        const supplier = await requestToPromise(
          suppliers.get(purchase.supplierId),
        );
        if (supplier) {
          suppliers.put({
            ...supplier,
            balance:
              Number(supplier.balance || 0) + Number(purchase.balance || 0),
            totalPurchases:
              Number(supplier.totalPurchases || 0) +
              Number(purchase.total || 0),
            lastPurchaseAt: purchase.date,
            updatedAt: purchase.createdAt,
          });
        }
      }

      if (
        purchase.paymentMethod === "cash" &&
        Number(purchase.paid || 0) > 0 &&
        purchase.registerSessionId
      ) {
        cashMovements.put({
          id: uid("cash"),
          sessionId: purchase.registerSessionId,
          type: "purchase",
          amount: -Number(purchase.paid),
          paymentMethod: "cash",
          referenceType: "purchase",
          referenceId: purchase.id,
          note: purchase.purchaseNo,
          createdAt: purchase.createdAt,
        });
      }
      purchases.add(purchase);
      logRecord(
        activity,
        "purchase",
        `Received ${purchase.purchaseNo} for ${Number(purchase.total || 0)}${purchaseOrder ? ` against ${purchaseOrder.purchaseOrderNo}` : ""}`,
        purchase.id,
        purchase.createdAt,
      );
      await transactionDone(transaction);
      return purchase;
    } catch (error) {
      try {
        transaction.abort();
      } catch (_) {
        /* no-op */
      }
      throw error;
    }
  }

  function expenseCanAffectCash(expense) {
    return (
      expense.paymentStatus === "paid" &&
      !["pending", "rejected"].includes(expense.approvalStatus) &&
      expense.status !== "voided"
    );
  }

  async function saveExpense(expense, previous = null, approvalRequest = null) {
    const db = await openDatabase();
    const transaction = db.transaction(
      ["expenses", "cashMovements", "approvalRequests", "activityLog"],
      "readwrite",
    );
    const expenses = transaction.objectStore("expenses");
    const cash = transaction.objectStore("cashMovements");
    const approvals = transaction.objectStore("approvalRequests");
    const activity = transaction.objectStore("activityLog");
    try {
      if (previous?.cashMovementId) cash.delete(previous.cashMovementId);
      let cashMovementId = null;
      if (
        expenseCanAffectCash(expense) &&
        expense.paymentMethod === "cash" &&
        expense.registerSessionId
      ) {
        cashMovementId = uid("cash");
        cash.put({
          id: cashMovementId,
          sessionId: expense.registerSessionId,
          type: "expense",
          amount: -Number(expense.amount || 0),
          paymentMethod: "cash",
          referenceType: "expense",
          referenceId: expense.id,
          note: expense.description,
          createdAt: expense.createdAt,
        });
      }
      const record = { ...expense, cashMovementId };
      expenses.put(record);
      if (approvalRequest) {
        approvals.add({
          ...approvalRequest,
          expenseId: record.id,
          status: "pending",
          requestedAt: approvalRequest.requestedAt || nowISO(),
        });
        logRecord(
          activity,
          "approval-request",
          `Requested expense approval ${approvalRequest.approvalNo}`,
          approvalRequest.id,
          approvalRequest.requestedAt,
        );
      }
      logRecord(
        activity,
        "expense",
        `${previous ? "Updated" : "Recorded"} ${expense.expenseNo || "expense"}: ${expense.description}`,
        expense.id,
        expense.createdAt,
      );
      await transactionDone(transaction);
      return record;
    } catch (error) {
      try {
        transaction.abort();
      } catch (_) {
        /* no-op */
      }
      throw error;
    }
  }

  async function deleteExpense(expenseId) {
    const db = await openDatabase();
    const transaction = db.transaction(
      ["expenses", "cashMovements", "activityLog"],
      "readwrite",
    );
    const expenses = transaction.objectStore("expenses");
    const cash = transaction.objectStore("cashMovements");
    const activity = transaction.objectStore("activityLog");
    const expense = await requestToPromise(expenses.get(expenseId));
    if (!expense) throw new Error("Expense not found");
    if (expense.paymentStatus === "paid" || expense.cashMovementId)
      throw new Error("Paid expenses cannot be deleted. Void the record instead.");
    if (expense.approvalStatus === "pending")
      throw new Error("A pending expense approval cannot be deleted");
    if (expense.approvalStatus && expense.approvalStatus !== "not-required")
      throw new Error("Reviewed expense records must remain in the audit history");
    expenses.delete(expenseId);
    if (expense.cashMovementId) cash.delete(expense.cashMovementId);
    logRecord(
      activity,
      "expense",
      `Deleted expense: ${expense.description}`,
      expense.id,
    );
    await transactionDone(transaction);
  }

  async function markExpensePaid(expenseId, payment) {
    const db = await openDatabase();
    const transaction = db.transaction(
      ["expenses", "cashMovements", "activityLog"],
      "readwrite",
    );
    const expenses = transaction.objectStore("expenses");
    const cash = transaction.objectStore("cashMovements");
    const activity = transaction.objectStore("activityLog");
    try {
      const expense = await requestToPromise(expenses.get(expenseId));
      if (!expense) throw new Error("Expense not found");
      if (["pending", "rejected"].includes(expense.approvalStatus))
        throw new Error("This expense must be approved before payment");
      if (expense.status === "voided")
        throw new Error("A voided expense cannot be paid");
      if (expense.paymentStatus === "paid")
        throw new Error("This expense is already paid");
      const paidAt = payment.paidAt || nowISO();
      let cashMovementId = null;
      if (payment.paymentMethod === "cash" && payment.registerSessionId) {
        cashMovementId = uid("cash");
        cash.put({
          id: cashMovementId,
          sessionId: payment.registerSessionId,
          type: "expense",
          amount: -Number(expense.amount || 0),
          paymentMethod: "cash",
          referenceType: "expense",
          referenceId: expense.id,
          note: expense.description,
          createdAt: paidAt,
        });
      }
      const updated = {
        ...expense,
        paymentStatus: "paid",
        status: "paid",
        paymentMethod: payment.paymentMethod,
        paymentReference: payment.paymentReference || "",
        paidAt,
        paidBy: payment.paidBy || "",
        registerSessionId: payment.registerSessionId || "",
        cashMovementId,
        updatedAt: paidAt,
      };
      expenses.put(updated);
      logRecord(
        activity,
        "expense-payment",
        `Paid ${expense.expenseNo || "expense"} by ${payment.paymentMethod}`,
        expense.id,
        paidAt,
      );
      await transactionDone(transaction);
      return updated;
    } catch (error) {
      try {
        transaction.abort();
      } catch (_) {
        /* no-op */
      }
      throw error;
    }
  }

  async function voidExpense(expenseId, review) {
    const db = await openDatabase();
    const transaction = db.transaction(
      ["expenses", "cashMovements", "activityLog"],
      "readwrite",
    );
    const expenses = transaction.objectStore("expenses");
    const cash = transaction.objectStore("cashMovements");
    const activity = transaction.objectStore("activityLog");
    try {
      const expense = await requestToPromise(expenses.get(expenseId));
      if (!expense) throw new Error("Expense not found");
      if (expense.status === "voided")
        throw new Error("This expense is already voided");
      if (expense.approvalStatus === "pending")
        throw new Error("Review the pending approval before voiding this expense");
      const voidedAt = review.voidedAt || nowISO();
      if (expense.cashMovementId) cash.delete(expense.cashMovementId);
      const updated = {
        ...expense,
        status: "voided",
        voidedAt,
        voidedBy: review.voidedBy,
        voidReason: review.voidReason || "",
        cashMovementId: null,
        updatedAt: voidedAt,
      };
      expenses.put(updated);
      logRecord(
        activity,
        "expense-void",
        `Voided ${expense.expenseNo || "expense"} by ${review.voidedBy}`,
        expense.id,
        voidedAt,
      );
      await transactionDone(transaction);
      return updated;
    } catch (error) {
      try {
        transaction.abort();
      } catch (_) {
        /* no-op */
      }
      throw error;
    }
  }

  async function adjustStock(
    productId,
    quantityChange,
    note = "",
    type = "adjustment",
  ) {
    const db = await openDatabase();
    const transaction = db.transaction(
      ["products", "stockMovements", "activityLog"],
      "readwrite",
    );
    const products = transaction.objectStore("products");
    const movements = transaction.objectStore("stockMovements");
    const activity = transaction.objectStore("activityLog");
    try {
      const product = await requestToPromise(products.get(productId));
      if (!product) throw new Error("Product not found");
      const stockBefore = Number(product.stock || 0);
      const stockAfter = stockBefore + Number(quantityChange || 0);
      if (stockAfter < 0) throw new Error("Stock cannot be below zero");
      const timestamp = nowISO();
      const updated = { ...product, stock: stockAfter, updatedAt: timestamp };
      products.put(updated);
      movements.put({
        id: uid("mov"),
        productId,
        productName: product.name,
        type,
        quantity: Number(quantityChange),
        stockBefore,
        stockAfter,
        referenceType: "adjustment",
        referenceId: null,
        note,
        createdAt: timestamp,
      });
      logRecord(
        activity,
        "inventory",
        `Adjusted ${product.name} by ${Number(quantityChange)}`,
        productId,
        timestamp,
      );
      await transactionDone(transaction);
      return updated;
    } catch (error) {
      try {
        transaction.abort();
      } catch (_) {
        /* no-op */
      }
      throw error;
    }
  }

  async function completeStockCount(count) {
    const db = await openDatabase();
    const transaction = db.transaction(
      ["products", "stockMovements", "stockCounts", "activityLog"],
      "readwrite",
    );
    const products = transaction.objectStore("products");
    const movements = transaction.objectStore("stockMovements");
    const counts = transaction.objectStore("stockCounts");
    const activity = transaction.objectStore("activityLog");
    try {
      const completedAt = nowISO();
      const finalItems = [];
      for (const item of count.items) {
        const product = await requestToPromise(products.get(item.productId));
        if (!product) continue;
        const stockBefore = Number(product.stock || 0);
        const counted = Number(item.counted || 0);
        const difference = counted - stockBefore;
        finalItems.push({ ...item, systemStock: stockBefore, difference });
        if (difference !== 0) {
          products.put({ ...product, stock: counted, updatedAt: completedAt });
          movements.put({
            id: uid("mov"),
            productId: product.id,
            productName: product.name,
            type: "stock-count",
            quantity: difference,
            stockBefore,
            stockAfter: counted,
            referenceType: "stock-count",
            referenceId: count.id,
            note: count.notes || count.countNo,
            createdAt: completedAt,
          });
        }
      }
      const record = {
        ...count,
        items: finalItems,
        status: "completed",
        completedAt,
      };
      counts.put(record);
      logRecord(
        activity,
        "stock-count",
        `Completed ${count.countNo}`,
        count.id,
        completedAt,
      );
      await transactionDone(transaction);
      return record;
    } catch (error) {
      try {
        transaction.abort();
      } catch (_) {
        /* no-op */
      }
      throw error;
    }
  }

  async function recordCustomerPayment(payment) {
    const db = await openDatabase();
    const transaction = db.transaction(
      ["customers", "customerPayments", "cashMovements", "activityLog"],
      "readwrite",
    );
    const customers = transaction.objectStore("customers");
    const payments = transaction.objectStore("customerPayments");
    const cash = transaction.objectStore("cashMovements");
    const activity = transaction.objectStore("activityLog");
    try {
      const customer = await requestToPromise(
        customers.get(payment.customerId),
      );
      if (!customer) throw new Error("Customer not found");
      if (Number(payment.amount || 0) <= 0)
        throw new Error("Payment amount must be greater than zero");
      customers.put({
        ...customer,
        balance: Math.max(
          0,
          Number(customer.balance || 0) - Number(payment.amount),
        ),
        updatedAt: payment.createdAt,
      });
      payments.add(payment);
      if (payment.paymentMethod === "cash" && payment.registerSessionId) {
        cash.put({
          id: uid("cash"),
          sessionId: payment.registerSessionId,
          type: "customer-payment",
          amount: Number(payment.amount),
          paymentMethod: "cash",
          referenceType: "customer-payment",
          referenceId: payment.id,
          note: customer.name,
          createdAt: payment.createdAt,
        });
      }
      logRecord(
        activity,
        "customer-payment",
        `Received payment from ${customer.name}`,
        payment.id,
        payment.createdAt,
      );
      await transactionDone(transaction);
      return payment;
    } catch (error) {
      try {
        transaction.abort();
      } catch (_) {
        /* no-op */
      }
      throw error;
    }
  }

  async function recordSupplierPayment(payment) {
    const db = await openDatabase();
    const transaction = db.transaction(
      ["suppliers", "supplierPayments", "cashMovements", "activityLog"],
      "readwrite",
    );
    const suppliers = transaction.objectStore("suppliers");
    const payments = transaction.objectStore("supplierPayments");
    const cash = transaction.objectStore("cashMovements");
    const activity = transaction.objectStore("activityLog");
    try {
      const supplier = await requestToPromise(
        suppliers.get(payment.supplierId),
      );
      if (!supplier) throw new Error("Supplier not found");
      if (Number(payment.amount || 0) <= 0)
        throw new Error("Payment amount must be greater than zero");
      suppliers.put({
        ...supplier,
        balance: Math.max(
          0,
          Number(supplier.balance || 0) - Number(payment.amount),
        ),
        updatedAt: payment.createdAt,
      });
      payments.add(payment);
      if (payment.paymentMethod === "cash" && payment.registerSessionId) {
        cash.put({
          id: uid("cash"),
          sessionId: payment.registerSessionId,
          type: "supplier-payment",
          amount: -Number(payment.amount),
          paymentMethod: "cash",
          referenceType: "supplier-payment",
          referenceId: payment.id,
          note: supplier.name,
          createdAt: payment.createdAt,
        });
      }
      logRecord(
        activity,
        "supplier-payment",
        `Paid supplier ${supplier.name}`,
        payment.id,
        payment.createdAt,
      );
      await transactionDone(transaction);
      return payment;
    } catch (error) {
      try {
        transaction.abort();
      } catch (_) {
        /* no-op */
      }
      throw error;
    }
  }

  async function openRegister(session) {
    const openSessions = (await getAll("registerSessions")).filter(
      (item) => item.status === "open",
    );
    if (openSessions.length)
      throw new Error("A register session is already open");
    const db = await openDatabase();
    const transaction = db.transaction(
      ["registerSessions", "cashMovements", "activityLog"],
      "readwrite",
    );
    const sessions = transaction.objectStore("registerSessions");
    const cash = transaction.objectStore("cashMovements");
    const activity = transaction.objectStore("activityLog");
    sessions.add(session);
    cash.add({
      id: uid("cash"),
      sessionId: session.id,
      type: "opening-float",
      amount: Number(session.openingFloat || 0),
      paymentMethod: "cash",
      referenceType: "register",
      referenceId: session.id,
      note: `Opening float by ${session.cashier}`,
      createdAt: session.openedAt,
    });
    logRecord(
      activity,
      "register",
      `Opened register by ${session.cashier}`,
      session.id,
      session.openedAt,
    );
    await transactionDone(transaction);
    return session;
  }

  async function addCashMovement(movement) {
    const db = await openDatabase();
    const transaction = db.transaction(
      ["cashMovements", "activityLog"],
      "readwrite",
    );
    const cash = transaction.objectStore("cashMovements");
    const activity = transaction.objectStore("activityLog");
    cash.add(movement);
    logRecord(
      activity,
      "cash",
      `${movement.type}: ${movement.note || movement.amount}`,
      movement.id,
      movement.createdAt,
    );
    await transactionDone(transaction);
    return movement;
  }

  async function closeRegister(sessionId, actualCash, notes = "") {
    const db = await openDatabase();
    const transaction = db.transaction(
      ["registerSessions", "cashMovements", "activityLog"],
      "readwrite",
    );
    const sessions = transaction.objectStore("registerSessions");
    const cash = transaction.objectStore("cashMovements");
    const activity = transaction.objectStore("activityLog");
    try {
      const session = await requestToPromise(sessions.get(sessionId));
      if (!session || session.status !== "open")
        throw new Error("Open register session not found");
      const allCash = await requestToPromise(
        cash.index("sessionId").getAll(sessionId),
      );
      const expectedCash = allCash.reduce(
        (sum, movement) => sum + Number(movement.amount || 0),
        0,
      );
      const closedAt = nowISO();
      const updated = {
        ...session,
        status: "closed",
        closedAt,
        expectedCash,
        actualCash: Number(actualCash || 0),
        difference: Number(actualCash || 0) - expectedCash,
        notes,
      };
      sessions.put(updated);
      logRecord(
        activity,
        "register",
        `Closed register with difference ${updated.difference}`,
        session.id,
        closedAt,
      );
      await transactionDone(transaction);
      return updated;
    } catch (error) {
      try {
        transaction.abort();
      } catch (_) {
        /* no-op */
      }
      throw error;
    }
  }

  async function exportAll() {
    const data = {};
    for (const storeName of STORE_NAMES)
      data[storeName] = await getAll(storeName);
    return { app: APP_ID, version: DB_VERSION, exportedAt: nowISO(), data };
  }

  async function importAll(backup) {
    if (!backup?.data || ![APP_ID, "Retail POS"].includes(backup.app))
      throw new Error("Invalid POS backup file");
    const db = await openDatabase();
    const transaction = db.transaction(STORE_NAMES, "readwrite");
    STORE_NAMES.forEach((storeName) => {
      const store = transaction.objectStore(storeName);
      store.clear();
      const records = Array.isArray(backup.data[storeName])
        ? backup.data[storeName]
        : [];
      records.forEach((record) => store.put(record));
    });
    await transactionDone(transaction);
  }

  async function clearAll() {
    const db = await openDatabase();
    const transaction = db.transaction(STORE_NAMES, "readwrite");
    STORE_NAMES.forEach((storeName) =>
      transaction.objectStore(storeName).clear(),
    );
    await transactionDone(transaction);
  }

  async function seed() {
    const seeded = await getSetting("seeded", false);
    if (seeded) return;
    const timestamp = nowISO();
    const categories = [
      {
        id: "cat-groceries",
        name: "Groceries",
        description: "Daily food and pantry products",
        createdAt: timestamp,
      },
      {
        id: "cat-beverages",
        name: "Beverages",
        description: "Water, soda and drinks",
        createdAt: timestamp,
      },
      {
        id: "cat-household",
        name: "Household",
        description: "Cleaning and household supplies",
        createdAt: timestamp,
      },
      {
        id: "cat-personal",
        name: "Personal Care",
        description: "Health and personal care items",
        createdAt: timestamp,
      },
    ];
    const supplier = {
      id: "supplier-001",
      name: "Main Wholesale Supplier",
      phone: "",
      email: "",
      address: "Kampala, Uganda",
      taxId: "",
      notes: "Default demonstration supplier",
      balance: 0,
      totalPurchases: 0,
      lastPurchaseAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const products = [
      [
        "prod-001",
        "Sugar 1kg",
        "SUG-001",
        "6161100000011",
        "cat-groceries",
        4200,
        5000,
        24,
        8,
        "pack",
      ],
      [
        "prod-002",
        "Rice 1kg",
        "RIC-001",
        "6161100000028",
        "cat-groceries",
        4300,
        5500,
        18,
        6,
        "pack",
      ],
      [
        "prod-003",
        "Mineral Water 500ml",
        "WAT-500",
        "6161100000035",
        "cat-beverages",
        700,
        1000,
        42,
        12,
        "bottle",
      ],
      [
        "prod-004",
        "Soda 500ml",
        "SOD-500",
        "6161100000042",
        "cat-beverages",
        1500,
        2000,
        30,
        10,
        "bottle",
      ],
      [
        "prod-005",
        "Laundry Soap Bar",
        "SOAP-01",
        "6161100000059",
        "cat-household",
        2200,
        3000,
        7,
        8,
        "piece",
      ],
      [
        "prod-006",
        "Toothpaste 100ml",
        "TP-100",
        "6161100000066",
        "cat-personal",
        4000,
        5500,
        12,
        5,
        "tube",
      ],
      [
        "prod-007",
        "Cooking Oil 1L",
        "OIL-1L",
        "6161100000073",
        "cat-groceries",
        7200,
        8500,
        16,
        5,
        "bottle",
      ],
      [
        "prod-008",
        "Bread Loaf",
        "BRD-001",
        "6161100000080",
        "cat-groceries",
        3500,
        4500,
        5,
        6,
        "loaf",
      ],
    ].map(
      ([
        id,
        name,
        sku,
        barcode,
        categoryId,
        purchasePrice,
        sellingPrice,
        stock,
        reorderLevel,
        unit,
      ]) => ({
        id,
        name,
        sku,
        barcode,
        categoryId,
        purchasePrice,
        sellingPrice,
        stock,
        reorderLevel,
        unit,
        supplierId: supplier.id,
        taxable: true,
        active: true,
        trackStock: true,
        batchNo: "",
        expiryDate: "",
        createdAt: timestamp,
        updatedAt: timestamp,
      }),
    );
    const customers = [
      {
        id: "cust-001",
        name: "Sarah Namusoke",
        phone: "0700000001",
        email: "",
        address: "Kampala",
        notes: "",
        balance: 0,
        creditLimit: 100000,
        totalPurchases: 0,
        purchaseCount: 0,
        lastPurchaseAt: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: "cust-002",
        name: "John Kato",
        phone: "0700000002",
        email: "",
        address: "Wakiso",
        notes: "",
        balance: 0,
        creditLimit: 50000,
        totalPurchases: 0,
        purchaseCount: 0,
        lastPurchaseAt: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ];
    await bulkPut("categories", categories);
    await bulkPut("products", products);
    await bulkPut("customers", customers);
    await put("suppliers", supplier);
    await setSetting("business", {
      businessName: "MTECH Retail Shop",
      phone: "",
      email: "",
      address: "Kampala, Uganda",
      taxId: "",
      currency: "UGX",
      taxRate: 0,
      taxMode: "exclusive",
      receiptFooter: "Thank you for shopping with us.",
      lowStockEnabled: true,
      allowNegativeStock: false,
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
      interfaceDensity: "comfortable",
      productView: "table",
      showDashboardHero: true,
      expiryWarningDays: 30,
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
    });
    await setSetting("receiptSequence", 1);
    await setSetting("purchaseSequence", 1);
    await setSetting("purchaseOrderSequence", 1);
    await setSetting("returnSequence", 1);
    await setSetting("approvalSequence", 1);
    await setSetting("expenseSequence", 1);
    await setSetting("stockCountSequence", 1);
    await setSetting("seeded", true);
  }

  window.POSDatabase = {
    uid,
    open: openDatabase,
    getAll,
    get,
    put,
    add,
    remove,
    clear,
    bulkPut,
    getSetting,
    setSetting,
    nextSequence,
    completeSale,
    requestApproval,
    rejectApprovalRequest,
    approveApprovalRequest,
    processReturn,
    processVoid,
    savePurchaseOrder,
    updatePurchaseOrderStatus,
    receivePurchase,
    saveExpense,
    deleteExpense,
    markExpensePaid,
    voidExpense,
    adjustStock,
    completeStockCount,
    recordCustomerPayment,
    recordSupplierPayment,
    openRegister,
    addCashMovement,
    closeRegister,
    exportAll,
    importAll,
    clearAll,
    seed,
    STORE_NAMES,
  };
})();
