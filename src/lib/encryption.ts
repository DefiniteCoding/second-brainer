// Encryption key derived from a combination of browser-specific data
const getEncryptionKey = (): string => {
  const browserData = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth.toString(),
    screen.pixelDepth.toString(),
    new Date().getTimezoneOffset().toString()
  ].join('|');
  
  return browserData;
};

// Convert string to bytes
const stringToBytes = (str: string): Uint8Array => {
  return new TextEncoder().encode(str);
};

// Convert bytes to string
const bytesToString = (bytes: Uint8Array): string => {
  return new TextDecoder().decode(bytes);
};

// Convert bytes to base64
const bytesToBase64 = (bytes: Uint8Array): string => {
  const binString = Array.from(bytes, (x) => String.fromCharCode(x)).join("");
  return btoa(binString);
};

// Convert base64 to bytes
const base64ToBytes = (base64: string): Uint8Array => {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.charCodeAt(0));
};

// Generate initialization vector
const generateIV = (): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(12));
};

// Derive a key from the encryption key
const deriveKey = async (encryptionKey: string): Promise<CryptoKey> => {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    stringToBytes(encryptionKey),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: stringToBytes('SecondBrainerSalt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

// Encrypt API key
export const encryptApiKey = async (apiKey: string): Promise<string> => {
  try {
    const key = await deriveKey(getEncryptionKey());
    const iv = generateIV();
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      stringToBytes(apiKey)
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64 for storage
    return bytesToBase64(combined);
  } catch (error) {
    console.error('Error encrypting API key:', error);
    throw new Error('Failed to encrypt API key');
  }
};

// Decrypt API key
export const decryptApiKey = async (encryptedData: string): Promise<string> => {
  try {
    const key = await deriveKey(getEncryptionKey());
    
    // Convert from base64 and separate IV and encrypted data
    const combined = base64ToBytes(encryptedData);
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      encrypted
    );

    return bytesToString(new Uint8Array(decrypted));
  } catch (error) {
    console.error('Error decrypting API key:', error);
    throw new Error('Failed to decrypt API key');
  }
}; 