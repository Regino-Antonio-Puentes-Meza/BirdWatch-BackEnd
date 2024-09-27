import { NextResponse } from 'next/server';

export function createCORSResponse(body, status) {
    return new NextResponse(JSON.stringify(body), {
        status,
        headers: {
            'Access-Control-Allow-Origin': 'http://localhost:5173',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Origin, Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true',
            'Content-Type': 'application/json',
        },
    });
}

export function handleCORSOptions() {
    return createCORSResponse({}, 200);
}