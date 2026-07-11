import { SecretsService } from './secrets.service';

describe('SecretsService', () => {
  const originalEncryptionKey = process.env.DATA_ENCRYPTION_KEY;
  const service = new SecretsService();

  beforeEach(() => {
    process.env.DATA_ENCRYPTION_KEY =
      'inventario-it-test-key-with-more-than-32-characters';
  });

  afterAll(() => {
    if (originalEncryptionKey === undefined) {
      delete process.env.DATA_ENCRYPTION_KEY;
      return;
    }

    process.env.DATA_ENCRYPTION_KEY = originalEncryptionKey;
  });

  it('encrypts without exposing plaintext and decrypts the original value', () => {
    const plaintext = 'Clave Demo 2026!';
    const encrypted = service.encrypt(plaintext);

    expect(encrypted).not.toBeNull();
    expect(encrypted).not.toContain(plaintext);
    expect(encrypted).toMatch(/^v1:/);
    expect(service.decrypt(encrypted)).toBe(plaintext);
  });

  it('does not encrypt an already encrypted value twice', () => {
    const encrypted = service.encrypt('otra-clave');

    expect(service.encrypt(encrypted)).toBe(encrypted);
  });

  it('supports null values', () => {
    expect(service.encrypt(null)).toBeNull();
    expect(service.decrypt(null)).toBeNull();
  });
});
