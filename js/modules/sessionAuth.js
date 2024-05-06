export function generateSessionId() {
    return Math.random().toString(36).substr(2, 10);
}

export function setSessionCookie(sessionId) {
    document.cookie = `sessionId=${sessionId}; expires=Session; path=/`;
}

export function getSessionId() {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
        const [name, value] = cookie.split('=');
        if (name === 'sessionId') {
            return value;
        }
    }
    return null;
}