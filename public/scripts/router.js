import {setupLoginPage} from "./login.js";
import {checkAuthorization, fetchRoles} from "./api/auth.js";
import {setupRegistrationPage} from "./registration.js";
import {getProfile} from "./api/profileApi.js";
import {setupLogoutPage} from "./logout.js";
import {setupProfilePage} from "./profile.js";
import {setupGroupsPage} from "./groups.js";
import {setupCourseCardPage} from "./course-card.js";

const routes = {
    "/": { template: "/pages/home.html", setup: null, based: true },
    "/registration": { template: "/pages/registration.html", setup: setupRegistrationPage, based: true },
    "/login": { template: "/pages/login.html", setup: setupLoginPage, based: true },
    "/logout": { template: "/pages/logout.html", setup: setupLogoutPage },
    "/profile": { template: "/pages/profile.html", setup: setupProfilePage },
    "/groups": { template: "/pages/groups.html", setup: setupGroupsPage },
    "/groups/:id": { template: "/pages/group-details.html", setup: null, dynamic: true },
    "/courses/:id": {template: "/pages/course-card/course-card.html", setup: setupCourseCardPage, dynamic: true},
};

export let cachedProfile = null;
export let isAuthorized = false;

function matchRoute(path) {
    if (routes[path] && !routes[path].dynamic) {
        return { route: routes[path], params: {} };
    }

    for (const [routePath, route] of Object.entries(routes)) {
        if (!route.dynamic) continue;

        const routeParts = routePath.split("/");
        const pathParts = path.split("/");

        if (routeParts.length !== pathParts.length) continue;

        const params = {};
        let isMatch = true;

        for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(":")) {
                const paramName = routeParts[i].slice(1);
                params[paramName] = pathParts[i];
            } else if (routeParts[i] !== pathParts[i]) {
                isMatch = false;
                break;
            }
        }

        if (isMatch) {
            return { route, params };
        }
    }

    return null;
}



async function loadPage(route, params = {}) {
    try {
        const response = await fetch(route.template);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const html = await response.text();
        document.getElementById('content').innerHTML = html;

        if (!isAuthorized) {
            await loadNavbar();
        }

        if (route.setup === null) {
            return
        }

        if (typeof route.setup !== "function") {
            console.error(`Route setup ${route.setup.name} is not a function. Check out route configurations for current path`);
            document.getElementById('content').innerHTML = '<h1>Something went wrong</h1>';
            return
        }

        await route.setup(params);
    } catch (error) {
        console.error('Error loading page:', error);
        document.getElementById('content').innerHTML = '<h1>Page not found</h1>';
    }
}

export async function handleRoute(path) {
    if (path !== "/") {
        path = path.replace(/\/+$/, "");
    }

    const authResponse = await checkAuthorization();
    const token = localStorage.getItem("authToken");

    if (!authResponse.ok || !token) {
        isAuthorized = false;
        cachedProfile = null;
        await loadNavbar();

        const route = matchRoute(path)?.route || routes["/"];
        if (route.based !== true) {
            window.history.pushState({}, "", "/login");
            await loadPage(routes["/login"]);
            return;
        }
    } else {
        isAuthorized = true;

        if (!cachedProfile) {
            cachedProfile = await getProfile();
        }
    }

    const matched = matchRoute(path);
    if (!matched) {
        document.getElementById("content").innerHTML = "<h1>Page not found</h1>";
        return;
    }

    const { route, params } = matched;

    await loadPage(route, params);
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
    const response = await fetch("/components/navbar.html");
    if (!response.ok) throw new Error(`Failed to load navbar`);
    const navbar = await response.text();
    document.getElementById("navbar").innerHTML = navbar;

    if (isAuthorized) {
        document.getElementById("Groups").hidden = false;
        document.getElementById("logout").hidden = false;
        document.getElementById("login").hidden = true;
        document.getElementById("registration").hidden = true;

        if (cachedProfile) {
            const userEmail = document.getElementById("user");
            userEmail.hidden = false;
            userEmail.getElementsByClassName("nav-link").item(0).innerHTML = cachedProfile.email;
        }
    } else {
        document.getElementById("Groups").hidden = true;
        document.getElementById("logout").hidden = true;
        document.getElementById("login").hidden = false;
        document.getElementById("registration").hidden = false;
    }

    const roles = isAuthorized ? await fetchRoles() : { isStudent: false, isTeacher: false };
    document.getElementById("MyCourses").hidden = !roles.isStudent;
    document.getElementById("TeacherCourses").hidden = !roles.isTeacher;
}


async function init() {
    const authResponse = await checkAuthorization();
    isAuthorized = authResponse.ok;
    if (isAuthorized) {
        cachedProfile = await getProfile();
    }

    setupRouter();
    await loadNavbar();
}

init();
