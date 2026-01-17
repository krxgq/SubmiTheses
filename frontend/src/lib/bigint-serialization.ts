/**
 * Global BigInt serialization setup
 * This allows BigInt values to be serialized to JSON automatically
 */

// Add toJSON method to BigInt prototype
// This gets called automatically when JSON.stringify encounters a BigInt
(BigInt.prototype as any).toJSON = function() {
  return this.toString();
};

// Log to confirm this file is loaded
if (typeof window === 'undefined') {
  console.log('[Server] BigInt serialization enabled');
} else {
  console.log('[Client] BigInt serialization enabled');
}
