"use strict";

const API_KEYS = [ "setInterval", "clearInterval", "setTimeout", "clearTimeout" ];
const GlobalTimerAPI = {};

API_KEYS.forEach((key) => { GlobalTimerAPI[key] = global[key] });

function replaceTimerAPI(timerAPI) {
  API_KEYS.forEach((key) => {
    if (typeof timerAPI[key] === "function") {
      global[key] = timerAPI[key];
    }
  });
}

function restoreTimerAPI() {
  replaceTimerAPI(GlobalTimerAPI);
}

module.exports = { replaceTimerAPI, restoreTimerAPI };
