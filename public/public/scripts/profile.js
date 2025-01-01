import {login} from "./api/auth.js";
import {cachedProfile, loadNavbar} from "./router.js";
import {editProfile, getProfile} from "./api/profileApi.js";

export async function setupProfilePage() {
    const form = document.getElementById('profileForm');
    const saveButton = document.getElementById('saveButton');
    let profileData = null;

    if (cachedProfile) {
        form.fullName.value = cachedProfile.fullName;
        form.email.value = cachedProfile.email;
        form.birthDate.value = cachedProfile.birthDate.substring(0, 10);
    } else {
        form.fullName.value = 'Failed to load';
    }

    try {
        profileData = await getProfile();
        cachedProfile.fullName = profileData.fullName;
        cachedProfile.email = profileData.email;
        cachedProfile.birthDate = profileData.birthDate;
        form.fullName.value = profileData.fullName;
        form.email.value = profileData.email;
        form.birthDate.value = profileData.birthDate.substring(0, 10);
    } catch (error) {
        console.error('Error fetching profile:', error);
    }

    const checkForChanges = () => {
        const formattedBirthDate = cachedProfile.birthDate.substring(0, 10);
        const hasChanges =
            form.fullName.value !== cachedProfile.fullName ||
            form.birthDate.value !== formattedBirthDate;

        saveButton.disabled = !hasChanges; // Активируем или деактивируем кнопку
    };

    form.fullName.addEventListener('input', checkForChanges);
    form.birthDate.addEventListener('input', checkForChanges);

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        editProfile({fullName: form.fullName.value, birthDate:  new Date(form.birthDate.value)}).then((value) => {
            loadNavbar()
            console.log(value.token);
            window.location.href="/profile";
        }).catch((error) => {console.log(error)});
    });
}