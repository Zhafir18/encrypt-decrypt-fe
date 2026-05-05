/**
 * Service to handle encryption and decryption.
 * Now hits the backend API via the Nginx proxy.
 */
export const CryptoService = {
  /**
   * Performs encryption using the backend API.
   * Note: Backend requires the key to be exactly 32 bytes long.
   */
  async processEncrypt(text: string, key: string): Promise<string> {
    const response = await fetch('/api/encrypt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plaintext: text,
        type: 'gcm',
        key: key
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Encryption failed');
    }

    const data = await response.json();
    return data.ciphertext;
  },

  /**
   * Performs decryption using the backend API.
   * Note: Backend requires the key to be exactly 32 bytes long.
   */
  async processDecrypt(text: string, key: string): Promise<string> {
    const response = await fetch('/api/decrypt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ciphertext: text,
        type: 'gcm',
        key: key
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Decryption failed');
    }

    const data = await response.json();
    return data.plaintext;
  }
};



