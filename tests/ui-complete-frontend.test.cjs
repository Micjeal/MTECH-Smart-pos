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
const stylesheet = fs.readFileSync(path.join(root, "assets/css/app.css"), "utf8");
const application = fs.readFileSync(path.join(root, "assets/js/app.js"), "utf8");
const shell = fs.readFileSync(path.join(root, "index.html"), "utf8");
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
  await new Promise((resolve) => server.listen(4178, "127.0.0.1", resolve));
  const runtimeErrors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("error", (...args) => runtimeErrors.push(args.join(" ")));
  virtualConsole.on("jsdomError", (error) => {
    if (!/Not implemented: (window\.scrollTo|navigation)/.test(error.message))
      runtimeErrors.push(error.message);
  });

  const dom = await JSDOM.fromURL("http://127.0.0.1:4178/", {
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

  const openView = async (id, expectedSelector) => {
    const nav = document.querySelector(`#nav-${id}`);
    assert(nav, `Missing navigation for ${id}`);
    nav.click();
    await wait(45);
    assert(document.querySelector(expectedSelector), `Missing ${id} workspace`);
  };
  const closeModal = () => document.querySelector('[data-action="close-modal"]')?.click();

  await openView("products", ".products-phase-page");
  assert(document.querySelector(".products-phase-page .workspace-operations-hero"));
  assert(document.querySelector(".products-phase-page .workspace-hero-status"));
  assert.equal(
    document.querySelectorAll(".products-phase-page .operation-metric").length,
    4,
  );
  document.querySelector('.products-phase-page [data-action="new-product"]').click();
  await wait(20);
  assert(document.querySelector('[data-form="product"]'));
  assert(document.querySelector("#productImageInput"));
  closeModal();

  await openView("inventory", ".inventory-phase-page");
  assert(document.querySelector(".inventory-phase-page .workspace-hero-status"));
  assert.equal(document.querySelectorAll(".operations-tabs .tab-button").length, 3);
  document
    .querySelector('[data-action="inventory-tab"][data-tab="movements"]')
    .click();
  await wait(25);
  assert.match(document.querySelector("#inventoryTabBody").textContent, /movement history/i);
  document.querySelector('.inventory-phase-page [data-action="adjust-stock"]').click();
  await wait(20);
  assert(document.querySelector('[data-form="stock-adjustment"]'));
  closeModal();

  await openView("stock-count", ".stock-count-phase-page");
  assert(document.querySelector(".stock-count-phase-page .workspace-hero-status"));
  assert.equal(document.querySelectorAll(".count-workflow li").length, 3);
  document.querySelector('[data-action="new-stock-count"]').click();
  await wait(20);
  assert(document.querySelector('[data-form="stock-count"]'));
  closeModal();

  await openView("purchases", ".purchases-phase-page");
  assert(document.querySelector(".purchases-phase-page .workspace-spotlight"));
  assert(document.querySelector(".purchases-phase-page .workspace-hero-status"));
  document
    .querySelector('.purchases-phase-page [data-action="new-purchase-order"]')
    .click();
  await wait(20);
  assert(document.querySelector('[data-form="purchase-order"]'));
  closeModal();

  await openView("customers", ".customers-phase-page");
  assert(document.querySelector(".customers-phase-page .workspace-hero-status"));
  assert(document.querySelector('.customers-phase-page [data-action="new-customer"]'));
  document
    .querySelector('.customers-phase-page [data-action="new-customer"]')
    .click();
  await wait(20);
  assert(document.querySelector('[data-form="customer"]'));
  closeModal();

  await openView("suppliers", ".suppliers-phase-page");
  assert(document.querySelector(".suppliers-phase-page .workspace-hero-status"));
  assert(document.querySelector('.suppliers-phase-page [data-action="new-supplier"]'));
  document
    .querySelector('.suppliers-phase-page [data-action="new-supplier"]')
    .click();
  await wait(20);
  assert(document.querySelector('[data-form="supplier"]'));
  closeModal();

  await openView("expenses", ".expenses-page.phase-page");
  assert(document.querySelector(".expenses-page .workspace-operations-hero"));
  assert(document.querySelector(".expenses-page .workspace-hero-status"));
  assert.equal(
    document.querySelectorAll(".expenses-page .operation-metric").length,
    4,
  );
  document.querySelector('.expenses-page [data-action="new-expense"]').click();
  await wait(20);
  assert(document.querySelector('[data-form="expense"]'));
  closeModal();

  await openView("alerts", ".alerts-page.phase-page");
  assert(document.querySelector(".alerts-page .workspace-operations-hero"));
  assert(document.querySelector(".alerts-page .workspace-hero-status"));
  assert.equal(
    document.querySelectorAll(".alerts-page .operation-metric").length,
    4,
  );
  document.querySelector('[data-action="open-alert-settings"]').click();
  await wait(35);
  assert(document.querySelector('[data-form="alerts-settings"]'));

  await openView("reports", ".reports-phase-page");
  assert(document.querySelector(".reports-phase-page .workspace-operations-hero"));
  assert(document.querySelector(".reports-phase-page .workspace-hero-status"));
  const period = document.querySelector("#reportPeriod");
  period.value = "all";
  period.dispatchEvent(new window.Event("change", { bubbles: true }));
  await wait(30);
  assert.equal(document.querySelector("#reportPeriod").value, "all");
  assert.equal(document.querySelectorAll(".reports-phase-page .report-grid > .panel").length, 7);

  await openView("settings", ".settings-page.phase-page");
  assert(document.querySelector(".settings-hero"));
  document
    .querySelector('[data-action="settings-section"][data-id="appearance"]')
    .click();
  await wait(25);
  assert(document.querySelector('[data-form="appearance-settings"]'));
  assert(document.querySelector(".theme-preset-grid"));

  document.querySelector("#installButton").click();
  await wait(40);
  assert.equal(document.querySelectorAll(".install-permission").length, 4);
  assert(document.querySelector('[data-form="mobile-setup"]'));
  assert.match(
    document.querySelector(".install-privacy-note").textContent,
    /nothing is requested automatically/i,
  );
  closeModal();

  assert.match(
    stylesheet,
    /\.phase-mobile-only\s*\{\s*display:\s*none\s*!important;/,
  );
  assert.match(
    stylesheet,
    /\.phase-mobile-only\.transaction-card-list,[\s\S]*?display:\s*grid\s*!important;/,
  );
  assert.match(application, /function workspaceHero\(\{/);
  assert.equal((shell.match(/data-startup-stage=/g) || []).length, 3);

  assert.deepEqual(runtimeErrors, []);
  console.log(
    JSON.stringify(
      {
        result: "Complete operational frontend workflow passed",
        verifiedRoutes: 10,
        appearancePresets: document.querySelectorAll(".theme-preset").length,
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
