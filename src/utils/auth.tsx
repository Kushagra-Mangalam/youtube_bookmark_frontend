import API from "./api";

export const loginUser = (data: any) => API.post("/auth/login/", data).then(res => res.data);
export const registerUser = (data: any) => API.post("/auth/register/", data).then(res => res.data);
