import {setupLoginPage} from "./login.js";

const routes = {
    "/": { template: "/pages/home.html", setup: null },
    "/registration": { template: "/pages/registration.html", setup: null },
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

        if (typeof route.setup === "function") {
            await route.setup();
        }
    } catch (error) {
        console.error('Error loading page:', error);
        document.getElementById('content').innerHTML = '<h1>Page not found</h1>';
    }
}

function handleRoute(path) {
    const route = routes[path] || routes["/"];
    loadPage(route);
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

async function loadNavbar() {
    try {
        const response = await fetch('/components/navbar.html');
        if (!response.ok) throw new Error(`Failed to load navbar`);
        const navbar = await response.text();
        document.getElementById('navbar').innerHTML = navbar;
    } catch (error) {
        console.error('Error loading navbar:', error);
    }
}

async function init() {
    await loadNavbar();
    setupRouter();
}

init();
