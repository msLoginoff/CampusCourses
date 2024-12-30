export const fetchCourseDetails = async (courseId) => {
    const response = await fetch(`https://camp-courses.api.kreosoft.space/courses/${courseId}/details`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        console.error(`Ошибка при получении информации о курсе ${courseId}: ` + JSON.stringify(await response.json()));
        throw new Error(response.status.toString());
    }

    return await response.json();
};