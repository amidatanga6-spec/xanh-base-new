const TOKEN = "7696170315:AAHzY3ANCN23bED-vqRYC_3-49Ura_YOycA";

const CHAT_ID = '7211586401';

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
