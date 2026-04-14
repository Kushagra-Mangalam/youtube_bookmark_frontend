import axios from "axios";

const API = axios.create({
    baseURL: '/api',
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("access");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

API.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = localStorage.getItem("refresh");

        if (refreshToken) {
            try {
                const res = await axios.post("/api/auth/token/refresh/", {
                    refresh: refreshToken,
                });

                const newAccessToken = res.data.access;
                localStorage.setItem("access", newAccessToken);

                // Save rotated refresh token if the backend returns one
                if (res.data.refresh) {
                    localStorage.setItem("refresh", res.data.refresh);
                }

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return API(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                localStorage.removeItem("kush_yt_auth");
                window.location.href = "/";
            }
        } else {
            // No refresh token at all — force re-login
            localStorage.removeItem("access");
            localStorage.removeItem("kush_yt_auth");
            window.location.href = "/";
        }
    }
    return Promise.reject(error);
});

export default API;