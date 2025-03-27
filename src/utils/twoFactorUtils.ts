
import { TOTP } from 'otpauth';

export const generateTOTPSecret = (): string => {
  // Generate a random secret key
  const secret = new Uint8Array(20);
  crypto.getRandomValues(secret);
  
  // Convert to base32
  return encodeBase32(secret);
};

export const verifyTOTPCode = (secret: string, token: string): boolean => {
  try {
    // Create a TOTP object
    const totp = new TOTP({
      issuer: 'Your App',
      label: 'User',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret
    });
    
    // Delta of 1 means we check the current time window and one before/after
    // This gives a 90-second window for the code to be valid
    return totp.validate({ token, window: 1 }) !== null;
  } catch (error) {
    console.error('TOTP verification error:', error);
    return false;
  }
};

// Base32 encoding function (RFC 4648)
const encodeBase32 = (data: Uint8Array): string => {
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  let bits = 0;
  let value = 0;
  
  for (let i = 0; i < data.length; i++) {
    value = (value << 8) | data[i];
    bits += 8;
    
    while (bits >= 5) {
      result += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  
  if (bits > 0) {
    result += ALPHABET[(value << (5 - bits)) & 31];
  }
  
  // Padding to make length a multiple of 8
  while (result.length % 8 !== 0) {
    result += '=';
  }
  
  return result;
};
