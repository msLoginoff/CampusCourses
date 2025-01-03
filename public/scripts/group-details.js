import {getCurrentGroupName, getGroupCourses} from "./api/group-detailsApi.js";
import {translate} from "./course-card.js";
import {cachedRoles} from "./router.js";
import {fetchRoles} from "./api/auth";
import {getProfile} from "./api/profileApi";
import {changeCourseDetails, changeCourseRequirementsAndAnnotations} from "./api/course";

async function setupCreateCourseDetailsModal(courseDetails, roles, myEmail) {

    document.getElementById("long-form").style.display = null;
    document.getElementById("short-form").style.display = null;

    const changeCourseDetailsModalNode = document.getElementById("change-course-details-modal");
    const changeCourseDetailsModal = new bootstrap.Modal(changeCourseDetailsModalNode);

    const openModalButton = document.getElementById("change-course-details-button");
    const closeModalButton = changeCourseDetailsModalNode.getElementsByClassName("close-modal")[0];
    const saveModalButton = changeCourseDetailsModalNode.getElementsByClassName("save-modal")[0];

    openModalButton.style.display = null;
    openModalButton.addEventListener("click", async () => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/summernote/0.8.20/summernote-lite.min.css";
        document.head.appendChild(link);

        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/summernote/0.8.20/summernote-lite.min.js";
        script.onload = () => {
            $('#requirements-text').summernote({
                placeholder: 'Введите требования',
                height: 65,
                defaultFontName: 'system-ui',
                toolbar: [
                    ['style', ['style']],
                    ['font', ['bold', 'underline', 'clear', 'fontname']],
                    ['color', ['color']],
                    ['para', ['ul', 'ol', 'paragraph']],
                    ['table', ['table']],
                    ['insert', ['link', 'picture', 'video']],
                    ['view', ['fullscreen', 'codeview', 'help']],
                ],
                fontNames: ['Courier New', 'Helvetica', 'Times New Roman', 'Verdana', 'system-ui'], // Доступные шрифты
                fontNamesIgnoreCheck: ['system-ui'],
            });


            $('#annotations-text').summernote({
                placeholder: 'Введите аннотацию',
                height: 65,
                defaultFontName: 'system-ui',
                toolbar: [
                    ['style', ['style']],
                    ['font', ['bold', 'underline', 'clear', 'fontname']],
                    ['color', ['color']],
                    ['para', ['ul', 'ol', 'paragraph']],
                    ['table', ['table']],
                    ['insert', ['link', 'picture', 'video']],
                    ['view', ['fullscreen', 'codeview', 'help']],
                ],
                fontNames: ['Courier New', 'Helvetica', 'Times New Roman', 'Verdana', 'system-ui'], // Доступные шрифты
                fontNamesIgnoreCheck: ['system-ui'],
            });
        };
        document.body.appendChild(script);

        changeCourseDetailsModal.show();

    });

    closeModalButton.addEventListener("click", () => changeCourseDetailsModal.hide());
    saveModalButton.addEventListener("click", () => {
        const requirementsText = document.getElementById("requirements-text").value;
        const annotationsText = document.getElementById("annotations-text").value;
        const form = document.getElementById("edit-course-form");

        const newCourseDetails = {
            name: form.name.value,
            startYear: form.year.value,
            maximumStudentsCount: form.studentsCount.value,
            semester: form.semester[0].checked ? 'Spring' : "Autumn",
            requirements: requirementsText,
            annotations: annotationsText,
            mainTeacherId: "ddc025f9-f9b3-41be-12cd-08db2e8acafa"
        }

        console.log({...newCourseDetails, status: courseDetails['status']});

        if (roles.isAdmin) {
            changeCourseDetails(courseId, newCourseDetails).then(() => {
                changeCourseDetailsModal.hide();
                setupMainCourseDetails({ ...courseDetails, ...newCourseDetails });
            });
        } else if (roles.isTeacher) {
            changeCourseRequirementsAndAnnotations(courseId, requirementsText, annotationsText).then(() => {
                changeCourseDetailsModal.hide();
                setupRequirementsAndAnnotations(requirementsText, annotationsText);
            });
        }
    });
}


export async function setupGroupDetailsPage(params) {
    const groupId = params["id"];
    const data = await getGroupCourses(params);
    document.getElementById('groupTitle').textContent = await getCurrentGroupName(groupId);
    const roles = await fetchRoles()
    const profile = await getProfile()
    const myEmail = profile['email']

    const createButton = document.getElementById("createCourseBtn");

    if (cachedRoles.isAdmin) {
        createButton.hidden = false;
    }
    else {
        createButton.hidden = true;
    }

    setupChangeCourseDetailsModal()
    const container = document.getElementById('containerForCourses');
    const template = document.getElementById("card-template").content;
    const token = localStorage.getItem('authToken');

    if (!token) return { isTeacher: false, isStudent: false, isAdmin: false };



    for (const course of data) {
        const card = template.cloneNode(true);

        card.querySelector(".course-title").textContent = course.name;
        card.querySelector(".course-status").textContent = translate(course.status).status;
        card.querySelector(".course-status").style.color = translate(course.status).color;
        card.querySelector(".course-status").style.fontWeight = '500';
        card.querySelector(".course-year").textContent = course.startYear;
        card.querySelector(".course-semester").textContent = translate(course.semester);
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