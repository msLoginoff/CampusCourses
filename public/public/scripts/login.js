import {login} from "./api/auth.js";
import {loadNavbar} from "./router.js";

export async function setupLoginPage() {
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        login(username, password).then((value) => {
            loadNavbar()
            console.log(value.token);
            window.location.href="/";
        }).catch((error) => {console.log(error)});
    });
}
