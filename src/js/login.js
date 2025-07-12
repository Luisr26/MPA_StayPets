import { apiUsers, guardianUserAuth, userAuth } from './main.js'
import { showValidationError } from './utils/sweetalert.js'
import { initLoadingScreen } from './utils/loading.js'

// Initialize loading screen
initLoadingScreen();

const $urlRegister = document.getElementById('login-go-register');
const $emailUser = document.getElementById('login-username');
const $passwordUser = document.getElementById('login-password');
const $btnEntry = document.getElementById('btn-login');

document.addEventListener('DOMContentLoaded', (e) => {
    // Verify authentication when loading the page
    guardianUserAuth();

    $btnEntry.addEventListener('click', (e) => {
        e.preventDefault()
        const email = $emailUser.value.trim();
        const password = $passwordUser.value.trim();

        // Validations
        if (!email) {
            showValidationError("Please enter your email.");
            $emailUser.focus();
            return;
        }

        if (!password) {
            showValidationError("Please enter your password.");
            $passwordUser.focus();
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showValidationError("Please enter a valid email.");
            $emailUser.focus();
            return;
        }

        userAuth(apiUsers, email, password);
    })

    $urlRegister.addEventListener('click', (e) => {
        // Allow the link to work naturally
        // The link already has href="register.html"
    })
})