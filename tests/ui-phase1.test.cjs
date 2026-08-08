global.TextEncoder = require("node:util").TextEncoder;
global.TextDecoder = require("node:util").TextDecoder;

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { webcrypto } = require("node:crypto");
const { JSDOM, VirtualConsole } = require("jsdom");
const { indexedDB, IDBKeyRange } = require("fake-indexeddb");

const root = path.resolve(__dirname, "..");
const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
const contentTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".webp": "image/webp",
  ".webmanifest": "application/manifest+json",
};

const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, "http://127.0.0.1").pathname;
  const file = path.join(
    root,
    pathname === "/" ? "index.html" : pathname.slice(1),
  );
  fs.readFile(file, (error, data) => {
    if (error) return response.writeHead(404).end();
    response.setHeader(
      "content-type",
      contentTypes[path.extname(file)] || "application/octet-stream",
    );
    response.end(data);
  });
});

(async () => {
  await new Promise((resolve) => server.listen(4177, "127.0.0.1", resolve));
  const runtimeErrors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("error", (...args) => runtimeErrors.push(args.join(" ")));
  virtualConsole.on("jsdomError", (error) => {
    if (!/Not implemented: (window\.scrollTo|navigation)/.test(error.message))
      runtimeErrors.push(error.message);
  });

  const dom = await JSDOM.fromURL("http://127.0.0.1:4177/", {
    resources: "usable",
    runScripts: "dangerously",
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse(window) {
      Object.defineProperty(window, "indexedDB", { value: indexedDB });
      Object.defineProperty(window, "IDBKeyRange", { value: IDBKeyRange });
      Object.defineProperty(window, "crypto", { value: webcrypto });
      window.TextEncoder = global.TextEncoder;
      window.TextDecoder = global.TextDecoder;
      window.matchMedia = (media) => ({
        matches: /max-width:\s*(650|900)px/.test(media),
        media,
        addEventListener() {},
        removeEventListener() {},
        addListener() {},
        removeListener() {},
        dispatchEvent() {
          return true;
        },
      });
      Object.defineProperty(window.navigator, "serviceWorker", {
        value: {
          register: async () => ({ waiting: null, addEventListener() {} }),
        },
      });
      window.navigator.vibrate = () => true;
      window.scrollTo = () => {};
      window.URL.createObjectURL = () => "blob:test";
      window.URL.revokeObjectURL = () => {};
      window.HTMLAnchorElement.prototype.click = function click() {};
    },
  });

  const { window } = dom;
  const { document } = window;
  for (
    let attempts = 0;
    attempts < 100 && !document.querySelector(".dashboard-phase-page");
    attempts += 1
  )
    await wait(40);

  assert(document.querySelector(".dashboard-hero.operations-hero"));
  assert.equal(document.querySelectorAll(".operation-metric").length, 4);
  assert.equal(document.querySelectorAll(".phase-quick-actions .quick-card").length, 6);
  assert.equal(document.querySelectorAll(".operations-status-pill").length, 2);

  document.querySelector("#nav-pos").click();
  await wait(40);
  document.querySelector('.mobile-product-row [data-action="add-cart"]').click();
  await wait(40);
  document.querySelector('.mobile-cart-peek[data-action="mobile-pos-stage"]').click();
  await wait(30);
  document.querySelector('.mobile-cart-sheet [data-action="checkout"]').click();
  await wait(30);
  const checkout = document.querySelector('[data-form="checkout"]');
  assert(checkout);
  assert.equal(document.querySelector("#completeSaleButton").disabled, false);
  checkout.dispatchEvent(
    new window.SubmitEvent("submit", { bubbles: true, cancelable: true }),
  );
  await wait(240);
  document.querySelector('[data-action="close-modal"]')?.click();

  document.querySelector("#nav-sales").click();
  await wait(40);
  assert(document.querySelector(".sales-phase-page"));
  assert.equal(document.querySelectorAll(".operations-segmented button").length, 4);
  assert.equal(document.querySelectorAll(".transaction-card").length, 1);
  document
    .querySelector('[data-action="sales-status"][data-id="completed"]')
    .click();
  await wait(30);
  assert(
    document
      .querySelector('[data-action="sales-status"][data-id="completed"]')
      .classList.contains("active"),
  );
  document.querySelector('.transaction-card [data-action="view-sale"]').click();
  await wait(20);
  assert(document.querySelector("#modalCard").classList.contains("receipt-detail-sheet"));
  document.querySelector('[data-action="close-modal"]').click();

  document.querySelector(".sales-operations-hero .operations-status-pill").click();
  await wait(30);
  assert(document.querySelector('[data-form="security-settings"]'));

  document.querySelector("#nav-register").click();
  await wait(30);
  assert(document.querySelector(".register-phase-page"));
  document.querySelector('[data-action="open-register"]').click();
  await wait(20);
  let form = document.querySelector('[data-form="open-register"]');
  assert(form);
  form.elements.cashier.value = "Phase One Cashier";
  form.elements.openingFloat.value = "150000";
  form.dispatchEvent(
    new window.SubmitEvent("submit", { bubbles: true, cancelable: true }),
  );
  await wait(180);
  assert(document.querySelector(".register-command-hero.is-open"));
  assert(document.querySelector(".mobile-sticky-primary.danger"));

  document.querySelector('[data-action="cash-in"]').click();
  await wait(20);
  form = document.querySelector('[data-form="cash-movement"]');
  form.elements.amount.value = "25000";
  form.elements.note.value = "Added change float";
  form.dispatchEvent(
    new window.SubmitEvent("submit", { bubbles: true, cancelable: true }),
  );
  await wait(180);
  assert(document.querySelectorAll(".cash-movement-card").length >= 2);

  document.querySelector('[data-action="close-register"]').click();
  await wait(20);
  assert(document.querySelector('[data-form="close-register"]'));
  assert(document.querySelector("#modalCard").classList.contains("register-workflow-sheet"));
  document.querySelector('[data-action="close-modal"]').click();

  assert.deepEqual(runtimeErrors, []);
  console.log(
    JSON.stringify(
      {
        result: "Phase 1 dashboard, sales and register workflows passed",
        dashboardMetrics: 4,
        salesCards: document.querySelectorAll(".transaction-card").length,
        cashMovements: document.querySelectorAll(".cash-movement-card").length,
        runtimeErrors,
      },
      null,
      2,
    ),
  );
  dom.window.close();
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => server.close());
