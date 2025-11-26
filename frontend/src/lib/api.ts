import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { AuthResponse, CreateRequestPayload, PurchaseRequest } from "../types";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("VITE_API_URL environment variable is not defined");
}

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `JWT ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    // Handle Unauthorized (401) responses
    if (error.response && error.response.status === 401) {
      const requestUrl = error.config?.url || "";

      const isLoginEndpoint = requestUrl.includes("/accounts/login/");
      const hasStoredUser = localStorage.getItem("user");

      // If login failed, just let the error propagate
      if (isLoginEndpoint) {
        return Promise.reject(error);
      }

      // If session expired (401 on protected route), redirect to login
      if (!hasStoredUser && window.location.pathname !== "/login") {
        console.warn("Session expired. Redirecting to login.");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username: string, password: string) =>
    api.post<AuthResponse>("/accounts/login/", { username, password }),
};

export const requestsAPI = {
  // GET /requests/ - Interceptor automatically adds the JWT token
  list: () => api.get<PurchaseRequest[]>("/requests/"),

  get: (id: string) => api.get<PurchaseRequest>(`/requests/${id}/`),

  create: (data: CreateRequestPayload & { status?: string }) => {
    const formData = new FormData();

    // Required Fields
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("amount", data.amount);

    // Optional: Status
    if (data.status) {
      formData.append("status", data.status);
    } else {
      formData.append("status", "pending");
    }

    // Optional Files
    if (data.proforma_file) {
      formData.append("proforma", data.proforma_file);
    }

    return api.post<PurchaseRequest>("/requests/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: (id: string, data: Partial<CreateRequestPayload>) => {
    const formData = new FormData();

    if (data.title) formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    if (data.amount) formData.append("amount", data.amount);
    if (data.proforma_file) {
      formData.append("proforma", data.proforma_file);
    }

    return api.put<PurchaseRequest>(`/requests/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  approve: (id: string) =>
    api.patch<PurchaseRequest>(`/requests/${id}/approve/`),

  reject: (id: string) => api.patch<PurchaseRequest>(`/requests/${id}/reject/`),

  uploadReceipt: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("receipt", file);
    return api.post<PurchaseRequest>(
      `/requests/${id}/submit-receipt/`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  },
};

export default api;
