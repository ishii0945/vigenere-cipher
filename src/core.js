/**
 * Core Vigenère cipher logic.
 *
 * Design decisions (documented because they are NOT universal):
 *
 * 1. Non-alphabetic characters (spaces, digits, punctuation) are passed through
 *    unchanged and do NOT advance the keyword. This matches the classic tabletop
 *    use of the cipher: only letters are substituted, and the keyword's rhythm
 *    is tied to the plaintext letters, not to the raw character stream.
 *
 * 2. Letter case is preserved on output: an uppercase plaintext letter produces
 *    an uppercase ciphertext letter, and lowercase stays lowercase. This makes
 *    round-trip encipher/decipher lossless for mixed-case text without forcing
 *    the caller to manage case.
 *
 * 3. The keyword is case-insensitive. We normalise it to uppercase internally so
 *    'Key' and 'KEY' produce identical keystreams.
 *
 * 4. An empty keyword is rejected. The Vigenère cipher requires at least one
 *    shift value; an empty keyword has no meaningful interpretation and silently
 *    returning the plaintext unchanged would hide a caller bug.
 */

const A_CODE = 'A'.charCodeAt(0); // 65
const Z_CODE = 'Z'.charCodeAt(0); // 90
const LETTER_COUNT = 26; // size of the Latin alphabet

/**
 * Assert the keyword is a non-empty string of ASCII letters.
 *
 * Throwing early on a bad keyword is preferable to returning plaintext
 * unchanged, which would mask a real bug in the caller.
 *
 * @param {unknown} keyword - value supplied as the keyword
 * @returns {string} the keyword upper-cased and ready to use
 * @throws {TypeError} if keyword is missing or contains non-letters
 */
function normaliseKeyword(keyword) {
  if (typeof keyword !== 'string') {
    throw new TypeError('keyword must be a string');
  }
  if (keyword.length === 0) {
    throw new TypeError('keyword must contain at least one letter');
  }
  const upper = keyword.toUpperCase();
  for (let i = 0; i < upper.length; i++) {
    const code = upper.charCodeAt(i);
    if (code < A_CODE || code > Z_CODE) {
      throw new TypeError('keyword must contain only ASCII letters');
    }
  }
  return upper;
}

/**
 * Apply a single Vigenère shift to a letter.
 *
 * @param {number} charCode - code point of the plaintext/ciphertext letter, in A-Z/a-z range
 * @param {number} shift - 0..25, the keyword letter's offset
 * @param {boolean} decipher - if true, subtract the shift; if false, add it
 * @returns {number} the resulting letter's code point
 */
function shiftLetter(charCode, shift, decipher) {
  // Detect the base so the output keeps the same case as the input.
  const isUpper = charCode >= A_CODE && charCode <= Z_CODE;
  const base = isUpper ? A_CODE : 'a'.charCodeAt(0);
  const offset = charCode - base; // 0..25
  const delta = decipher ? -shift : shift;
  // The double-addition of LETTER_COUNT before modulo guarantees a positive
  // result in JS, where % can return negatives for negative dividends.
  const shifted = ((offset + delta) % LETTER_COUNT + LETTER_COUNT) % LETTER_COUNT;
  return base + shifted;
}

/**
 * Encipher `text` with the repeating `keyword`.
 *
 * Non-letters pass through unchanged and do not advance the keyword.
 *
 * @param {string} text - plaintext to encipher
 * @param {string} keyword - alphabetic keyword, case-insensitive
 * @returns {string} the ciphertext
 * @throws {TypeError} if `text` is not a string or `keyword` is invalid
 */
export function encipher(text, keyword) {
  if (typeof text !== 'string') {
    throw new TypeError('text must be a string');
  }
  const key = normaliseKeyword(keyword);
  let out = '';
  let keyIndex = 0; // advances only on letters
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const isUpper = code >= A_CODE && code <= Z_CODE;
    const isLower = code >= 'a'.charCodeAt(0) && code <= 'z'.charCodeAt(0);
    if (isUpper || isLower) {
      const shift = key.charCodeAt(keyIndex % key.length) - A_CODE;
      out += String.fromCharCode(shiftLetter(code, shift, false));
      keyIndex++;
    } else {
      out += text[i];
    }
  }
  return out;
}

/**
 * Decipher `text` that was enciphered with the repeating `keyword`.
 *
 * Non-letters pass through unchanged and do not advance the keyword.
 *
 * @param {string} text - ciphertext to decipher
 * @param {string} keyword - alphabetic keyword, case-insensitive
 * @returns {string} the recovered plaintext
 * @throws {TypeError} if `text` is not a string or `keyword` is invalid
 */
export function decipher(text, keyword) {
  if (typeof text !== 'string') {
    throw new TypeError('text must be a string');
  }
  const key = normaliseKeyword(keyword);
  let out = '';
  let keyIndex = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const isUpper = code >= A_CODE && code <= Z_CODE;
    const isLower = code >= 'a'.charCodeAt(0) && code <= 'z'.charCodeAt(0);
    if (isUpper || isLower) {
      const shift = key.charCodeAt(keyIndex % key.length) - A_CODE;
      out += String.fromCharCode(shiftLetter(code, shift, true));
      keyIndex++;
    } else {
      out += text[i];
    }
  }
  return out;
}
