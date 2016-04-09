"use strict";

function zeros(size) {
  return new Float32Array(size);
}

function full(size, value) {
  return new Float32Array(size).fill(value);
}

function random_sample(size) {
  return new Float32Array(size).map(Math.random);
}

module.exports = { zeros, full, random_sample };
