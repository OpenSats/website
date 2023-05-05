import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    if(process.env.BTCPAY_URL &&request.nextUrl.pathname.startsWith('/.well-known/lnurlp/')) {
        //take process.env.BTCPAY_URL and strip the /api/v1/ from it, then take the username being requested and append it to the end
        const lnAddressEndpoint = `${process.env.BTCPAY_URL.replace('/api/v1/', '')}/.well-known/lnurlp/${request.nextUrl.pathname.replace('/.well-known/lnurlp/', '')}`;
        return NextResponse.rewrite(lnAddressEndpoint);
    }
    // you can even extend this and add nip5 support for each project on opensats, but that requires you to install the Nostr plugin on BTCPay
}
export const config = {
    matcher: '/.well-known/:path+',
};