import Swal from 'sweetalert2';

// Global SweetAlert2 configuration
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
});

// Function to show success notifications
export function showSuccess(message) {
  Toast.fire({
    icon: 'success',
    title: message,
    background: '#f0f9ff',
    color: '#0f172a'
  });
}

// Function to show error notifications
export function showError(message) {
  Toast.fire({
    icon: 'error',
    title: message,
    background: '#fef2f2',
    color: '#991b1b'
  });
}

// Function to show information notifications
export function showInfo(message) {
  Toast.fire({
    icon: 'info',
    title: message,
    background: '#f0f9ff',
    color: '#0f172a'
  });
}

// Function to show warning notifications
export function showWarning(message) {
  Toast.fire({
    icon: 'warning',
    title: message,
    background: '#fffbeb',
    color: '#92400e'
  });
}

// Function for confirmations
export function showConfirm(title, text, confirmButtonText = 'Yes, continue') {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#6c63ff',
    cancelButtonColor: '#d33',
    confirmButtonText: confirmButtonText,
    cancelButtonText: 'Cancel',
    reverseButtons: true
  });
}

// Function for delete confirmations
export function showDeleteConfirm(itemName) {
  return Swal.fire({
    title: 'Are you sure?',
    text: `This action will permanently delete ${itemName}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete',
    cancelButtonText: 'Cancel',
    reverseButtons: true
  });
}

// Function to show validation errors
export function showValidationError(message) {
  Swal.fire({
    icon: 'error',
    title: 'Validation Error',
    text: message,
    confirmButtonColor: '#6c63ff',
    confirmButtonText: 'Got it'
  });
}

// Function to show authentication errors
export function showAuthError(message) {
  Swal.fire({
    icon: 'error',
    title: 'Authentication Error',
    text: message,
    confirmButtonColor: '#6c63ff',
    confirmButtonText: 'Got it'
  });
}

// Function to show custom forms
export function showCustomForm(title, html, confirmButtonText = 'Save') {
  return Swal.fire({
    title: title,
    html: html,
    showCancelButton: true,
    confirmButtonColor: '#6c63ff',
    cancelButtonColor: '#d33',
    confirmButtonText: confirmButtonText,
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    focusConfirm: false,
    preConfirm: () => {
      // You can add validation logic here if needed
      return true;
    }
  });
}

// Function to show loading
export function showLoading(title = 'Loading...') {
  Swal.fire({
    title: title,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
}

// Function to close loading
export function closeLoading() {
  Swal.close();
} 