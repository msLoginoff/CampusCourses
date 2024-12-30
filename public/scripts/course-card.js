import {fetchCourseDetails} from "./api/course.js";

export async function setupCourseCardPage(courseId) {
    const courseNameElement = document.getElementById(`course-name`)
    const courseStatusElement = document.getElementById(`course-status`)
    const startYearElement = document.getElementById(`start-year`)
    const semesterElement = document.getElementById(`semester`)
    const maximumStudentsElement = document.getElementById(`maximum-students-count`)
    const studentsEnrolledElement = document.getElementById(`students-enrolled-count`)
    const studentsInQueueElement = document.getElementById(`students-in-queue-count`)

    const courseDetails = await fetchCourseDetails(courseId)
    courseNameElement.innerHTML = courseDetails.CourseName;
}