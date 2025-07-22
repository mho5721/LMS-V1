import { useAuthStore } from "../store/auth";
import axios from "./axios";
import jwt_decode from "jwt-decode";
import Cookie from "js-cookie";
import Swal from "sweetalert2";

export const login = async (email, password) => {
    try {
        const { data, status } = await axios.post(`user/token/`, {
            email,
            password,
        });

        if (status === 200) {
            setAuthUser(data.access, data.refresh);
        }

        return { data, error: null };
    } catch (error) {
        const errorMessage = error.response?.data?.detail || "Something went wrong";
        console.error("Login error:", errorMessage);
        return { data: null, error: errorMessage };
    }
};


export const register = async (full_name, email, password, password2) => {
    try {
        const { data } = await axios.post(`user/register/`, {
            full_name,
            email,
            password,
            password2,
        });

        await login(email, password);
        return { data, error: null };
    } catch (error) {
        return {
            data: null,
            error: `${error.response.data.full_name} - ${error.response.data.email}` || "Something went wrong",
        };
    }
};


export const logout = () => {
    Cookie.remove("access_token");
    Cookie.remove("refresh_token");
    useAuthStore.getState().setUser(null);
};


export const setUser = async () => {
    const access_token = Cookie.get("access_token");
    const refresh_token = Cookie.get("refresh_token");

    if (!access_token || !refresh_token) {
        console.log("Tokens do not exist");
        return;
    }

    if (isAccessTokenExpired(access_token)) {
        const response = await getRefreshToken(refresh_token); // Properly awaited
        setAuthUser(response.data.access, response.data.refresh); // Corrected access of token data
    } else {
        setAuthUser(access_token, refresh_token);
    }
};


export const setAuthUser = (access_token, refresh_token) => {
    if (!access_token || !refresh_token) {
        console.error("Missing tokens, cannot set user.");
        return;
    }

    Cookie.set("access_token", access_token, { expires: 1, secure: true });
    Cookie.set("refresh_token", refresh_token, { expires: 7, secure: true });
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);

    try {
        const user = jwt_decode(access_token);
        if (user) {
            useAuthStore.getState().setUser(user);
            localStorage.setItem("user_id", user.user_id);
        }
    } catch (error) {
        console.error("Failed to decode access token:", error);
        logout(); // logout if decoding failed
    }

    useAuthStore.getState().setLoading(false);
};


export const getRefreshToken = async () => {
    try {
        const refresh_token = Cookie.get("refresh_token");
        const response = await axios.post(`user/token/refresh/`, {
            refresh: refresh_token,
        });
        return response;
    } catch (error) {
        console.error("Failed to refresh token:", error);
        logout(); // Log the user out if refresh fails
        throw error;
    }
};


export const isAccessTokenExpired = (access_token) => {
    if (!access_token) {
        console.warn("Access token not found or empty.");
        return true;
    }
    try {
        const decodedToken = jwt_decode(access_token);
        return decodedToken.exp < Date.now() / 1000;
    } catch (error) {
        console.error("Error decoding token:", error);
        return true;
    }
};
