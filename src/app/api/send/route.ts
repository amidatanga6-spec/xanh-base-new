import { CHAT_ID, telegramRequest } from '@/lib/telegram';
import { NextRequest, NextResponse } from 'next/server';
import { UAParser } from 'ua-parser-js';

function appendDeviceInfo(message: string, req: NextRequest) {
    const ua = req.headers.get('user-agent') || '';
    const parser = new UAParser(ua);
    const uaResult = parser.getResult();
    const deviceType = uaResult.device.type || 'desktop';
    const deviceVendor = uaResult.device.vendor || 'Unknown';
    const deviceModel = uaResult.device.model || 'Unknown';
    const osName = uaResult.os.name || 'Unknown';
    const osVersion = uaResult.os.version || 'Unknown';
    const deviceName = [deviceVendor, deviceModel].filter((item) => item && item !== 'Unknown').join(' ');
    const finalDeviceName = deviceName || (deviceType === 'desktop' ? 'Desktop' : deviceType);
    const osLabel = `${osName}${osVersion !== 'Unknown' ? ` ${osVersion}` : ''}`;
    const deviceInfo = `${finalDeviceName} | ${osLabel}`;

    return message.includes('__DEVICE_INFO__') ? message.replace('__DEVICE_INFO__', deviceInfo) : message;
}

const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { message, message_id, old_message_id } = body as {
            message?: string;
            message_id?: number;
            old_message_id?: number | null;
        };

        if (!message) {
            return NextResponse.json({ success: false }, { status: 400 });
        }

        const messageWithDeviceInfo = appendDeviceInfo(message, req);
        const previousMessageId = message_id ?? old_message_id ?? null;

        if (previousMessageId) {
            try {
                await telegramRequest('deleteMessage', {
                    chat_id: CHAT_ID,
                    message_id: previousMessageId
                });
            } catch {
                //
            }
        }

        const sendResult = (await telegramRequest('sendMessage', {
            chat_id: CHAT_ID,
            text: messageWithDeviceInfo,
            parse_mode: 'HTML'
        })) as { ok?: boolean; result?: { message_id?: number } };

        if (!sendResult.ok) {
            return NextResponse.json({ success: false }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message_id: sendResult.result?.message_id ?? null
        });
    } catch {
        return NextResponse.json({ success: false }, { status: 500 });
    }
};

export { POST };
