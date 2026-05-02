/**
 * AES-GCM Encryption/Decryption utility using Web Crypto API.
 */

// Helper to convert string to ArrayBuffer
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

/**
 * Derives a crypto key from a password string.
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    textEncoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts plain text using a secret key.
 * Format: Salt (16 bytes) + IV (12 bytes) + Ciphertext
 */
export async function encrypt(plainText: string, secretKey: string): Promise<string> {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(secretKey, salt);

  const encryptedContent = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    textEncoder.encode(plainText)
  );

  const combined = new Uint8Array(salt.length + iv.length + encryptedContent.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encryptedContent), salt.length + iv.length);

  // Convert to Base64 for easy transport/storage
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts cipher text using a secret key.
 */
export async function decrypt(cipherText: string, secretKey: string): Promise<string> {
  try {
    const combined = new Uint8Array(
      atob(cipherText)
        .split('')
        .map((c) => c.charCodeAt(0))
    );

    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const data = combined.slice(28);

    const key = await deriveKey(secretKey, salt);

    const decryptedContent = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    return textDecoder.decode(decryptedContent);
  } catch (error) {
    throw new Error('Decryption failed. Check your key and input.');
  }
}
