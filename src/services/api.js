// src/services/api.js
import axios from 'axios';

const BASE_URL = "http://localhost:8000/api"; // change to your server

export async function registerUser({ email, username, password }) {
    return await axios.post(`${BASE_URL}/register/`, {
        email,
        username,
        password
    });
}

export async function loginUser({ email, password }) {
    return await axios.post(`${BASE_URL}/login/`, {
        email,
        password
    });
}

export async function getProfile(token) {
    return await axios.get(`${BASE_URL}/me/`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}
