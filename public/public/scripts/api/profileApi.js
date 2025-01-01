export const getProfile = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('User is not authorized');
    }

    try {
        const response = await fetch('https://camp-courses.api.kreosoft.space/profile', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        //console.log(data.email)
        return data;

    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
};

export const editProfile = async (profile) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('User is not authorized');
    }

    try {
        const response = await fetch('https://camp-courses.api.kreosoft.space/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(profile),
        });

        if (!response.ok) {
            throw new Error(`${response.status}: ${response.statusText}`);
        }

        return response.ok;

    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
}
