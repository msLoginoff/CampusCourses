export const fetchUsers = async () => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        console.log('User is not authorized');
        //todo сделать по-человечески
        window.location.href = "/login"
    }

    const response = await fetch(`https://camp-courses.api.kreosoft.space/users`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    });

    if (!response.ok) {
        console.error(`Ошибка при попытке получить список пользователей: ` + JSON.stringify(await response.json()));
        throw new Error(response.status.toString());
    }

    return await response.json();
};