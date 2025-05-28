// lib/crypto.ts
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY = crypto.scryptSync(process.env.EMAIL_ENCRYPTION_SECRET!, "salt", 32); // 32 bytes for aes-256
const IV_LENGTH = 12; // For GCM, 12 bytes is recommended

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();

    return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decrypt(data: string): string {
    const buf = Buffer.from(data, "base64");
    const iv = buf.slice(0, IV_LENGTH);
    const tag = buf.slice(IV_LENGTH, IV_LENGTH + 16);
    const encryptedText = buf.slice(IV_LENGTH + 16);

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
        decipher.update(encryptedText),
        decipher.final(),
    ]);

    return decrypted.toString("utf8");
}
