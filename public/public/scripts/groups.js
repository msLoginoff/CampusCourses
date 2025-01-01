const apiBaseUrlC = "https://camp-courses.api.kreosoft.space/groups";
import {fetchRoles} from "./api/auth.js";
let createGroupModal, editGroupModal;
const roles = await fetchRoles();
const isAdmin = roles.isAdmin;

export async function setupGroupsPage() {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
        alert("Авторизация требуется для доступа к этой странице.");
        window.location.href = "/login";
        return;
    }

    const actionsHeader = document.getElementById("actionsHeader");

    if (isAdmin) {
        actionsHeader.style.visibility = "visible"; // Показываем текст
    } else {
        actionsHeader.style.visibility = "hidden"; // Скрываем текст, но оставляем границы
    }

    const createGroupBtn = document.getElementById("createGroupBtn");

    if (isAdmin) {
        createGroupBtn.style.display = "block";

        const createGroupModalElement = document.getElementById("createGroupModal");
        createGroupModal = new bootstrap.Modal(createGroupModalElement);

        createGroupBtn.addEventListener("click", () => createGroupModal.show());

        const createGroupForm = document.getElementById("createGroupForm");
        createGroupForm.addEventListener("submit", handleCreateGroup);

        const editGroupModalElement = document.getElementById("editGroupModal");
        editGroupModal = new bootstrap.Modal(editGroupModalElement);

        const editGroupForm = document.getElementById("editGroupForm");
        editGroupForm.addEventListener("submit", handleEditGroup);
    }

    await refreshGroups();
}


async function refreshGroups() {
    try {
        const response = await fetch(apiBaseUrlC, {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        });
        if (!response.ok) throw new Error("Ошибка при загрузке групп");
        const groups = await response.json();
        renderGroupsTable(groups, isAdmin);
    } catch (error) {
        console.error("Ошибка при обновлении списка групп:", error);
    }
}


function renderGroupsTable(groups, isAdmin) {
    const tableBody = document.getElementById("groupsTableBody");
    const actionsHeader = document.getElementById("actionsHeader");
    tableBody.innerHTML = "";

    if (isAdmin) {
        actionsHeader.style.display = "table-cell";
    } else {
        actionsHeader.style.display = "none";
    }

    groups.forEach((group) => {
        const row = document.createElement("tr");

        row.innerHTML = isAdmin
            ? `
                <td>
                    <a href="/groups/${group.id}" class="text-decoration-underline text-primary group-link">${group.name}</a>
                </td>
                <td class="text-end">
                    <button class="btn btn-warning btn-sm edit-group-btn" data-id="${group.id}" data-name="${group.name}">Редактировать</button>
                    <button class="btn btn-danger btn-sm delete-group-btn" data-id="${group.id}">Удалить</button>
                </td>
            `
            : `
                <td>
                    <a href="/groups/${group.id}" class="text-decoration-underline text-primary">${group.name}</a>
                </td>
            `;

        tableBody.appendChild(row);
    });

    if (isAdmin) {
        attachEventListeners();
    }
}

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
