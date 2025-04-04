
// Types for email SMTP integration
export interface EmailSMTPCredentials {
  username: string;
  password: string;
  smtp_host: string;
  smtp_port: string;
  imap_host: string;
  imap_port: string;
}

export interface EmailSMTPState {
  username: string;
  password: string;
  smtpHost: string;
  smtpPort: string;
  imapHost: string;
  imapPort: string;
  isEditing: boolean;
  isTesting: boolean;
  isEncrypting: boolean;
}
