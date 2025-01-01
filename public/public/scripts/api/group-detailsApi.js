export const getGroups = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('User is not authorized');
    }

    const response = await fetch('https://camp-courses.api.kreosoft.space/groups', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
    }

    return await response.json();

};

export const getGroupCourses = async (params) => {
    const token = localStorage.getItem('authToken');

    const groupId = params["id"];
    if (!token) return { isTeacher: false, isStudent: false, isAdmin: false };

    const response = await fetch(`https://camp-courses.api.kreosoft.space/groups/${groupId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
    }

    return await response.json();
}

export const getCurrentGroupName = async (groupId) => {
    const groups = await getGroups();
    return groups.find((g) => g.id === groupId).name;
}