export interface GeneratedSecret {
  /**
   * Base32 representation of the secret
   */
  base32: string;
  /**
   * Google Authenticator-compatible otpauth URL.
   */
  otpauth_url?: string | undefined;
}


export interface GeneratedSecretObject {
  /**
   * Base32 representation of the secret
   */
  secret: string;
  /**
   * Google Authenticator-compatible otpauth URL.
   */
   otpauthUrl?: string;
}