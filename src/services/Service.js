// Constants
export const CAFETERIA_LOCATIONS = [
  "Female Launch System (Abay)",
  "Male Launch System (Tana)",
  "Megenagna (Guna)",
  "Megezez Restaurant",
  "Marcan Cafeteria"
];

export const USER_STORAGE_KEY = "admin_user_session";

// User management functions
export const getUsersFromStorage = () => {
  const users = localStorage.getItem("users");
  return users ? JSON.parse(users) : [];
};

export const saveUsersToStorage = (users) => {
  localStorage.setItem("users", JSON.stringify(users));
};

// Manager management functions
export const getManagersFromStorage = () => {
  const managers = localStorage.getItem("managers");
  return managers ? JSON.parse(managers) : [];
};

export const saveManagersToStorage = (managers) => {
  localStorage.setItem("managers", JSON.stringify(managers));
};

// Additional utility functions if needed
export const getCurrentUser = () => {
  const user = localStorage.getItem(USER_STORAGE_KEY);
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user) => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const clearCurrentUser = () => {
  localStorage.removeItem(USER_STORAGE_KEY);
};