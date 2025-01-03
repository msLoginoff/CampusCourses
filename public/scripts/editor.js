document.addEventListener("DOMContentLoaded", () => {
    // Отслеживание события открытия модального окна
    const modal = document.getElementById("change-course-details-modal");

    modal.addEventListener("shown.bs.modal", () => {
        const requirementsEditor = document.getElementById("requirements-text");
        const annotationsEditor = document.getElementById("annotations-text");

        // Проверяем, если редактор еще не инициализирован
        if (!requirementsEditor.summernoteInstance) {
            requirementsEditor.summernoteInstance = new Summernote(requirementsEditor, {
                placeholder: "Введите требования",
                height: 200, // Высота редактора
                toolbar: [
                    ["style", ["style"]],
                    ["font", ["bold", "italic", "underline", "clear"]],
                    ["color", ["color"]],
                    ["para", ["ul", "ol", "paragraph"]],
                    ["table", ["table"]],
                    ["view", ["fullscreen", "codeview", "help"]],
                ],
            });
        }

        if (!annotationsEditor.summernoteInstance) {
            annotationsEditor.summernoteInstance = new Summernote(annotationsEditor, {
                placeholder: "Введите аннотацию",
                height: 200,
                toolbar: [
                    ["style", ["style"]],
                    ["font", ["bold", "italic", "underline", "clear"]],
                    ["color", ["color"]],
                    ["para", ["ul", "ol", "paragraph"]],
                    ["table", ["table"]],
                    ["view", ["fullscreen", "codeview", "help"]],
                ],
            });
        }
    });

    // Кнопка "Сохранить"
    document.querySelector(".save-modal").addEventListener("click", () => {
        const requirementsEditor = document.getElementById("requirements-text");
        const annotationsEditor = document.getElementById("annotations-text");

        const requirementsHTML = requirementsEditor.value; // Получение HTML из Summernote
        const annotationsHTML = annotationsEditor.value;

        // Отправка данных на сервер
        fetch("/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                requirements: requirementsHTML,
                annotations: annotationsHTML,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("Сохранено успешно:", data);
            })
            .catch((error) => {
                console.error("Ошибка сохранения:", error);
            });
    });
});
