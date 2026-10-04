# Vigenere Cipher

Enciphers and deciphers text using a Vigenère cipher — a polyalphabetic substitution controlled by a repeating keyword.

```js
import { encipher, decipher } from 'vigenere-cipher';

const ciphertext = encipher('Attack at dawn', 'LEMON');  // 'Lxfopv ef bgym'
const plaintext  = decipher('Lxfopv ef bgym', 'LEMON');  // 'Attack at dawn'
```

Exports two functions, both named above: `encipher(text, keyword)` and `decipher(text, keyword)`. Both return a string and throw a `TypeError` on invalid input.

## Why

This exists for the narrow case where you want the classic Vigenère cipher, with no dependencies and no build step — ESM you can import directly. The trade-off: it is a toy cipher, useless for real security, and it only handles the 26-letter ASCII alphabet. Anything outside A-Z/a-z passes through unchanged.

## The awkward edge

Non-letters (spaces, digits, punctuation) are passed through **unchanged and do not advance the keyword**. This is the standard tabletop convention, but it means `encipher('A B', 'key')` yields `'K L'` — the second letter is shifted by the keyword's first letter, not its second, because the space did not consume a key position. If you expected the keyword to advance on every input character, this will surprise you.

Case is preserved on output: uppercase stays uppercase, lowercase stays lowercase. The keyword itself is case-insensitive; `'Key'` and `'KEY'` are identical.
