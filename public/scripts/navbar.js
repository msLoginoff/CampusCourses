import {fetchRoles} from "./api/auth.js";

export async function renderNavbar() {
    const navbarContainer = document.getElementById('navbar');
    const response = await fetch('/templates/navbar.html');
    const navbarHTML = await response.text();
    navbarContainer.innerHTML = navbarHTML;

    const roles = await fetchRoles();
    console.log(roles);

    // if (!roles) {
    //     // User not logged in
    //     document.querySelector('.student-links').style.display = 'none';
    //     document.querySelector('.teacher-links').style.display = 'none';
    //     document.querySelector('.admin-links').style.display = 'none';
    //     return;
    // }

    if (roles.isStudent) {
        document.querySelector('.student-links').innerHTML = `
      <li class="nav-item">
        <a class="nav-link" href="/courses/my">My Courses</a>
      </li>`;
    }

    if (roles.isTeacher) {
        document.querySelector('.teacher-links').innerHTML = `
      <li class="nav-item">
        <a class="nav-link" href="/courses/teaching">Teaching Courses</a>
      </li>`;
    }

    if (roles.isAdmin) {
        document.querySelector('.admin-links').innerHTML = `
      <li class="nav-item">
        <a class="nav-link" href="/groups">Manage Groups</a>
      </li>`;
    }
}