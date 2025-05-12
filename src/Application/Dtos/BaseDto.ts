export abstract class BaseDto {
    protected sanitizeText(text: string | null | undefined): string | undefined {
        if (!text) return undefined;

        return text.trim()
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/`/g, '&#96;')
            .replace(/\\/g, '&#92;');
    }

    protected normalizeIdentifier(text: string | null | undefined): string | undefined {
        if (!text) return undefined;
        return text.replace(/\s+/g, '').toUpperCase();
    }

    protected normalizeAccountNumber(account: string | null | undefined): string | undefined {
        if (!account) return undefined;
        return account.replace(/\D/g, '');
    }
}