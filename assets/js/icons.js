(() => {
  "use strict";
  const paths = {
    store:
      '<path d="M4 4h16l1 5H3l1-5Zm1 7h14v9H5v-9Zm3 2v5h4v-5H8Zm6 0v3h3v-3h-3Z"/>',
    dashboard:
      '<path d="M3 3h8v8H3V3Zm10 0h8v5h-8V3ZM3 13h8v8H3v-8Zm10-3h8v11h-8V10Z"/>',
    cart: '<path d="M7 4H4L3 6h2l3 8h9l3-6H8L7 4Zm2 13a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/>',
    receipt:
      '<path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2Zm3 5v2h6V7H9Zm0 4v2h6v-2H9Zm0 4v2h4v-2H9Z"/>',
    register:
      '<path d="M4 4h16v5H4V4Zm0 7h16v9H4v-9Zm3 3v3h5v-3H7Zm8 0h2v2h-2v-2Z"/>',
    package:
      '<path d="m12 2 9 4.5v11L12 22l-9-4.5v-11L12 2Zm0 2.3L6 7.2l6 3 6-3-6-2.9ZM5 9v7.3l6 3v-7.4L5 9Zm8 10.3 6-3V9l-6 2.9v7.4Z"/>',
    boxes:
      '<path d="M3 4h8v8H3V4Zm10 0h8v8h-8V4ZM3 14h8v7H3v-7Zm10 0h8v7h-8v-7Z"/>',
    clipboard:
      '<path d="M8 3h2a2 2 0 0 1 4 0h2a2 2 0 0 1 2 2v16H6V5a2 2 0 0 1 2-2Zm2 2h4V3h-4v2Zm0 5v2h6v-2h-6Zm0 4v2h6v-2h-6Z"/>',
    truck:
      '<path d="M3 5h11v10h-1a3 3 0 0 1-6 0H5v2H3V5Zm13 3h3l2 3v4h-1a3 3 0 0 1-6 0V8h2Zm-6 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"/>',
    users:
      '<path d="M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-6 9v-2a6 6 0 0 1 12 0v2H3Zm13-8a4 4 0 0 1 5 4v4h-3v-2a9 9 0 0 0-2-6Z"/>',
    supplier:
      '<path d="M3 3h12v18H3V3Zm3 4v2h6V7H6Zm0 4v2h6v-2H6Zm11-3h4v13h-4V8Zm1 3v2h2v-2h-2Z"/>',
    wallet:
      '<path d="M4 5h14a2 2 0 0 1 2 2v2h-6a3 3 0 0 0 0 6h6v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm10 6h8v2h-8a1 1 0 0 1 0-2Z"/>',
    chart:
      '<path d="M4 19h17v2H2V3h2v16Zm3-2v-6h3v6H7Zm5 0V6h3v11h-3Zm5 0V9h3v8h-3Z"/>',
    settings:
      '<path d="m19 13 2 1-2 4-2-1a8 8 0 0 1-2 1l-1 2h-4l-1-2a8 8 0 0 1-2-1l-2 1-2-4 2-1v-2L3 10l2-4 2 1a8 8 0 0 1 2-1l1-2h4l1 2a8 8 0 0 1 2 1l2-1 2 4-2 1v2Zm-7 3a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/>',
    menu: '<path d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z"/>',
    close:
      '<path d="m6 6 12 12m0-12L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>',
    plus: '<path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7V4Z"/>',
    download:
      '<path d="M11 3h2v10l3-3 2 2-6 6-6-6 2-2 3 3V3Zm-6 16h14v2H5v-2Z"/>',
    upload: '<path d="M11 21h2V11l3 3 2-2-6-6-6 6 2 2 3-3v10ZM5 3h14v2H5V3Z"/>',
    search:
      '<path d="M10 3a7 7 0 1 0 4.4 12.4L20 21l1-1-5.6-5.6A7 7 0 0 0 10 3Zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z"/>',
    scan: '<path d="M4 4h5v2H6v3H4V4Zm11 0h5v5h-2V6h-3V4ZM4 15h2v3h3v2H4v-5Zm14 0h2v5h-5v-2h3v-3ZM8 7h1v10H8V7Zm3 0h2v10h-2V7Zm4 0h1v10h-1V7Z"/>',
    edit: '<path d="m4 16 10-10 4 4L8 20H4v-4Zm12-12 2-2 4 4-2 2-4-4Z"/>',
    trash:
      '<path d="M7 7h2v11H7V7Zm4 0h2v11h-2V7Zm4 0h2v11h-2V7ZM5 5h14v16H5V5Zm3-3h8l1 2H7l1-2Z"/>',
    eye: '<path d="M12 5c5 0 9 5 9 7s-4 7-9 7-9-5-9-7 4-7 9-7Zm0 2c-3.6 0-6.8 3.4-7 5 .2 1.6 3.4 5 7 5s6.8-3.4 7-5c-.2-1.6-3.4-5-7-5Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z"/>',
    arrowRight: '<path d="m13 5 7 7-7 7-1-2 4-4H4v-2h12l-4-4 1-2Z"/>',
    arrowUp: '<path d="m12 4 7 7-2 1-4-4v12h-2V8l-4 4-2-1 7-7Z"/>',
    arrowDown: '<path d="m12 20-7-7 2-1 4 4V4h2v12l4-4 2 1-7 7Z"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',
    calendar: '<path d="M5 3h2v2h10V3h2v2h2v16H3V5h2V3Zm0 6v10h14V9H5Z"/>',
    money:
      '<path d="M3 5h18v14H3V5Zm2 2v10h14V7H5Zm7 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z"/>',
    cash: '<path d="M3 6h18v12H3V6Zm2 2v8h14V8H5Zm7 1a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z"/>',
    phone:
      '<path d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 3v13h10V5H7Zm4 14v1h2v-1h-2Z"/>',
    card: '<path d="M3 5h18v14H3V5Zm2 2v2h14V7H5Zm0 5v5h14v-5H5Zm3 2h5v2H8v-2Z"/>',
    credit:
      '<path d="M4 4h16v16H4V4Zm3 4v2h10V8H7Zm0 4v2h6v-2H7Zm8 0v4h2v-4h-2Z"/>',
    hold: '<path d="M7 5h4v14H7V5Zm6 0h4v14h-4V5Z"/>',
    play: '<path d="M8 5v14l11-7L8 5Z"/>',
    minus: '<path d="M4 11h16v2H4v-2Z"/>',
    check: '<path d="m5 12 4 4L19 6l2 2L9 20l-6-6 2-2Z"/>',
    warning: '<path d="m12 2 10 19H2L12 2Zm-1 7v6h2V9h-2Zm0 8v2h2v-2h-2Z"/>',
    bell: '<path d="M12 2a5 5 0 0 1 5 5v3.6l2 4.4v2H5v-2l2-4.4V7a5 5 0 0 1 5-5Zm-2 17h4a2 2 0 0 1-4 0Z"/>',
    info: '<path d="M11 10h2v8h-2v-8Zm0-4h2v2h-2V6Zm1-4a10 10 0 1 1 0 20 10 10 0 0 1 0-20Z"/>',
    print:
      '<path d="M7 3h10v5H7V3Zm-2 7h14a2 2 0 0 1 2 2v6h-4v3H7v-3H3v-6a2 2 0 0 1 2-2Zm4 6v3h6v-3H9Z"/>',
    share:
      '<path d="M18 16a3 3 0 0 0-2 1l-7-4v-2l7-4a3 3 0 1 0-1-2l-7 4a3 3 0 1 0 0 6l7 4a3 3 0 1 0 3-3Z"/>',
    return:
      '<path d="M7 7h9a5 5 0 0 1 0 10h-4v-2h4a3 3 0 0 0 0-6H7v4L2 8l5-5v4Z"/>',
    save: '<path d="M4 3h13l3 3v15H4V3Zm3 2v5h9V5H7Zm0 9v5h10v-5H7Z"/>',
    file: '<path d="M6 2h8l4 4v16H6V2Zm8 2v4h4l-4-4ZM9 12v2h6v-2H9Zm0 4v2h6v-2H9Z"/>',
    activity: '<path d="M3 12h4l2-6 4 12 2-6h6v2h-4l-4 8-4-12-1 4H3v-2Z"/>',
    logout: '<path d="M4 3h9v2H6v14h7v2H4V3Zm12 5 5 4-5 4v-3H9v-2h7V8Z"/>',
    bulb: '<path d="M12 2a7 7 0 0 1 4 13v3H8v-3a7 7 0 0 1 4-13Zm-3 18h6v2H9v-2Z"/>',
    database:
      '<path d="M12 2c5 0 9 2 9 4s-4 4-9 4-9-2-9-4 4-4 9-4Zm-9 7c2 2 5 3 9 3s7-1 9-3v4c0 2-4 4-9 4s-9-2-9-4V9Zm0 7c2 2 5 3 9 3s7-1 9-3v2c0 2-4 4-9 4s-9-2-9-4v-2Z"/>',
    camera:
      '<path d="M7 5 9 3h6l2 2h4v15H3V5h4Zm5 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/>',
    flash: '<path d="M13 2 5 14h6l-1 8 9-13h-6V2Z"/>',
    lock: '<path d="M7 10V7a5 5 0 0 1 10 0v3h2v12H5V10h2Zm2 0h6V7a3 3 0 0 0-6 0v3Z"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8L3 12Zm4-5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/>',
    star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2L5.8 21 7 14.2 2 9.3l6.9-1L12 2Zm0 4.5-1.8 3.7-4 .6 2.9 2.8-.7 4 3.6-1.9 3.6 1.9-.7-4 2.9-2.8-4-.6L12 6.5Z"/>',
    grid: '<path d="M3 3h8v8H3V3Zm10 0h8v8h-8V3ZM3 13h8v8H3v-8Zm10 0h8v8h-8v-8Z"/>',
    copy: '<path d="M8 8h13v13H8V8Zm2 2v9h9v-9h-9ZM3 3h13v3H6v10H3V3Z"/>',
    image:
      '<path d="M3 4h18v16H3V4Zm2 2v10l4-4 3 3 2-2 5 5V6H5Zm11 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/>',
    list: '<path d="M4 5h3v3H4V5Zm5 0h11v3H9V5ZM4 11h3v3H4v-3Zm5 0h11v3H9v-3ZM4 17h3v3H4v-3Zm5 0h11v3H9v-3Z"/>',
    refresh:
      '<path d="M19 7V3l-2 2a9 9 0 1 0 3 7h-2a7 7 0 1 1-2-5l-3 3h8V7h-2Z"/>',
    home: '<path d="m12 3 9 8-2 2-1-1v9h-5v-6h-2v6H6v-9l-1 1-2-2 9-8Z"/>',
    more: '<path d="M5 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm7 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm7 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z"/>',
  };

  function icon(name, className = "") {
    const body = paths[name] || paths.info;
    return `<svg class="icon ${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
  }
  window.POSIcons = { icon };
})();
