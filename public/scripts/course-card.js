import {fetchCourseDetails} from "./api/course.js";

export async function setupCourseCardPage(params) {
    const courseId = params.id;
    const courseDetails = await fetchCourseDetails(courseId)

    document.getElementById(`name`).innerHTML = courseDetails['name']
    document.getElementById(`status`).innerHTML = courseDetails['status']
    document.getElementById(`start-year`).innerHTML = courseDetails['startYear']
    document.getElementById(`semester`).innerHTML = courseDetails['semester']
    document.getElementById(`maximum-students-count`).innerHTML = courseDetails['maximumStudentsCount']
    document.getElementById(`students-enrolled-count`).innerHTML = courseDetails['studentsEnrolledCount']
    document.getElementById(`students-in-queue-count`).innerHTML = courseDetails['studentsInQueueCount']


}