import api from "./api";

export const addPayment = (data) => api.post("/payments/add", data);

export const getPayments = () => api.get("/payments/all");
