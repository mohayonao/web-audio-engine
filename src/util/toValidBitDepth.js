"use stirct";

function toValidBitDepth(value) {
  value = value|0;
  if (value === 8 || value === 16 || value === 24 || value === 32) {
    return value;
  }
  return 16;
}

module.exports = toValidBitDepth;
