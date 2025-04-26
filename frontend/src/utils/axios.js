import axios from "axios";
import { setAuthUser, getRefreshToken, isAccessTokenExpired } from "./auth";
import Cookie from "js-cookie";

// Create an Axios instance with default settings
const apiInstance = axios.create({
    baseURL: "http://127.0.0.1:8000/api/v1/",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor for adding authentication token if available
apiInstance.interceptors.request.use(
    async (config) => {
        const accessToken = Cookie.get("access_token");

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        if (isAccessTokenExpired(accessToken)) {
            const refreshToken = Cookie.get("refresh_token");
            if (refreshToken) {
                try {
                    const response = await getRefreshToken(refreshToken);
                    setAuthUser(response.data.access, response.data.refresh);
                    config.headers.Authorization = `Bearer ${response.data.access}`;
                } catch (error) {
                    console.error("Refresh token failed:", error);
                    logout();  // Clear cookies
                    window.location.href = "/login/";  // Redirect user
                    throw error;  // <<<<<<<<<< MUST THROW or infinite pending
                }
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for handling errors
apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle specific error cases if needed
        if (error.response && error.response.status === 401) {
            // Handle unauthorized errors (e.g., redirect to login)
            console.error("Unauthorized access - you may need to log in:", error);
        }

        return Promise.reject(error);
    }
);

export default apiInstance;
