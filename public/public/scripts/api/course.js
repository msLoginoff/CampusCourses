export const fetchCourseDetails = async (courseId) => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        console.log('User is not authorized');
        //todo сделать по-человечески
        window.location.href = "/login"
    }

    const response = await fetch(`https://camp-courses.api.kreosoft.space/courses/${courseId}/details`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        console.error(`Ошибка при получении информации о курсе ${courseId}: ` + JSON.stringify(await response.json()));
        throw new Error(response.status.toString());
    }

    return await response.json();
};