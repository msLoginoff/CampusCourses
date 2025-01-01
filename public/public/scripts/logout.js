import {handleRoute} from "./router.js";
import {logout} from "./api/auth.js";

export async function setupLogoutPage() {
    logout()
    await handleRoute("/login");
}