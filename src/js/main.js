import axios from 'axios';
import { showError, showSuccess, showAuthError, showValidationError } from './utils/sweetalert.js';
import { showLoadingForTransition } from './utils/loading.js';

export const apiUsers = 'http://localhost:3001/users';
export const apiRoles = 'http://localhost:3001/roles';
export const apiPets = 'http://localhost:3001/pets';
export const apiStays = 'http://localhost:3001/stays';

export async function userAuth(url, mail, password) {
  try {
    const response = await axios.get(`${url}?email=${mail}`);
    const data = response.data;

    if (!data || data.length === 0) {
      showAuthError("User not found. Please verify your email.");
      return;
    }

    const user = data[0];
    console.log("User found:", user);

    // Verify that the password matches
    if (user.password !== password) {
      showAuthError("Incorrect password. Please try again.");
      return;
    }

    if (user.email === mail && user.roleId === 2) {
      localStorage.setItem("user", JSON.stringify(user));
      showSuccess("Welcome! Redirecting to dashboard...");
      setTimeout(() => {
        showLoadingForTransition("PetCare Center", "Loading your dashboard...");
        window.location.href = '/src/views/dashboard.html';
      }, 1500);
    } else if (user.email === mail && user.roleId === 1) {
      localStorage.setItem("user", JSON.stringify(user));
      showSuccess("Welcome worker! Redirecting to panel...");
      setTimeout(() => {
        showLoadingForTransition("PetCare Center", "Loading worker panel...");
        window.location.href = '/src/views/dashboardW.html';
      }, 1500);
    } else {
      showAuthError("Role not recognized.");
    }

  } catch (error) {
    console.error("Error authenticating user:", error.message);
    showError("An error occurred during authentication.");
  }
}

export async function createUser(url, datos) {
  try {
    // Assign customer role by default
    const userData = {
      ...datos,
      roleId: 2 // customer
    };
    
    const response = await axios.post(url, userData);
    if (response.status === 201) {
      localStorage.setItem("user", JSON.stringify(response.data));
      showSuccess("User created successfully! Redirecting to dashboard...");
      setTimeout(() => {
        showLoadingForTransition("PetCare Center", "Setting up your account...");
        window.location.href = '/src/views/dashboard.html';
      }, 1500);
    } else {
      showError("Oops! An error occurred while creating the user.");
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
    showError("Error creating user. Please verify that the email is not already registered.");
  }
}

export function guardianUserAuth() {
  const userData = localStorage.getItem("user");

  const currentPage = window.location.pathname;

  if (userData) {
    const user = JSON.parse(userData);
    if (user.roleId === 2 && !currentPage.includes("dashboard.html")) {
      window.location.href = "/src/views/dashboard.html";
    } else if (user.roleId === 1 && !currentPage.includes("dashboardW.html")) {
      window.location.href = "/src/views/dashboardW.html";
    }
  }
}



