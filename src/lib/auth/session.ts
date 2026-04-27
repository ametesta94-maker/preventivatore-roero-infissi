/**
 * Session utilities for CRM-based authentication.
 *
 * The preventivatore no longer uses Supabase Auth. Instead, authentication is
 * delegated to the CRM (localhost:5000). On successful login the Next.js server
 * creates a signed, httpOnly cookie that carries the user's identity.
 *
 * Signing: HMAC-SHA256(base64url(payload), SESSION_SECRET)
 * Cookie value: <base64url_payload>.<hex_signature>
 */

import { createHmac } from 'crypto'

export interface SessionUser {
    username: string
    display_name: string
    role: 'admin' | 'operatore'
}

interface SessionPayload extends SessionUser {
    exp: number  // Unix timestamp (seconds)
}

const SECRET = process.env.SESSION_SECRET || 'roero-infissi-crm-preventivatore-secret-2026'
const SESSION_TTL_SECONDS = 24 * 60 * 60  // 24 hours

function b64url(s: string): string {
    return Buffer.from(s).toString('base64url')
}

function sign(payload: string): string {
    return createHmac('sha256', SECRET).update(payload).digest('hex')
}

/**
 * Serialises a SessionUser into a signed cookie value.
 */
export function createSessionCookie(user: SessionUser): string {
    const payload: SessionPayload = {
        ...user,
        exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    }
    const encoded = b64url(JSON.stringify(payload))
    const sig = sign(encoded)
    return `${encoded}.${sig}`
}

/**
 * Parses and verifies a cookie value.
 * Returns the SessionUser on success, or null if invalid / expired / tampered.
 */
export function readSessionCookie(cookieValue: string): SessionUser | null {
    if (!cookieValue) return null
    const dotIdx = cookieValue.lastIndexOf('.')
    if (dotIdx === -1) return null

    const encoded = cookieValue.slice(0, dotIdx)
    const sig = cookieValue.slice(dotIdx + 1)

    // Constant-time comparison not strictly necessary for local-only app, but good practice
    if (sign(encoded) !== sig) return null

    let payload: SessionPayload
    try {
        payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8'))
    } catch {
        return null
    }

    if (!payload.exp || Math.floor(Date.now() / 1000) > payload.exp) return null

    return {
        username: payload.username,
        display_name: payload.display_name,
        role: payload.role,
    }
}

export const COOKIE_NAME = 'prev_session'
export const COOKIE_MAX_AGE = SESSION_TTL_SECONDS
