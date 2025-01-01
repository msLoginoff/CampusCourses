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

export const editStatusStudent = async (courseId, studentId, status) => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        console.log('User is not authorized');
        //todo сделать по-человечески
        window.location.href = "/login"
    }

    const response = await fetch(`https://camp-courses.api.kreosoft.space/courses/${courseId}/student-status/${studentId}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({status: status})
    });

    if (!response.ok) {
        console.error(`Ошибка при попытке сменить студенту ${studentId} статус в курсе ${courseId}: ` + JSON.stringify(await response.json()));
        throw new Error(response.status.toString());
    }

    return await response.json();
};

export const createNotification = async (courseId, notificationText, isImportant) => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        console.log('User is not authorized');
        //todo сделать по-человечески
        window.location.href = "/login"
    }

    const body = JSON.stringify({text: notificationText, isImportant: isImportant})
    console.log(body)

    const response = await fetch(`https://camp-courses.api.kreosoft.space/courses/${courseId}/notifications`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: body
    });

    if (!response.ok) {
        console.error(`Ошибка при попытке создать уведомление для курса ${courseId}: ` + JSON.stringify(await response.json()));
        throw new Error(response.status.toString());
    }

    return await response.json();
};

export const changeCourseStatus = async (courseId, status) => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        console.log('User is not authorized');
        //todo сделать по-человечески
        window.location.href = "/login"
    }

    const body = JSON.stringify({status: status})
    console.log(body)

    const response = await fetch(`https://camp-courses.api.kreosoft.space/courses/${courseId}/status`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: body
    });

    if (!response.ok) {
        console.error(`Ошибка при попытке поменять статус курсу ${courseId} на ${status}: ` + JSON.stringify(await response.json()));
        throw new Error(response.status.toString());
    }

    return await response.json();
};

export const addTeacher = async (courseId, teacherId) => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        console.log('User is not authorized');
        //todo сделать по-человечески
        window.location.href = "/login"
    }

    const body = JSON.stringify({userId: teacherId})
    console.log(body)

    const response = await fetch(`https://camp-courses.api.kreosoft.space/courses/${courseId}/teachers`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: body
    });

    if (!response.ok) {
        console.error(`Ошибка при попытке назначить преподавателя ${teacherId} на курс ${courseId}: ` + JSON.stringify(await response.json()));
        throw new Error(response.status.toString());
    }

    return await response.json();
};

export const changeCourseRequirementsAndAnnotations = async (courseId, requirements, annotations) => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        console.log('User is not authorized');
        //todo сделать по-человечески
        window.location.href = "/login"
    }

    const body = JSON.stringify({requirements: requirements, annotations: annotations})
    console.log(body)

    const response = await fetch(`https://camp-courses.api.kreosoft.space/courses/${courseId}/requirements-and-annotations`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: body
    });

    if (!response.ok) {
        console.error(`Ошибка при попытке изменить требования или аннотицию курса ${courseId} (requirements: ${requirements}, annotations: ${annotations}): ` + JSON.stringify(await response.json()));
        throw new Error(response.status.toString());
    }

    return await response.json();
};

export const changeCourseDetails = async (courseDetails) => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        console.log('User is not authorized');
        //todo сделать по-человечески
        window.location.href = "/login"
    }

    const body = JSON.stringify({
        name: courseDetails['name'],
        startYear: courseDetails['startYear'],
        maximumStudentsCount: courseDetails['maximumStudentsCount'],
        semester: courseDetails['semester'],
        requirements: courseDetails['requirements'],
        annotations: courseDetails['annotations'],
        mainTeacherId: courseDetails['mainTeacherId'],
    })
    console.log(body)

    const response = await fetch(`https://camp-courses.api.kreosoft.space/courses/${courseId}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: body
    });

    if (!response.ok) {
        console.error(`Ошибка при попытке изменить информацию о курсе ${courseId} (body: ${body}): ` + JSON.stringify(await response.json()));
        throw new Error(response.status.toString());
    }

    return await response.json();
};

export const setStudentMark = async (courseId, studentId, markType, mark) => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        console.log('User is not authorized');
        //todo сделать по-человечески
        window.location.href = "/login"
    }

    const body = JSON.stringify({
        markType: markType,
        mark: mark
    })
    console.log(body)

    const response = await fetch(`https://camp-courses.api.kreosoft.space/courses/${courseId}/marks/${studentId}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: body
    });

    if (!response.ok) {
        console.error(`Ошибка при попытке изменения отметки студента ${studentId} в курсе ${courseId} (body: ${body}): ` + JSON.stringify(await response.json()));
        throw new Error(response.status.toString());
    }

    return await response.json();
};

export const signUpToCourse = async (courseId) => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        console.log('User is not authorized');
        //todo сделать по-человечески
        window.location.href = "/login"
    }

    await tryRequest(async () => {
        const response = await fetch(`https://camp-courses.api.kreosoft.space/courses/${courseId}/sign-up`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            console.error(`Ошибка при попытке записаться на курс ${courseId}: ` + JSON.stringify(await response.json()));
            throw new Error(response.status.toString());
        }

        //Здесть может быть `return response;`
    })
};

export const tryRequest = async (fun) => {
    try {
        return fun()
    } catch (error) {

    }
}