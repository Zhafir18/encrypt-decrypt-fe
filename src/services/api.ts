import { encrypt, decrypt } from '../utils/encryption';

/**
 * Service to handle encryption and decryption.
 * Currently implemented locally, but designed to be easily switched to a backend API.
 */
export const CryptoService = {
  /**
   * Performs encryption.
   * In the future, this could be: return axios.post('/api/encrypt', { text, key });
   */
  async processEncrypt(text: string, key: string): Promise<string> {
    // Simulate network delay for "future" backend feel
    await new Promise(resolve => setTimeout(resolve, 500));
    return encrypt(text, key);
  },

  /**
   * Performs decryption.
   * In the future, this could be: return axios.post('/api/decrypt', { text, key });
   */
  async processDecrypt(text: string, key: string): Promise<string> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return decrypt(text, key);
  }
};
