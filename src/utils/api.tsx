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
})

API.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = localStorage.getItem("refresh");

        if (refreshToken) {
            try {
                const res = await axios.post("/api/token/refresh/", {
                    refresh: refreshToken,
                })

                const newAccessToken = res.data.access;
                localStorage.setItem("access", newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return API(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                window.location.href = "/login";
            }
        }

    }
    return Promise.reject(error);
})

export default API;