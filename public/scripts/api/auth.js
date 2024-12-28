import {renderNavbar} from "../navbar.js";

export const login = async (email, password) => {
    try {
        const response = await fetch('https://camp-courses.api.kreosoft.space/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
            throw new Error('Ошибка авторизации');
        }
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        return data;
    } catch (error) {
        console.error('Ошибка при авторизации:', error);
        throw error;
    }
};

export const register = async (userData) => {
    try {
        const response = await fetch('https://camp-courses.api.kreosoft.space/registration', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        if (!response.ok) {
            throw new Error('Ошибка регистрации');
        }
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        await renderNavbar();
        return data;
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        throw error;
    }
};

export const fetchRoles = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return { isTeacher: false, isStudent: false, isAdmin: false };

    try {
        const response = await fetch('https://camp-courses.api.kreosoft.space/roles', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error('Ошибка получения ролей');
        }
        return await response.json();
    } catch (error) {
        console.error('Ошибка при получении ролей:', error);
        return { isTeacher: false, isStudent: false, isAdmin: false };
    }
};

const logout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
};