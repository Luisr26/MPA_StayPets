import { apiUsers, createUser, guardianUserAuth } from "./main";
import { showValidationError } from './utils/sweetalert.js';
import { initLoadingScreen } from './utils/loading.js';

// Initialize loading screen
initLoadingScreen();

document.addEventListener('DOMContentLoaded', (e) => {
    // Verify authentication when loading the page
    guardianUserAuth();
});

const regisForm = document.querySelector('#register-form');
const btnRegister = document.querySelector('.register-submit');

btnRegister.addEventListener('click', (e) => {
    e.preventDefault();

    const fullNameInput = document.querySelector('#register-name');
    const emailuserInput = document.querySelector('#register-email');
    const phoneUserInput = document.querySelector('#register-phone');
    const passwordUserInput = document.querySelector('#register-password');

    const nameUser = fullNameInput.value.trim();
    const emailUser = emailuserInput.value.trim();
    const phoneUser = phoneUserInput.value.trim();
    const passwordUser = passwordUserInput.value.trim();

    // Validations
    if (!nameUser) {
        showValidationError("Please enter your full name.");
        fullNameInput.focus();
        return;
    }

    if (!emailUser) {
        showValidationError("Please enter your email.");
        emailuserInput.focus();
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailUser)) {
        showValidationError("Please enter a valid email.");
        emailuserInput.focus();
        return;
    }

    if (!phoneUser) {
        showValidationError("Please enter your phone number.");
        phoneUserInput.focus();
        return;
    }

    if (!passwordUser) {
        showValidationError("Please enter a password.");
        passwordUserInput.focus();
        return;
    }

    // Validate password length
    if (passwordUser.length < 6) {
        showValidationError("Password must be at least 6 characters long.");
        passwordUserInput.focus();
        return;
    }

    const data = {
        name: nameUser,
        email: emailUser,
        phone: phoneUser,
        password: passwordUser
    }
    createUser(apiUsers, data)
})