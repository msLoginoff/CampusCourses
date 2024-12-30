const apiBaseUrlC = "https://camp-courses.api.kreosoft.space/groups";

// Объявляем модальные окна и элементы
let createGroupModal, editGroupModal;

// Основная функция отображения страницы
export async function setupGroupsPage() {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
        alert("Авторизация требуется для доступа к этой странице.");
        window.location.href = "/login.html";
        return;
    }

    // Инициализация модальных окон
    const createGroupModalElement = document.getElementById("createGroupModal");
    const editGroupModalElement = document.getElementById("editGroupModal");
    createGroupModal = new bootstrap.Modal(createGroupModalElement);
    editGroupModal = new bootstrap.Modal(editGroupModalElement);

    // Настраиваем кнопку "Создать группу"
    const createGroupBtn = document.getElementById("createGroupBtn");
    createGroupBtn.addEventListener("click", () => createGroupModal.show());

    // Настраиваем форму создания группы
    const createGroupForm = document.getElementById("createGroupForm");
    createGroupForm.addEventListener("submit", handleCreateGroup);

    // Настраиваем форму редактирования группы
    const editGroupForm = document.getElementById("editGroupForm");
    editGroupForm.addEventListener("submit", handleEditGroup);

    // Загрузка и отображение групп
    await refreshGroups();
}

// Функция загрузки списка групп
async function refreshGroups() {
    try {
        const response = await fetch(apiBaseUrlC, {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        });
        if (!response.ok) throw new Error("Ошибка при загрузке групп");
        const groups = await response.json();
        renderGroupsTable(groups);
    } catch (error) {
        console.error("Ошибка при обновлении списка групп:", error);
    }
}

// Функция рендера таблицы групп
function renderGroupsTable(groups) {
    const tableBody = document.getElementById("groupsTableBody");
    tableBody.innerHTML = "";

    groups.forEach((group) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${group.name}</td>
            <td class="text-end">
                <button class="btn btn-warning btn-sm edit-group-btn" data-id="${group.id}" data-name="${group.name}">Редактировать</button>
                <button class="btn btn-danger btn-sm delete-group-btn" data-id="${group.id}">Удалить</button>
            </td>`;
        tableBody.appendChild(row);
    });

    attachEventListeners();
}

// Настройка событий для кнопок "Редактировать" и "Удалить"
function attachEventListeners() {
    const editButtons = document.querySelectorAll(".edit-group-btn");
    editButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const groupId = button.getAttribute("data-id");
            const groupName = button.getAttribute("data-name");
            document.getElementById("editGroupId").value = groupId;
            document.getElementById("editGroupName").value = groupName;
            editGroupModal.show();
        });
    });

    const deleteButtons = document.querySelectorAll(".delete-group-btn");
    deleteButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            const groupId = button.getAttribute("data-id");
            await deleteGroup(groupId);
        });
    });
}

// Обработчик создания группы
async function handleCreateGroup(event) {
    event.preventDefault();
    const groupName = document.getElementById("newGroupName").value;
    try {
        const response = await fetch(apiBaseUrlC, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: JSON.stringify({ name: groupName }),
        });
        if (!response.ok) throw new Error("Ошибка при создании группы");
        alert("Группа успешно создана");
        createGroupModal.hide();
        await refreshGroups();
    } catch (error) {
        console.error("Ошибка при создании группы:", error);
    }
}

// Обработчик редактирования группы
async function handleEditGroup(event) {
    event.preventDefault();
    const groupId = document.getElementById("editGroupId").value;
    const groupName = document.getElementById("editGroupName").value;

    try {
        const response = await fetch(`${apiBaseUrlC}/${groupId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: JSON.stringify({ name: groupName }),
        });
        if (!response.ok) throw new Error("Ошибка при редактировании группы");
        alert("Группа успешно обновлена");
        editGroupModal.hide();
        await refreshGroups();
    } catch (error) {
        console.error("Ошибка при редактировании группы:", error);
    }
}

// Удаление группы
async function deleteGroup(groupId) {
    if (confirm("Вы уверены, что хотите удалить эту группу?")) {
        try {
            const response = await fetch(`${apiBaseUrlC}/${groupId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
            });
            if (!response.ok) throw new Error("Ошибка при удалении группы");
            alert("Группа успешно удалена");
            await refreshGroups();
        } catch (error) {
            console.error("Ошибка при удалении группы:", error);
        }
    }
}