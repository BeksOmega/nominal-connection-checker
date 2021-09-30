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
  }
}
