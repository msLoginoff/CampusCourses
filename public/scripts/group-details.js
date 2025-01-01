import {getCurrentGroupName, getGroupCourses} from "./api/group-detailsApi.js";

export async function setupGroupDetailsPage(params) {
    const groupId = params["id"];
    const data = await getGroupCourses(params);
    document.getElementById('groupTitle').textContent = await getCurrentGroupName(groupId);

    const container = document.getElementById('containerForCourses');
    const template = document.getElementById("card-template").content;
    const token = localStorage.getItem('authToken');

    if (!token) return { isTeacher: false, isStudent: false, isAdmin: false };



    for (const course of data) {
        const card = template.cloneNode(true);

        card.querySelector(".course-title").textContent = course.name;
        card.querySelector(".course-status").textContent = course.status;
        card.querySelector(".course-year").textContent = course.startYear;
        card.querySelector(".course-semester").textContent = course.semester;
        card.querySelector(".course-total").textContent = course.maximumStudentsCount;
        card.querySelector(".course-available").textContent = course.remainingSlotsCount;

        const cardElement = card.querySelector(".card");
        cardElement.dataset.id = course.id;

        container.appendChild(card);
    }
    container.addEventListener("click", (event) => {
        const card = event.target.closest(".card");
        if (card) {
            const courseId = card.dataset.id; // Получаем id из data-атрибута
            console.log(`Клик по курсу с id: ${courseId}`);
            window.location.href = `/courses/${courseId}`;
        }
    });
}