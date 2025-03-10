'use client';

import Cookies from 'js-cookie';

// LocalStorage'dan token'ı cookie'ye senkronize et
export function syncTokenToCookie() {
    const token = localStorage.getItem('accessToken');
    if (token) {
        Cookies.set('token', token);
    } else {
        Cookies.remove('token');
    }
}

// Cookie'den token'ı localStorage'a senkronize et
export function syncTokenToLocalStorage() {
    const token = Cookies.get('token');
    if (token) {
        localStorage.setItem('accessToken', token);
    } else {
        localStorage.removeItem('accessToken');
    }
}
