import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { encipher, decipher } from '../src/index.js';

describe('encipher', () => {
  it('enciphers the classic example correctly', () => {
    // "ATTACKATDAWN" with key "LEMON" -> "LXFOPVEFRNHR" (canonical Vigenère example)
    assert.equal(encipher('ATTACKATDAWN', 'LEMON'), 'LXFOPVEFRNHR');
  });

  it('preserves lowercase case', () => {
    assert.equal(encipher('attackatdawn', 'lemon'), 'lxfopvefrnhr');
  });

  it('preserves mixed case letter-by-letter', () => {
    assert.equal(encipher('Attack', 'lemon'), 'Lxfopv');
  });

  it('passes non-letters through unchanged', () => {
    // The keyword advances only on letters: 'A'->'K' (k=10), ' '->' ',
    // 'B'->'F' (e=4), '-'->'-', 'C'->'A' (y=24, wraps).
    assert.equal(encipher('A B-C!', 'key'), 'K F-A!');
  });

  it('does not advance the keyword across non-letters', () => {
    // The keyword does not advance on the space, so 'B' is shifted by
    // the keyword's second letter 'e' (4) -> 'F', not its first 'k' (10).
    assert.equal(encipher('A B', 'key'), 'K F');
  });

  it('repeats the keyword when text is longer than the keyword', () => {
    // With key 'ab', consecutive letters alternate shifts of 0 and 1.
    assert.equal(encipher('AAAAAAAAAA', 'ab'), 'ABABABABAB');
  });

  it('treats keyword case-insensitively', () => {
    assert.equal(encipher('HELLO', 'Key'), encipher('HELLO', 'KEY'));
  });

  it('throws on empty keyword', () => {
    assert.throws(() => encipher('abc', ''), TypeError);
  });

  it('throws on non-letter keyword', () => {
    assert.throws(() => encipher('abc', 'ke1'), TypeError);
  });

  it('throws on non-string text', () => {
    assert.throws(() => encipher(42, 'key'), TypeError);
  });
});

describe('decipher', () => {
  it('round-trips arbitrary plaintext', () => {
    const plaintext = 'The quick brown fox jumps over the lazy dog!';
    const keyword = 'secret';
    assert.equal(decipher(encipher(plaintext, keyword), keyword), plaintext);
  });

  it('round-trips text with digits and punctuation', () => {
    const plaintext = 'Attack at dawn: 07:00, sharp!';
    const keyword = 'LEMON';
    assert.equal(decipher(encipher(plaintext, keyword), keyword), plaintext);
  });

  it('deciphers the canonical example back to plaintext', () => {
    assert.equal(decipher('LXFOPVEFRNHR', 'LEMON'), 'ATTACKATDAWN');
  });

  it('throws on empty keyword', () => {
    assert.throws(() => decipher('abc', ''), TypeError);
  });

  it('throws on non-string text', () => {
    assert.throws(() => decipher(null, 'key'), TypeError);
  });
});
