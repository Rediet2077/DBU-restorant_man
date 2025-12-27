// storageService.js

// Key for current logged-in user
export const USER_STORAGE_KEY = "currentUser";

// ----- Food -----
export const getFoodFromStorage = () => {
  const data = localStorage.getItem("foods");
  return data ? JSON.parse(data) : [];
};

export const saveFoodToStorage = (foods) => {
  localStorage.setItem("foods", JSON.stringify(foods));
};

// ----- Workers -----
export const getWorkersFromStorage = () => {
  const data = localStorage.getItem("workers");
  return data ? JSON.parse(data) : [];
};

export const saveWorkersToStorage = (workers) => {
  localStorage.setItem("workers", JSON.stringify(workers));
};

// ----- Orders -----
export const getOrdersFromStorage = () => {
  const data = localStorage.getItem("orders");
  return data ? JSON.parse(data) : [];
};

export const saveOrdersToStorage = (orders) => {
  localStorage.setItem("orders", JSON.stringify(orders));
};

// ----- Contracts (for Service.jsx) -----
export const getContractsFromStorage = () => {
  const data = localStorage.getItem("contracts");
  return data ? JSON.parse(data) : [];
};

export const saveContractsToStorage = (contracts) => {
  localStorage.setItem("contracts", JSON.stringify(contracts));
};

// ----- Feedbacks (for Service.jsx) -----
export const getFeedbacksFromStorage = () => {
  const data = localStorage.getItem("feedbacks");
  return data ? JSON.parse(data) : [];
};

export const saveFeedbacksToStorage = (feedbacks) => {
  localStorage.setItem("feedbacks", JSON.stringify(feedbacks));
};
