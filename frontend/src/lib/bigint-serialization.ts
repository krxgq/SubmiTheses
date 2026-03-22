/**
 * Global BigInt serialization setup
 * This allows BigInt values to be serialized to JSON automatically
 */

// Add toJSON method to BigInt prototype
// This gets called automatically when JSON.stringify encounters a BigInt
(BigInt.prototype as any).toJSON = function() {
  return this.toString();
};

