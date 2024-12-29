import {handleRoute} from "./router.js";

export async function setupLogoutPage() {
    localStorage.removeItem("authToken");
    await handleRoute("/login");
}