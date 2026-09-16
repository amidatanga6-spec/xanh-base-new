import axios from 'axios';

export async function sendTelegramMessage(message: string): Promise<number | null> {
    const raw = sessionStorage.getItem('messageId');
    const parsed = raw ? Number(raw) : Number.NaN;
    const message_id = Number.isNaN(parsed) ? undefined : parsed;

    try {
        const res = await axios.post<{ success: boolean; message_id?: number | null }>('/api/send', {
            message,
            message_id
        });

        if (res.data?.success && typeof res.data.message_id === 'number') {
            sessionStorage.setItem('messageId', String(res.data.message_id));
            return res.data.message_id;
        }
    } catch {
        //
    }

    return null;
}
