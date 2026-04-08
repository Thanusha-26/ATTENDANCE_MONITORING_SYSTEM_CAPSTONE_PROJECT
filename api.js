// frontend/src/api.js
const BASE_URL = "http://localhost:5000/api";

// LOGIN
export const login = async (role, id, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, id, password }),
  });
  
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.message || "Login failed");
  }

  const data = await res.json(); 
  // data: { token, user: {...} }
  return data;
};

// FETCH ALL (faculties, students, courses, attendance, assignments)
export const fetchAll = async () => {
  const res = await fetch(`${BASE_URL}/all`);
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
};

// ASSIGNMENTS CRUD

// Get all assignments
export const getAssignments = async () => {
  const res = await fetch(`${BASE_URL}/assignments`);
  if (!res.ok) throw new Error("Failed to fetch assignments");
  return res.json();
};

// Create new assignment
export const createAssignment = async (assignment) => {
  const res = await fetch(`${BASE_URL}/assignments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(assignment),
  });
  if (!res.ok) throw new Error("Failed to create assignment");
  return res.json();
};

// Update assignment
export const updateAssignment = async (id, updates) => {
  const res = await fetch(`${BASE_URL}/assignments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update assignment");
  return res.json();
};

// Delete assignment
export const deleteAssignment = async (id) => {
  const res = await fetch(`${BASE_URL}/assignments/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete assignment");
  return res.json();
};