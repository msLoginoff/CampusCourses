import {cachedRoles, isAuthorized} from "../router.js";

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
        //todo пофиксить login (убрать try catch)
    }
};

export const register = async (userData) => {
    const response = await fetch('https://camp-courses.api.kreosoft.space/registration', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        console.error('Ошибка при регистрации: ' + JSON.stringify(await response.json()));
        throw new Error(response.status.toString());
    }

    const data = await response.json();
    localStorage.setItem('authToken', data.token);
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
            throw response;
        }
        return await response.json();
    } catch (error) {
        console.error('Ошибка при получении ролей:', error);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
};

const roles = {
    isTeacher: true,
    isStudent: true,
    isAdmin: true,
}

const componentsAccesses = {
    myCoursesAccess: {
        isStudent: true,
        isTeacher: false,
        isAdmin: false,
    },
    teachingCoursesAccess: {
        isStudent: false,
        isTeacher: true,
        isAdmin: false,
    },
    createGroupOrCourseButton: {
        isStudent: false,
        isTeacher: false,
        isAdmin: true,
    }
}

export const checkAuthorization = async () => {
    const token = localStorage.getItem('authToken');
    const nonAuthError = new Error("Вы не авторизованы. Пожалуйста, войтите в систему");

    if (!token) {
        return {ok: false, errorMessage: nonAuthError.message}
    }

    let roles;
    try {
        roles = await fetchRoles();
    }
    catch (error) {
        console.log(error.status);
        if (error.status === 401) {
            localStorage.removeItem('authToken');
            return {
                ok: false,
                errorMessage: nonAuthError.message
            };
        }
        return {
            ok: false,
            errorStatus: error.status, errorMessage: error.message
        };
    }

    return {ok: true, roles: roles};
}


export const checkAccess = async (componentAccess, isLazy = true) => {

    if (!isLazy) {
        const response = await checkAuthorization();
        isAuthorized = response.ok;
        cachedRoles = response.roles;
    }

    if (!isAuthorized) {
        return false;
    }

    if (componentAccess.isStudent && !roles.isStudent) {
        return false;
    }
    if (componentAccess.isTeacher && !roles.isTeacher) {
        return false;
    }
    if (componentAccess.isAdmin && !roles.isAdmin) {
        return false;
    }

    return true;

}