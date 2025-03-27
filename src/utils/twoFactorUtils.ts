
import * as speakeasy from 'speakeasy';

export const generateTOTPSecret = () => {
  const secret = speakeasy.generateSecret({ length: 32 });
  return secret.base32;
};

export const verifyTOTPCode = (secret: string, token: string) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token
  });
};
