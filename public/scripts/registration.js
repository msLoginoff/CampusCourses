import {register} from "./api/auth.js";
import {loadNavbar} from "./router.js";

export async function setupRegistrationPage() {
    const registrationForm = document.getElementById('registrationForm');

    //todo Для удобства тестирования
    registrationForm.fullName.value = "Клон Владимира Путина"
    registrationForm.email.value = "putin" + Math.round(Math.random() * 100000) + "@gmail.com"
    registrationForm.birthDate.value = new Date("1952-10-07").toISOString().substring(0, 10)
    registrationForm.password.value = "putin-vor!1"
    registrationForm.ConfirmPassword.value = "putin-vor!1"

    registrationForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const userData = {
            fullName: registrationForm.fullName.value,
            email: registrationForm.email.value,
            birthDate: new Date(registrationForm.birthDate.value).toISOString(),
            password: registrationForm.password.value,
            ConfirmPassword: registrationForm.ConfirmPassword.value,
        };
        console.log(userData);

        register(userData).then((value) => {
            console.log(value.token);
        }).catch((error) => {console.log(error)});
        loadNavbar()
    });
}
