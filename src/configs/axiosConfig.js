import axios from "axios";
import { getToken } from "services/auth";

// export const BASE_URL = "http://192.168.0.109:1234/";
export const BASE_URL = "http://localhost:1234/";
export const API_BASE_URL = BASE_URL+"api/v1";

export const axiosRequest = axios.create({
    baseURL: API_BASE_URL
});


export const privateAxiosRequest = axios.create({})


// Interceptor to add Bearer token to each request
axiosRequest.interceptors.request.use(
    (config) => {
        const token = getToken();// Retrieve the token from storage or state
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

