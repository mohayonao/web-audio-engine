"use strict";

const API_KEYS = [ "log", "info", "warn", "error" ];
const GlobalConsoleAPI = {};

API_KEYS.forEach((key) => { GlobalConsoleAPI[key] = global.console[key] });

function replaceConsoleAPI(consoleAPI) {
  API_KEYS.forEach((key) => {
    if (typeof consoleAPI[key] === "function") {
      global.console[key] = consoleAPI[key].bind(console);
    } else if (typeof consoleAPI["*"] === "function") {
      global.console[key] = consoleAPI["*"].bind(console);
    }
  });
}

function restoreConsoleAPI() {
  replaceConsoleAPI(GlobalConsoleAPI);
}

module.exports = { replaceConsoleAPI, restoreConsoleAPI };
