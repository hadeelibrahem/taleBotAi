// src/api/settingsApi.js
import axios from "axios";

const API = "http://localhost:8000/api";

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    Accept: "application/json",
  },
});

export const getSettings = () =>
  axios.get(`${API}/settings`, authHeader());

export const updateAccount = (data) =>
  axios.put(`${API}/settings/account`, data, authHeader());

export const updatePreferences = (data) =>
  axios.put(`${API}/settings/preferences`, data, authHeader());

export const addChild = (data) =>
  axios.post(`${API}/settings/children`, data, authHeader());

export const updateChild = (id, data) =>
  axios.put(`${API}/settings/children/${id}`, data, authHeader());

export const deleteChild = (id) =>
  axios.delete(`${API}/settings/children/${id}`, authHeader());

export const deleteAccount = () =>
  axios.delete(`${API}/settings/account/delete`, authHeader());