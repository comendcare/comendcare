"use server"

import dns from 'dns/promises';

export async function validateEmailDomain(email: string) {
    const domain = email.split('@')[1];
    try {
        const mxRecords = await dns.resolveMx(domain);
        return mxRecords && mxRecords.length > 0;
    } catch {
        return false;
    }
}
