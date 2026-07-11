import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto';

const ENCRYPTION_VERSION = 'v1';
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH_BYTES = 12;

@Injectable()
export class SecretsService {
  encrypt(value: string | null): string | null {
    if (value === null || value.length === 0) {
      return null;
    }

    if (this.isEncrypted(value)) {
      return value;
    }

    const iv = randomBytes(IV_LENGTH_BYTES);
    const cipher = createCipheriv(
      ENCRYPTION_ALGORITHM,
      this.getEncryptionKey(),
      iv,
    );
    const encrypted = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return [
      ENCRYPTION_VERSION,
      iv.toString('base64url'),
      authTag.toString('base64url'),
      encrypted.toString('base64url'),
    ].join(':');
  }

  decrypt(value: string | null): string | null {
    if (value === null || value.length === 0) {
      return null;
    }

    const parts = value.split(':');

    if (parts.length !== 4 || parts[0] !== ENCRYPTION_VERSION) {
      throw new InternalServerErrorException(
        'El secreto almacenado no tiene un formato de cifrado válido',
      );
    }

    try {
      const [, ivValue, authTagValue, encryptedValue] = parts;
      const decipher = createDecipheriv(
        ENCRYPTION_ALGORITHM,
        this.getEncryptionKey(),
        Buffer.from(ivValue, 'base64url'),
      );

      decipher.setAuthTag(Buffer.from(authTagValue, 'base64url'));

      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedValue, 'base64url')),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch {
      throw new InternalServerErrorException(
        'No fue posible descifrar el secreto almacenado',
      );
    }
  }

  isEncrypted(value: string): boolean {
    return value.startsWith(`${ENCRYPTION_VERSION}:`);
  }

  private getEncryptionKey(): Buffer {
    const configuredKey = process.env.DATA_ENCRYPTION_KEY;

    if (!configuredKey || configuredKey.length < 32) {
      throw new InternalServerErrorException(
        'DATA_ENCRYPTION_KEY debe estar configurada con al menos 32 caracteres',
      );
    }

    return createHash('sha256').update(configuredKey, 'utf8').digest();
  }
}
