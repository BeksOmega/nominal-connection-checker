/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

/**
 * Returns a filter function which removes all the duplicates from an array in
 * O(n). Note that this only looks for shallow equality, not deep equality.
 */
export function removeDuplicates(): (el: unknown) => boolean {
  const hash = new Set();
  return (el) => {
    if (hash.has(el)) return false;
    hash.add(el);
    return true;
  };
}

/**
 * Creates all combinations of elements in the subarrays as arrays. If any
 * subarray is an empty array, this evaluates to an empty array.
 *
 * For example [[a, b], [c, d], [e, f]] results in:
 * [[a, c, e], [a, c, f], [a, d, e], [a, d, f],
 *  [b, c, e], [b, c, f], [b, d, e], [b, d, f]]
 *
 * @param {!Array<!Array<*>>} firstArray The first array to add the items of the
 *     second array onto. should be an array of array for proper combining.
 * @param {!Array<*>} secondArray An array of elements used to create
 *     combinations.
 * @param {!Array<!Array<*>>} rest The rest of the arrays of elements.
 * @return {!Array<!Array<*>>} All combinations of elements in all of the
 *     subarrays.
 */
export function combine([firstArray, ...[secondArray, ...rest]]) {
  if (!secondArray) return firstArray;
  const combined = firstArray.flatMap(a => secondArray.map(b => [...a, b]));
  return combine([combined, ...rest]);
}
