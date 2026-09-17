const TOKEN = "8534201632:AAECcw2E60yTvfbY3iQQtmsp8PxI3AET-TU";

const CHAT_ID = '5313390718';

export { CHAT_ID, TOKEN };

export async function telegramRequest<T = unknown> ( method: string, body: Record<string, unknown> ): Promise<T>
{
    const url = `https://api.telegram.org/bot${ TOKEN }/${ method }`;
    const response = await fetch( url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( body )
    } );
    return response.json() as Promise<T>;
}
