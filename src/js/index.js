import { guardianUserAuth } from './main.js';
import { initLoadingScreen } from './utils/loading.js';

// Initialize loading screen
initLoadingScreen();

// Execute authentication verification when page loads
document.addEventListener('DOMContentLoaded', function() {
  guardianUserAuth();
  
  // Configure the "Start now" button
  const startButton = document.getElementById('go-to-register');
  if (startButton) {
    startButton.addEventListener('click', function() {
      window.location.href = './src/views/register.html';
    });
  }
}); 