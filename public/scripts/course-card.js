import {
    addTeacher, changeCourseRequirementsAndAnnotations,
    changeCourseStatus,
    createNotification,
    editStatusStudent,
    fetchCourseDetails, setStudentMark, signUpToCourse
} from "./api/course.js";
import {fetchRoles} from "./api/auth.js";
import {fetchUsers} from "./api/user.js";
import {getProfile} from "./api/profileApi.js";

export async function setupCourseCardPage(params) {
    const courseId = params.id;
    const courseDetails = await fetchCourseDetails(courseId)
    const roles = await fetchRoles()
    const profile = await getProfile()
    const myEmail = profile['email']
    console.log(courseDetails)

    setupMainCourseDetails(courseDetails)
    setupNotifications(courseDetails)
    setupTeachers(courseDetails)
    setupStudents(courseDetails, roles)

    setupSignUpToCourseButton(courseDetails, roles, myEmail)

    setupChangeCourseDetailsModal(courseDetails, roles, myEmail)
    setupChangeCourseStatusModal(courseDetails, roles, myEmail)
    setupCreateNotificationModal(courseDetails, roles, myEmail)
    setupAddTeacherModal(courseDetails, roles, myEmail)
}

function setupMainCourseDetails(courseDetails) {
    setupCourseStatus(courseDetails['status'])
    setupRequirementsAndAnnotations(courseDetails['requirements'], courseDetails['annotations'])

    document.getElementById(`name`).innerHTML = courseDetails['name']
    document.getElementById(`start-year`).innerHTML = courseDetails['startYear']
    document.getElementById(`semester`).innerHTML = translate(courseDetails['semester'])
    document.getElementById(`maximum-students-count`).innerHTML = courseDetails['maximumStudentsCount']
    document.getElementById(`students-enrolled-count`).innerHTML = courseDetails['studentsEnrolledCount']
    document.getElementById(`students-in-queue-count`).innerHTML = courseDetails['studentsInQueueCount']
}

function setupRequirementsAndAnnotations(requirements, annotations) {
    document.getElementById(`requirements`).innerHTML = requirements
    document.getElementById(`annotations`).innerHTML = annotations
    document.getElementById("requirements-text").value = requirements;
    document.getElementById("annotations-text").value = annotations;
}

function setupCourseStatus(status) {
    document.getElementById(`status`).innerHTML = translate(status)

    const openForAssigning = document.getElementById(`open-for-assigning-course-status`)
    const started = document.getElementById(`started-course-status`)
    const finished = document.getElementById(`finished-course-status`)

    if (status === 'OpenForAssigning') {
        openForAssigning.checked = true
        openForAssigning.disabled = true
    } else if (status === 'Started') {
        started.checked = true
        openForAssigning.disabled = true
        started.disabled = true
    } else if (status === 'Finished') {
        finished.checked = true
        openForAssigning.disabled = true
        finished.disabled = true
        started.disabled = true
        document.getElementById("change-course-status-button").disabled = true
    }
}

function setupNotifications(courseDetails) {
    document.getElementById(`notification-count`).innerHTML = `${courseDetails['notifications']?.length ?? 0}`

    courseDetails['notifications'].forEach((notification) => {
        addNotificationNode(notification['text'], notification['isImportant'])
    })
}

function setupTeachers(courseDetails) {
    courseDetails['teachers'].forEach((teacher) => {
        addTeacherNode(teacher['name'], teacher['email'], teacher['isMain'])
    })
}

function setupStudents(courseDetails, roles) {
    const courseId = courseDetails['id']
    const students = courseDetails['students']

    students.sort((a, b) => {
        if (a['status'] === b['status']) {
            return 0
        } else if (b['status'] === 'Accepted') {
            return 1
        } else if (b['status'] === 'Declined') {
            return -1
        } else if (a['status'] === 'Accepted') {
            return -1
        } else if (a['status'] === 'Declined') {
            return 1
        }
    })

    const studentListNode = document.getElementById(`students`)
    const studentTemplateNode = document.getElementById(`student-template`)
    const studentStatusChangeTemplateNode = document.getElementById(`student-status-change-template`)

    courseDetails['students'].forEach((student) => {
        const studentNode = studentTemplateNode.cloneNode(true)
        const middleTermResultContainerNode = studentNode.getElementsByClassName("midterm-result-container")[0]
        const finalResultLabelContainerNode = studentNode.getElementsByClassName("final-result-container")[0]
        const middleTermResultNode = studentNode.getElementsByClassName("midtermResult")[0]
        const finalResultNode = studentNode.getElementsByClassName("finalResult")[0]

        studentNode.getElementsByClassName("student-name")[0].innerHTML = student['name']
        studentNode.getElementsByClassName("student-email")[0].innerHTML = student['email']
        studentNode.getElementsByClassName("student-status")[0].innerHTML = translate(student['status'])

        if (student ['status'] === 'Accepted' && student['midtermResult'] && student['finalResult']) {
            middleTermResultContainerNode.style.display = null
            finalResultLabelContainerNode.style.display = null
            middleTermResultNode.innerHTML = translate(student['midtermResult'])
            finalResultNode.innerHTML = translate(student['finalResult'])
        }

        setupMidtermResultChangeModal(courseId, student['id'], studentNode)
        setupFinalResultChangeModal(courseId, student['id'], studentNode)

        if (student['status'] === 'InQueue') {
            const studentStatusChangeNode = studentStatusChangeTemplateNode.cloneNode(true)
            studentStatusChangeNode.getElementsByClassName('accept-button')[0].onclick = function () {
                acceptStudent(courseId, student['id']).then(() => {
                    studentNode.removeChild(studentStatusChangeNode)
                    studentNode.getElementsByClassName("student-status")[0].innerHTML = translate('Accepted')
                })
            }
            studentStatusChangeNode.getElementsByClassName('decline-button')[0].onclick = function () {
                declineStudent(courseId, student['id']).then(() => {
                    studentNode.removeChild(studentStatusChangeNode)
                    studentNode.getElementsByClassName("student-status")[0].innerHTML = translate('Declined')
                })
            }

            studentStatusChangeNode.style.display = null
            studentNode.appendChild(studentStatusChangeNode)
        }

        studentNode.style.display = null
        studentListNode.appendChild(studentNode)
    })
}

function addNotificationNode(notificationText, isImportant) {
    const notificationListNode = document.getElementById(`notifications`)
    const notificationTemplateNode = document.getElementById(`notification-template`)
    const notificationNode = notificationTemplateNode.cloneNode(true)

    if (isImportant) {
        notificationNode.style.color = 'red'
    }

    notificationNode.innerHTML = `${notificationText}`
    notificationNode.style.display = null
    notificationListNode.appendChild(notificationNode)
}

function addTeacherNode(teacherName, teacherEmail, isMain) {
    const teacherListNode = document.getElementById(`teachers`)
    const teacherTemplateNode = document.getElementById(`teacher-template`)
    const teacherBadgeTemplateNode = document.getElementById(`teacher-badge-template`)

    const teacherNode = teacherTemplateNode.cloneNode(true)
    teacherNode.getElementsByClassName("teacher-name")[0].innerHTML = teacherName
    teacherNode.getElementsByClassName("teacher-email")[0].innerHTML = teacherEmail

    if (isMain) {
        const teacherBadgeNode = teacherBadgeTemplateNode.cloneNode(true)
        teacherBadgeNode.innerHTML = "Основной"
        teacherBadgeNode.style.display = null
        teacherNode.appendChild(teacherBadgeNode)
    }

    teacherNode.style.display = null
    teacherListNode.appendChild(teacherNode)
}

function setupSignUpToCourseButton(courseDetails, roles, myEmail) {
    const courseId = courseDetails['id']
    const signUpToCourseButton = document.getElementById("sign-up-to-course-button")
    const isCourseTeacher = courseDetails['teachers'].some((teacher) => teacher['email'] === myEmail)
    const isCourseStudent = courseDetails['students'].some((students) => students['email'] === myEmail)

    if (isCourseTeacher || isCourseStudent || courseDetails['status'] !== 'OpenForAssigning') {
        return
    }

    signUpToCourseButton.style.display = null
    signUpToCourseButton.addEventListener("click", () => {
        signUpToCourse(courseId).then(() => {
            signUpToCourseButton.style.display = 'none'
            alert("Заявка отправлена")
        }).catch(() => {
            alert("Не удалось отправить заявку. Возможно, вы уже отправили заявку ранее. Свяжитесь с преподавателем курса")
        })
    })
}

function setupCreateNotificationModal(courseDetails, roles, myEmail) {
    const courseId = courseDetails['id']
    const isCourseTeacher = courseDetails['teachers'].some((teacher) => teacher['email'] === myEmail)

    if (!roles.isAdmin && !isCourseTeacher) {
        return;
    }

    const createNotificationModalNode = document.getElementById("create-notification-modal")
    // noinspection JSUnresolvedReference
    const createNotificationModal = new bootstrap.Modal(createNotificationModalNode);

    const openModalButton = document.getElementById("create-notification-button");
    const closeModalButton = createNotificationModalNode.getElementsByClassName("close-modal")[0];
    const saveModalButton = createNotificationModalNode.getElementsByClassName("save-modal")[0];

    openModalButton.style.display = null
    openModalButton.addEventListener("click", () => createNotificationModal.show())
    // noinspection JSUnresolvedReference
    closeModalButton.addEventListener("click", () => createNotificationModal.hide())
    saveModalButton.addEventListener("click", () => {
        const notificationText = document.getElementById("notification-text").value;
        const isImportant = document.getElementById("notification-importance").checked

        createNotification(courseId, notificationText, isImportant).then(() => {
            // noinspection JSUnresolvedReference
            createNotificationModal.hide()
            const notificationCountNode = document.getElementById(`notification-count`)
            notificationCountNode.innerHTML = `${parseInt(notificationCountNode.innerHTML) + 1}`
            addNotificationNode(notificationText, isImportant)
        })
    })
}

function setupChangeCourseDetailsModal(courseDetails, roles, myEmail) {
    const courseId = courseDetails['id']
    const isCourseTeacher = courseDetails['teachers'].some((teacher) => teacher['email'] === myEmail)

    if (roles.isAdmin) {
        document.getElementById("long-form").style.display = null
    } else if (roles.isTeacher && isCourseTeacher) {
        document.getElementById("short-form").style.display = null
    } else {
        return
    }

    const changeCourseDetailsModalNode = document.getElementById("change-course-details-modal")
    // noinspection JSUnresolvedReference
    const changeCourseDetailsModal = new bootstrap.Modal(changeCourseDetailsModalNode);

    const openModalButton = document.getElementById("change-course-details-button");
    const closeModalButton = changeCourseDetailsModalNode.getElementsByClassName("close-modal")[0];
    const saveModalButton = changeCourseDetailsModalNode.getElementsByClassName("save-modal")[0];

    openModalButton.style.display = null
    openModalButton.addEventListener("click", () => changeCourseDetailsModal.show())
    // noinspection JSUnresolvedReference
    closeModalButton.addEventListener("click", () => changeCourseDetailsModal.hide())
    saveModalButton.addEventListener("click", () => {
        const requirementsText = document.getElementById("requirements-text").value;
        const annotationsText = document.getElementById("annotations-text").value;

        if (roles.isAdmin) {
            //todo добавить редактирование всей информации о курсе
        } else if (roles.isTeacher) {
            changeCourseRequirementsAndAnnotations(courseId, requirementsText, annotationsText).then(() => {
                // noinspection JSUnresolvedReference
                changeCourseDetailsModal.hide()
                setupRequirementsAndAnnotations(requirementsText, annotationsText)
            })

        }
    })
}

function setupChangeCourseStatusModal(courseDetails, roles, myEmail) {
    const courseId = courseDetails['id']
    const isCourseTeacher = courseDetails['teachers'].some((teacher) => teacher['email'] === myEmail)

    if (!roles.isAdmin && !isCourseTeacher) {
        return
    }

    const createChangeCourseStatusModalNode = document.getElementById("change-course-status-modal")
    // noinspection JSUnresolvedReference
    const createChangeCourseStatusModal = new bootstrap.Modal(createChangeCourseStatusModalNode);

    const openModalButton = document.getElementById("change-course-status-button");
    const closeNodalButton = createChangeCourseStatusModalNode.getElementsByClassName("close-modal")[0];
    const saveModalButton = createChangeCourseStatusModalNode.getElementsByClassName("save-modal")[0];

    openModalButton.style.display = null
    openModalButton.addEventListener("click", () => createChangeCourseStatusModal.show())
    // noinspection JSUnresolvedReference
    closeNodalButton.addEventListener("click", () => createChangeCourseStatusModal.hide())
    saveModalButton.addEventListener("click", () => {
        const openForAssigning = document.getElementById("open-for-assigning-course-status").checked
        const started = document.getElementById("started-course-status").checked
        const finished = document.getElementById("finished-course-status").checked
        let status

        if (openForAssigning) {
            status = 'OpenForAssigning'
        } else if (started) {
            status = 'Started'
        } else if (finished) {
            status = 'Finished'
        }

        changeCourseStatus(courseId, status).then(() => {
            // noinspection JSUnresolvedReference
            createChangeCourseStatusModal.hide()
            setupCourseStatus(status)
        })
    })
}

function setupAddTeacherModal(courseDetails, roles, myEmail) {
    const isMainTeacher = courseDetails['teachers'].some((teacher) => teacher['isMain'] && teacher['email'] === myEmail)
    if (!roles.isAdmin && !isMainTeacher) {
        return
    }

    const courseId = courseDetails['id']
    const usersNode = document.getElementById("users")
    const errorTextNode = document.getElementById("add-teacher-modal-error-text")
    const addTeacherModalNode = document.getElementById("add-teacher-modal")
    // noinspection JSUnresolvedReference
    const addTeacherModal = new bootstrap.Modal(addTeacherModalNode);

    const openModalButton = document.getElementById("add-teacher-button");
    const closeNodalButton = addTeacherModalNode.getElementsByClassName("close-modal")[0];
    const saveModalButton = addTeacherModalNode.getElementsByClassName("save-modal")[0];

    fetchUsers().then((users) => {
        // const currentTeachers = courseDetails['teachers'].map((teacher) => teacher['id'])
        const currentStudents = courseDetails['students'].map((student) => student['id'])
        users = users
            // .filter((user) => !currentTeachers.includes(user['id']))
            .filter((user) => !currentStudents.includes(user['id']))

        users.forEach((user) => {
            //todo Это для тестирования, убрать перед сдачей
            if (!user['fullName'].toString().includes("Путин")) {
                return
            }

            const userOption = new Option(user['fullName'], user['id'])
            usersNode.appendChild(userOption)
        })
    })

    openModalButton.style.display = null
    openModalButton.addEventListener("click", () => addTeacherModal.show())
    // noinspection JSUnresolvedReference
    closeNodalButton.addEventListener("click", () => addTeacherModal.hide())
    usersNode.addEventListener("click", () => {
        errorTextNode.style.display = 'none'
        errorTextNode.innerHTML = ""
    })
    saveModalButton.addEventListener("click", () => {
        const teacherId = usersNode.value
        // const teacherName = usersNode.options[usersNode.selectedIndex].text;
        addTeacher(courseId, teacherId).then(() => {
            window.location.reload()
            // addTeacherNode(teacherName, '', false)
        }).catch(() => {
            errorTextNode.style.display = null
            errorTextNode.innerHTML =
                "Не удаётся добавить преподавателя к курсу. Возможно, он уже являестя преподалавателем этого курса."
        })
    })
}

function setupMidtermResultChangeModal(courseId, studentId, studentNode) {
    const changeMidtermResultModalNode = document.getElementById("midterm-result-change-modal")
    // noinspection JSUnresolvedReference
    const changeMidtermResultModal = new bootstrap.Modal(changeMidtermResultModalNode);

    const openModalButton = studentNode.getElementsByClassName("change-midterm-result-button")[0];
    const closeModalButton = changeMidtermResultModalNode.getElementsByClassName("close-modal")[0];


    openModalButton.addEventListener("click", () => {
        changeMidtermResultModal.show()

        const saveModalButton = changeMidtermResultModalNode.getElementsByClassName("save-modal")[0];
        const saveModalButtonClone = saveModalButton.cloneNode(true);
        saveModalButton.parentNode.replaceChild(saveModalButtonClone, saveModalButton);

        saveModalButtonClone.addEventListener("click", () => {
            const passed = document.getElementById("passed-midterm-result").checked
            const failed = document.getElementById("failed-midterm-result").checked

            if (!passed && !failed) {
                return
            }

            const mark = passed ? 'Passed' : 'Failed'
            setStudentMark(courseId, studentId, 'Midterm', mark).then(() => {
                studentNode.getElementsByClassName("midtermResult")[0].innerHTML = translate(mark)
                // noinspection JSUnresolvedReference
                changeMidtermResultModal.hide()
            })
        })
    })
    // noinspection JSUnresolvedReference
    closeModalButton.addEventListener("click", () => changeMidtermResultModal.hide())

}

function setupFinalResultChangeModal(courseId, studentId, studentNode) {
    const changeFinalResultModalNode = document.getElementById("final-result-change-modal")
    // noinspection JSUnresolvedReference
    const changeFinalResultModal = new bootstrap.Modal(changeFinalResultModalNode);

    const openModalButton = studentNode.getElementsByClassName("change-final-result-button")[0];
    const closeModalButton = changeFinalResultModalNode.getElementsByClassName("close-modal")[0];


    openModalButton.addEventListener("click", () => {
        changeFinalResultModal.show()

        const saveModalButton = changeFinalResultModalNode.getElementsByClassName("save-modal")[0];
        const saveModalButtonClone = saveModalButton.cloneNode(true);
        saveModalButton.parentNode.replaceChild(saveModalButtonClone, saveModalButton);

        saveModalButtonClone.addEventListener("click", () => {
            const passed = document.getElementById("passed-final-result").checked
            const failed = document.getElementById("failed-final-result").checked

            if (!passed && !failed) {
                return
            }

            const mark = passed ? 'Passed' : 'Failed'
            setStudentMark(courseId, studentId, 'Final', mark).then(() => {
                studentNode.getElementsByClassName("finalResult")[0].innerHTML = translate(mark)
                // noinspection JSUnresolvedReference
                changeFinalResultModal.hide()
            })
        })
    })
    // noinspection JSUnresolvedReference
    closeModalButton.addEventListener("click", () => changeFinalResultModal.hide())
}

async function acceptStudent(courseId, studentId) {
    return editStatusStudent(courseId, studentId, 'Accepted')
}

async function declineStudent(courseId, studentId) {
    return editStatusStudent(courseId, studentId, 'Declined')
}

function translate(enumValue) {
    switch (enumValue) {
        case 'InQueue':
            return 'В очереди'
        case 'NotDefined':
            return 'Отметки нет'
        case 'Accepted':
            return 'Принят в группу'
        case 'Declined':
            return 'Отклонен'
        case 'Created':
            return 'Создан'
        case 'OpenForAssigning':
            return 'Открыт для записи'
        case 'Started':
            return 'В процессе'
        case 'Finished':
            return 'Завершён'
        case 'Autumn':
            return 'Осенний'
        case 'Spring':
            return 'Весенный'
        case 'Passed':
            return 'Пройдено'
        case 'Failed':
            return 'Зафейлено'
        default:
            return enumValue
    }
}