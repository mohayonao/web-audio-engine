"use strict";

/**
 * @param {number|string} str
 * @return {number}
 */
function toAudioTime(str) {
  if (Number.isFinite(+str)) {
    return Math.max(0, +str);
  }

  const matched = ("" + str).match(/^(?:(\d\d+):)?(\d\d?):(\d\d?(?:\.\d+)?)$/);

  if (matched) {
    const hours = +matched[1]|0;
    const minutes = +matched[2];
    const seconds = +matched[3];

    return hours * 3600 + minutes * 60 + seconds;
  }

  return 0;
}

module.exports = toAudioTime;
