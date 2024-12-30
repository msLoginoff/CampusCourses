import {setupLoginPage} from "./login.js";
import {checkAuthorization, fetchRoles} from "./api/auth.js";
import {setupRegistrationPage} from "./registration.js";
import {getProfile} from "./api/profileApi.js";
import {setupLogoutPage} from "./logout.js";
import {setupProfilePage} from "./profile.js";

const routes = {
    "/": { template: "/pages/home.html", setup: null, based: true },
    "/registration": { template: "/pages/registration.html", setup: setupRegistrationPage, based: true },
    "/login": { template: "/pages/login.html", setup: setupLoginPage, based: true },
    "/logout": { template: "/pages/logout.html", setup: setupLogoutPage },
    "/profile": { template: "/pages/profile.html", setup: setupProfilePage },
    "/groups": { template: "/pages/groups.html", setup: null },
};

export let cachedProfile = {
    fullName: null,
    email: null,
    birthDate: null,
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

    if (path === '/profile') {
        try {
            cachedProfile = await getProfile();
        } catch (error) {
            console.error('Error preloading profile:', error);
        }
    }

    const route = routes[path] || routes["/"];
    if (route.based !== true) {
        const isAuthorize = await checkAuthorization();

        console.log(isAuthorize)
        if (!isAuthorize.ok) {
            const route1 = routes["/login"] || routes["/"];
            window.location.href = "/login";
            await loadPage(route1);
            return;
        }
    }
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
    const response = await fetch('/components/navbar.html');
    if (!response.ok) throw new Error(`Failed to load navbar`);
    const navbar = await response.text();
    document.getElementById('navbar').innerHTML = navbar;

    const token = localStorage.getItem('authToken');

    if (token) {
        document.getElementById('Groups').hidden = false;
        document.getElementById('logout').hidden = false;
        document.getElementById('login').hidden = true;
        document.getElementById('registration').hidden = true;
        const profile = await getProfile();
        const emailFromServer = profile.email;
        const userEmail = document.getElementById('user');
        userEmail.hidden = false;
        userEmail.getElementsByClassName('nav-link').item(0).innerHTML = emailFromServer;
    }

    const roles = await fetchRoles();
    document.getElementById('MyCourses').hidden = !roles.isStudent;
    document.getElementById('TeacherCourses').hidden = !roles.isTeacher;
}

async function init() {
    setupRouter();
    await loadNavbar();
}

init();
