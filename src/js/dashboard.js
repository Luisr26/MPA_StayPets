// PetCare Dashboard User JavaScript
import { guardianUserAuth, apiPets, apiStays } from './main.js';
import axios from 'axios';
import { showSuccess, showError, showDeleteConfirm, showValidationError, showConfirm } from './utils/sweetalert.js';
import { initLoadingScreen, showLoadingForTransition } from './utils/loading.js';

// Inicializar pantalla de carga
initLoadingScreen();

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación al cargar la página
    guardianUserAuth();
    
    const $btnLogOut = document.getElementById('logout-btn');
    $btnLogOut.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem("user")
        window.location.href = '/'
    })

    // Array para almacenar las mascotas del usuario
    let pets = [];
    let stays = [];
    let currentUser = null;

    // Obtener usuario actual
    function getCurrentUser() {
        const userData = localStorage.getItem("user");
        if (userData) {
            currentUser = JSON.parse(userData);
            return currentUser;
        }
        return null;
    }

    // Verificar si una estancia está activa
    function isStayActive(stay) {
        if (!stay || !stay.startDate || !stay.endDate) {
            console.log('❌ Estancia inválida:', stay);
            return false;
        }
        
        const today = new Date();
        const startDate = new Date(stay.startDate);
        const endDate = new Date(stay.endDate);
        
        // Comparar solo las fechas (sin horas)
        const todayStr = today.toISOString().split('T')[0];
        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];
        
        const isActive = todayStr >= startStr && todayStr <= endStr;
        
        console.log(`🔍 Verificando estancia ${stay.id} para mascota ${stay.petId}:`);
        console.log(`   - Hoy: ${todayStr}`);
        console.log(`   - Inicio: ${startStr}`);
        console.log(`   - Fin: ${endStr}`);
        console.log(`   - ¿Activa?: ${isActive ? '✅ SÍ' : '❌ NO'}`);
        
        return isActive;
    }

    // Recargar estancias
    async function reloadStays() {
        try {
            const user = getCurrentUser();
            if (!user) return;
            
            console.log('🔄 Recargando estancias...');
            
            // Recargar mascotas y estancias
            const [petsResponse, staysResponse] = await Promise.all([
                axios.get(`${apiPets}?userId=${user.id}`),
                axios.get(apiStays)
            ]);
            
            pets = petsResponse.data || [];
            const allStays = staysResponse.data || [];
            
            // Filtrar estancias solo para las mascotas del usuario
            const userPetIds = pets.map(pet => pet.id);
            stays = allStays.filter(stay => userPetIds.includes(stay.petId));
            
            console.log('✅ Estancias recargadas:', stays);
            console.log('✅ Mascotas del usuario:', pets);
            console.log('✅ IDs de mascotas del usuario:', userPetIds);
            
            // Renderizar inmediatamente después de recargar
            renderPets();
        } catch (error) {
            console.error('❌ Error al recargar estancias:', error);
        }
    }

    // Cargar mascotas del usuario desde la API
    async function loadUserPets() {
        const user = getCurrentUser();
        if (!user) {
            console.error('Usuario no encontrado');
            return;
        }

        try {
            console.log('🔄 Cargando mascotas del usuario...');
            
            const [petsResponse, staysResponse] = await Promise.all([
                axios.get(`${apiPets}?userId=${user.id}`),
                axios.get(apiStays)
            ]);
            
            pets = petsResponse.data || [];
            const allStays = staysResponse.data || [];
            
            // Filtrar estancias solo para las mascotas del usuario
            const userPetIds = pets.map(pet => pet.id);
            stays = allStays.filter(stay => userPetIds.includes(stay.petId));
            
            console.log('✅ Mascotas cargadas:', pets);
            console.log('✅ Estancias filtradas:', stays);
            
            renderPets();
        } catch (error) {
            console.error('❌ Error al cargar mascotas:', error);
            showError('Error al cargar mascotas');
            pets = [];
            stays = [];
            renderPets();
        }
    }

    // Variables para el modal
    let isEditing = false;
    let currentPetId = null;
    let nextId = 4;

    // Elementos del DOM
    const addPetBtn = document.getElementById('add-pet-btn');
    const refreshStaysBtn = document.getElementById('refresh-stays-btn');
    const debugBtn = document.getElementById('debug-btn');

    const modal = document.getElementById('pet-form-modal');
    const petForm = document.getElementById('pet-form');
    const cancelBtns = document.querySelectorAll('#cancel-pet-form');
    const petsContainer = document.querySelector('.pets-container');
    const logoutBtn = document.getElementById('logout-btn');
    const modalTitle = document.querySelector('.modal-header h3');

    // Campos del formulario
    const petNameInput = document.getElementById('pet-name');
    const petTypeInput = document.getElementById('pet-type');
    const petAgeInput = document.getElementById('pet-age');
    const petImageInput = document.getElementById('pet-image');

    // Inicializar la aplicación
    init();

    function init() {
        loadUserPets(); // Cargar mascotas del usuario
        bindEvents();
        
        // Actualizar estancias automáticamente cada 30 segundos
        setInterval(async () => {
            await reloadStays();
            renderPets();
        }, 30000);
    }

    function bindEvents() {
        // Evento para abrir modal de agregar mascota
        addPetBtn.addEventListener('click', openAddPetModal);

        // Evento para refrescar estancias
        if (refreshStaysBtn) {
            refreshStaysBtn.addEventListener('click', async () => {
                await reloadStays();
                renderPets();
                showSuccess('Estancias actualizadas');
            });
        }

        // Evento para debug de estancias
        if (debugBtn) {
            debugBtn.addEventListener('click', async () => {
                console.log('=== DEBUG ESTANCIAS ===');
                console.log('Usuario actual:', getCurrentUser());
                console.log('Mascotas actuales:', pets);
                console.log('Estancias actuales:', stays);
                
                // Verificar cada estancia individualmente
                stays.forEach(stay => {
                    console.log(`\n--- Estancia ${stay.id} ---`);
                    console.log('Datos:', stay);
                    console.log('¿Está activa?:', isStayActive(stay));
                });
                
                await reloadStays();
                console.log('\nDespués de recargar:');
                console.log('Mascotas:', pets);
                console.log('Estancias:', stays);
                renderPets();
                showInfo('Debug completado - Revisa la consola');
            });
        }



        // Eventos para cerrar modal
        cancelBtns.forEach(btn => {
            btn.addEventListener('click', closeModal);
        });

        // Cerrar modal al hacer clic fuera
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Evento para enviar formulario
        petForm.addEventListener('submit', handleFormSubmit);

        // Evento para cerrar sesión
        logoutBtn.addEventListener('click', handleLogout);

        // Tecla ESC para cerrar modal
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                closeModal();
            }
        });
    }

    function renderPets() {
        petsContainer.innerHTML = '';
        
        if (pets.length === 0) {
            petsContainer.innerHTML = `
                <div class="no-pets-message">
                    <p>You don't have any pets registered yet.</p>
                    <p>Add your first pet!</p>
                </div>
            `;
            return;
        }

        pets.forEach(pet => {
            const petCard = createPetCard(pet);
            petsContainer.appendChild(petCard);
        });
    }

    function createPetCard(pet) {
        // Find all stays for this pet
        const petStays = stays.filter(stay => stay.petId === pet.id);
        console.log(`Pet ${pet.name} (ID: ${pet.id}) has ${petStays.length} stays:`, petStays);
        
        // Check if any stay is active
        let isActive = false;
        let activeStay = null;
        
        for (const stay of petStays) {
            if (isStayActive(stay)) {
                isActive = true;
                activeStay = stay;
                break;
            }
        }
        
        console.log(`Status of ${pet.name}:`, isActive ? 'ACTIVE' : 'INACTIVE');
        
        const card = document.createElement('div');
        card.className = 'pet-card';
        card.innerHTML = `
            <div class="pet-image-container">
                <img src="${pet.image}" alt="${pet.name}" class="pet-image" 
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaW4gSW1hZ2VuPC90ZXh0Pjwvc3ZnPg=='">
            </div>
            <div class="pet-info">
                <h3 class="pet-name">${pet.name}</h3>
                <div class="pet-details">
                    <p class="pet-age">
                        <span class="detail-label">Age:</span> ${pet.age} year${pet.age !== 1 ? 's' : ''}
                    </p>
                    <p class="pet-breed">
                        <span class="detail-label">Breed:</span> ${pet.breed}
                    </p>
                </div>
                <div class="stay-status">
                    <span class="stay-badge ${isActive ? 'active' : 'inactive'}">
                        ${isActive ? 'Active Stay' : 'No Stay'}
                    </span>
                    ${activeStay ? `
                        <p class="stay-dates">
                            ${new Date(activeStay.startDate).toLocaleDateString()} - ${new Date(activeStay.endDate).toLocaleDateString()}
                        </p>
                    ` : ''}
                </div>
            </div>
            <div class="pet-actions">
                <button class="edit-btn" data-pet-id="${pet.id}">
                    <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                    Edit
                </button>
                <button class="delete-btn" data-pet-id="${pet.id}" ${isActive ? 'disabled' : ''}>
                    <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                    ${isActive ? 'Cannot Delete' : 'Delete'}
                </button>
            </div>
        `;
        
        // Add event listeners directly
        const editBtn = card.querySelector('.edit-btn');
        const deleteBtn = card.querySelector('.delete-btn');
        
        editBtn.addEventListener('click', () => handleEditPet(pet.id));
        deleteBtn.addEventListener('click', () => handleDeletePet(pet.id));
        
        return card;
    }

    function openAddPetModal() {
        isEditing = false;
        currentPetId = null;
        modalTitle.textContent = 'Add New Pet';
        clearForm();
        showModal();
    }

    function showModal() {
        modal.classList.remove('hidden');
        petNameInput.focus();
    }

    function closeModal() {
        modal.classList.add('hidden');
        clearForm();
        isEditing = false;
        currentPetId = null;
    }

    function clearForm() {
        petForm.reset();
        // Clear validation errors if any
        const inputs = petForm.querySelectorAll('input');
        inputs.forEach(input => {
            input.classList.remove('error');
        });
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = getFormData();
        
        if (!validateForm(formData)) {
            return;
        }

        if (isEditing) {
            await updatePet(currentPetId, formData);
        } else {
            await addPet(formData);
        }

        closeModal();
    }

    function getFormData() {
        return {
            name: petNameInput.value.trim(),
            breed: petTypeInput.value.trim(),
            age: parseInt(petAgeInput.value),
            image: petImageInput.value.trim() || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaW4gSW1hZ2VuPC90ZXh0Pjwvc3ZnPg=='
        };
    }

    function validateForm(data) {
        let isValid = true;
        
        // Validate name
        if (!data.name) {
            showFieldError(petNameInput, 'Name is required');
            isValid = false;
        } else if (data.name.length < 2) {
            showFieldError(petNameInput, 'Name must be at least 2 characters long');
            isValid = false;
        }

        // Validate breed
        if (!data.breed) {
            showFieldError(petTypeInput, 'Breed is required');
            isValid = false;
        }

        // Validate age
        if (isNaN(data.age) || data.age < 0 || data.age > 30) {
            showFieldError(petAgeInput, 'Enter a valid age (0-30 years)');
            isValid = false;
        }

        // Validate image URL if provided
        if (data.image && data.image !== 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaW4gSW1hZ2VuPC90ZXh0Pjwvc3ZnPg==') {
            if (!isValidURL(data.image)) {
                showFieldError(petImageInput, 'Enter a valid URL');
                isValid = false;
            }
        }

        return isValid;
    }

    function showFieldError(input, message) {
        input.classList.add('error');
        // Create or update error message
        let errorMsg = input.parentNode.querySelector('.error-message');
        if (!errorMsg) {
            errorMsg = document.createElement('span');
            errorMsg.className = 'error-message';
            input.parentNode.appendChild(errorMsg);
        }
        errorMsg.textContent = message;
        
        // Remove error after user starts typing
        input.addEventListener('input', function() {
            input.classList.remove('error');
            if (errorMsg) {
                errorMsg.remove();
            }
        }, { once: true });
    }

    function isValidURL(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    async function addPet(petData) {
        const user = getCurrentUser();
        if (!user) {
            showError('Error: Usuario no encontrado');
            return;
        }

        try {
            const newPet = {
                ...petData,
                userId: user.id // Associate pet with user
            };
            
            const response = await axios.post(apiPets, newPet);
            if (response.status === 201) {
                pets.push(response.data);
                // Reload stays for the new pet
                await reloadStays();
                renderPets();
                showSuccess('Pet added successfully');
            }
        } catch (error) {
            console.error('Error adding pet:', error);
            showError('Error adding pet');
        }
    }

    async function updatePet(id, petData) {
        try {
            const response = await axios.put(`${apiPets}/${id}`, petData);
            if (response.status === 200) {
                const index = pets.findIndex(pet => pet.id === id);
                if (index !== -1) {
                    pets[index] = { ...pets[index], ...petData };
                    // Reload stays after updating pet
                    await reloadStays();
                    renderPets();
                    showSuccess('Pet updated successfully');
                }
            }
        } catch (error) {
            console.error('Error updating pet:', error);
            showError('Error updating pet');
        }
    }

    // Functions to handle pet editing and deletion
    function handleEditPet(id) {
        console.log('handleEditPet function called with ID:', id);
        const pet = pets.find(p => p.id === id);
        if (!pet) {
            console.error('Pet not found for editing');
            return;
        }

        console.log('Pet found for editing:', pet);
        isEditing = true;
        currentPetId = id;
        modalTitle.textContent = 'Edit Pet';
        
        // Fill form with pet data
        petNameInput.value = pet.name;
        petTypeInput.value = pet.breed;
        petAgeInput.value = pet.age;
        petImageInput.value = pet.image === 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaW4gSW1hZ2VuPC90ZXh0Pjwvc3ZnPg==' ? '' : pet.image;
        
        showModal();
    }

    async function handleDeletePet(id) {
        console.log('=== ATTEMPTING TO DELETE PET ===');
        console.log('Pet ID:', id);
        
        const pet = pets.find(p => p.id === id);
        if (!pet) {
            console.error('Pet not found for deletion');
            showError('Pet not found');
            return;
        }

        console.log('Pet found for deletion:', pet);
        
        // Find all stays for this pet
        const petStays = stays.filter(stay => stay.petId === id);
        console.log('Stays found for this pet:', petStays);
        
        // Check if any stay is active
        let hasActiveStay = false;
        let activeStay = null;
        
        for (const stay of petStays) {
            if (isStayActive(stay)) {
                hasActiveStay = true;
                activeStay = stay;
                break;
            }
        }
        
        console.log('Has active stay?:', hasActiveStay);
        console.log('Active stay:', activeStay);

        if (hasActiveStay) {
            console.log('❌ CANNOT DELETE - Active stay');
            showError(`You cannot delete pet "${pet.name}" because it has an active stay from ${new Date(activeStay.startDate).toLocaleDateString()} to ${new Date(activeStay.endDate).toLocaleDateString()}`);
            return;
        }

        console.log('✅ Proceeding with deletion...');
        const result = await showDeleteConfirm(pet.name);
        if (result.isConfirmed) {
            try {
                console.log('Sending DELETE request to:', `${apiPets}/${id}`);
                const response = await axios.delete(`${apiPets}/${id}`);
                console.log('Server response:', response);
                
                if (response.status === 200) {
                    pets = pets.filter(p => p.id !== id);
                    await reloadStays();
                    renderPets();
                    showSuccess('Pet deleted successfully');
                } else {
                    showError('Unexpected error deleting pet');
                }
            } catch (error) {
                console.error('Error deleting pet:', error);
                showError('Error deleting pet: ' + error.message);
            }
        } else {
            console.log('Deletion cancelled by user');
        }
    }

    function handleLogout() {
        showConfirm('Logout', 'Are you sure you want to logout?', 'Yes, logout').then((result) => {
            if (result.isConfirmed) {
                showSuccess('Logging out...');
                // Simulate logout
                setTimeout(() => {
                    showLoadingForTransition("PetCare Center", "Logging out...");
                    window.location.href = '/src/views/login.html'; // Redirect to login
                }, 1000);
            }
        });
    }



    // Additional functions to improve user experience
    
    // Preview image while typing URL
    petImageInput.addEventListener('input', function() {
        const url = this.value.trim();
        if (url && isValidURL(url)) {
            // Create preview image
            const img = new Image();
            img.onload = function() {
                // Valid URL and image loaded
                petImageInput.style.borderColor = '#27ae60';
            };
            img.onerror = function() {
                // Valid URL but image not loaded
                petImageInput.style.borderColor = '#e74c3c';
            };
            img.src = url;
        } else {
            petImageInput.style.borderColor = '';
        }
    });

    // Loading animation for cards
    function animateCards() {
        const cards = document.querySelectorAll('.pet-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    // Call animation after rendering
    const originalRenderPets = renderPets;
    renderPets = function() {
        originalRenderPets();
        setTimeout(animateCards, 50);
    };

    // Real-time search (if search field is added)
    window.searchPets = function(query) {
        const filteredPets = pets.filter(pet => 
            pet.name.toLowerCase().includes(query.toLowerCase()) ||
            pet.breed.toLowerCase().includes(query.toLowerCase())
        );
        
        petsContainer.innerHTML = '';
        filteredPets.forEach(pet => {
            const petCard = createPetCard(pet);
            petsContainer.appendChild(petCard);
        });
    };



    // Welcome message
    console.log('🐾 PetCare Dashboard loaded successfully');
    console.log(`📊 Registered pets: ${pets.length}`);
});