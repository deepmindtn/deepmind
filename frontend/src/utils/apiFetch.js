export async function apiFetch(url, options = {}) {
    const access = localStorage.getItem("access");
  
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: access ? `Bearer ${access}` : undefined,
        "Content-Type": "application/json",
      },
    });
  
    // 🔥 TOKEN EXPIRED OR INVALID
    if (response.status === 401) {
      logout();
      throw new Error("Session expired");
    }
  
    return response;
  }
  
  export function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("authenticated");
    localStorage.removeItem("me");
  
    // Hard redirect = state reset (important)
    window.location.href = "/login";
  }
  