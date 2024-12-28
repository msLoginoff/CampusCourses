import {setupLoginPage} from "./login.js";
import {fetchRoles} from "./api/auth.js";
import {setupRegistrationPage} from "./registration.js";

const routes = {
    "/": { template: "/pages/home.html", setup: null },
    "/registration": { template: "/pages/registration.html", setup: setupRegistrationPage },
    "/login": { template: "/pages/login.html", setup: setupLoginPage },
    "/profile": { template: "/pages/profile.html", setup: null },
    "/groups": { template: "/pages/groups.html", setup: null },
};

async function loadPage(route) {
    try {
        const response = await fetch(route.template);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const html = await response.text();
        document.getElementById('content').innerHTML = html;

        if (!localStorage.getItem('authToken')) {
            await loadNavbar()
        }

        if (typeof route.setup === "function") {
            await route.setup();
        }
    } catch (error) {
        console.error('Error loading page:', error);
        document.getElementById('content').innerHTML = '<h1>Page not found</h1>';
    }
}

export async function handleRoute(path) {
    const route = routes[path] || routes["/"];
    await loadPage(route);
}

function setupRouter() {
    document.body.addEventListener('click', (event) => {
        if (event.target.tagName === 'A' && event.target.getAttribute('href')) {
            event.preventDefault();
            const path = event.target.getAttribute('href');
            window.history.pushState({}, '', path);
            handleRoute(path);
        }
    });

    window.onpopstate = () => {
        handleRoute(window.location.pathname);
    };

    handleRoute(window.location.pathname);
}

export async function loadNavbar() {
    try {
        const response = await fetch('/components/navbar.html');
        if (!response.ok) throw new Error(`Failed to load navbar`);
        const navbar = await response.text();
        document.getElementById('navbar').innerHTML = navbar;

        const token = localStorage.getItem('authToken');

        const roles = await fetchRoles();
        console.log(roles);

        if (token) {
            document.getElementById('Groups').hidden = false;
        }

        document.getElementById('MyCourses').hidden = !roles.isStudent;
        document.getElementById('TeacherCourses').hidden = !roles.isTeacher;

    } catch (error) {
        console.error('Error loading navbar:', error);
    }
}

async function init() {
    await loadNavbar();
    setupRouter();
}

init();
