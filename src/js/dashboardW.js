// PetCare Dashboard Worker JavaScript
import { guardianUserAuth, apiUsers, apiPets, apiStays } from './main.js';
import axios from 'axios';
import { showSuccess, showError, showDeleteConfirm, showValidationError, showConfirm, showInfo } from './utils/sweetalert.js';
import { initLoadingScreen, showLoadingForTransition } from './utils/loading.js';

// Inicializar pantalla de carga
initLoadingScreen();

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación al cargar la página
    guardianUserAuth();
    
    const $btnLogOut = document.getElementById('logout-btn');
    $btnLogOut.addEventListener('click', (e) => {
        e.preventDefault();
        showConfirm('Logout', 'Are you sure you want to logout?', 'Yes, logout').then((result) => {
            if (result.isConfirmed) {
                showSuccess('Logging out...');
                localStorage.removeItem("user");
                setTimeout(() => {
                    showLoadingForTransition("PetCare Center", "Logging out...");
                    window.location.href = '/';
                }, 1000);
            }
        });
    })

    // Variables globales
    let users = [];
    let pets = [];
    let stays = [];
    let currentUser = null;

    // Elementos del DOM
    const usersContainer = document.getElementById('users-container');
    const petsContainer = document.getElementById('pets-container');
    const usersCount = document.getElementById('users-count');
    const petsCount = document.getElementById('pets-count');

    // Modal de estancias
    const stayModal = document.getElementById('stay-modal');
    const stayForm = document.getElementById('stay-form');
    const stayModalTitle = document.getElementById('stay-modal-title');
    const stayPetName = document.getElementById('stay-pet-name');
    const stayOwner = document.getElementById('stay-owner');
    const stayStartDate = document.getElementById('stay-start-date');
    const stayEndDate = document.getElementById('stay-end-date');
    const stayNotes = document.getElementById('stay-notes');
    const saveStayBtn = document.getElementById('save-stay-btn');
    const cancelStayBtn = document.getElementById('cancel-stay-btn');
    const deleteStayBtn = document.getElementById('delete-stay-btn');
    const closeStayModal = document.getElementById('close-stay-modal');

    // Variables para el modal
    let isEditingStay = false;
    let currentStayId = null;
    let currentPetForStay = null;

    // Inicializar la aplicación
    init();

    function init() {
        loadData();
        bindEvents();
    }

    function bindEvents() {
        // Eventos del modal de estancias
        closeStayModal.addEventListener('click', closeStayModalFunc);
        cancelStayBtn.addEventListener('click', closeStayModalFunc);
        stayForm.addEventListener('submit', handleStayFormSubmit);
        deleteStayBtn.addEventListener('click', handleDeleteStay);

        // Eventos para las fechas
        stayStartDate.addEventListener('change', function() {
            if (this.value) {
                const startDate = new Date(this.value);
                const minEndDate = new Date(startDate);
                minEndDate.setDate(minEndDate.getDate() + 1);
                stayEndDate.min = minEndDate.toISOString().split('T')[0];
                
                // Si la fecha de fin es anterior a la nueva fecha de inicio, actualizarla
                if (stayEndDate.value && new Date(stayEndDate.value) <= startDate) {
                    stayEndDate.value = minEndDate.toISOString().split('T')[0];
                }
            }
        });

        // Cerrar modal al hacer clic fuera
        stayModal.addEventListener('click', function(e) {
            if (e.target === stayModal) {
                closeStayModalFunc();
            }
        });

        // Tecla ESC para cerrar modal
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !stayModal.classList.contains('hidden')) {
                closeStayModalFunc();
            }
        });
    }

    // Load all data
    async function loadData() {
        try {
            const [usersResponse, petsResponse, staysResponse] = await Promise.all([
                axios.get(apiUsers),
                axios.get(apiPets),
                axios.get(apiStays)
            ]);

            users = usersResponse.data.filter(user => user.roleId === 2);
            pets = petsResponse.data;
            stays = staysResponse.data;

            updateStats();
            renderUsers();
            renderPets();
        } catch (error) {
            console.error('Error loading data:', error);
            showError('Error loading data');
        }
    }

    // Update statistics
    function updateStats() {
        usersCount.textContent = users.length;
        petsCount.textContent = pets.length;
    }

    // Check if a stay is active
    function isStayActive(stay) {
        const today = new Date();
        const startDate = new Date(stay.startDate);
        const endDate = new Date(stay.endDate);
        return today >= startDate && today <= endDate;
    }

    // Render users
    function renderUsers() {
        usersContainer.innerHTML = '';
        
        if (users.length === 0) {
            usersContainer.innerHTML = '<p class="no-data">No registered users</p>';
            return;
        }

        users.forEach(user => {
            const userCard = createUserCard(user);
            usersContainer.appendChild(userCard);
        });
    }

    // Create user card
    function createUserCard(user) {
        const userPets = pets.filter(pet => pet.userId === user.id);
        const card = document.createElement('div');
        card.className = 'user-card';
        card.innerHTML = `
            <div class="user-info">
                <h4>${user.name}</h4>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Phone:</strong> ${user.phone}</p>
                <p><strong>Pets:</strong> ${userPets.length}</p>
            </div>
            <div class="user-pets">
                <h5>Pets:</h5>
                ${userPets.length > 0 ? 
                    userPets.map(pet => `
                        <div class="pet-item">
                            <span>${pet.name} (${pet.breed})</span>
                            <button class="manage-stay-btn" onclick="manageStay('${pet.id}')">
                                Manage Stay
                            </button>
                        </div>
                    `).join('') : 
                    '<p>No pets</p>'
                }
            </div>
        `;
        return card;
    }

    // Render pets
    function renderPets() {
        petsContainer.innerHTML = '';
        
        if (pets.length === 0) {
            petsContainer.innerHTML = '<p class="no-data">No registered pets</p>';
            return;
        }

        pets.forEach(pet => {
            const petCard = createPetCard(pet);
            petsContainer.appendChild(petCard);
        });
    }

    // Create pet card
    function createPetCard(pet) {
        const owner = users.find(user => user.id === pet.userId);
        const petStay = stays.find(stay => stay.petId === pet.id);
        const isActive = petStay ? isStayActive(petStay) : false;
        
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
                    <p class="pet-owner">
                        <span class="detail-label">Owner:</span> ${owner ? owner.name : 'Unknown'}
                    </p>
                </div>
                <div class="stay-status">
                    <span class="stay-badge ${isActive ? 'active' : 'inactive'}">
                        ${isActive ? 'Active Stay' : 'No Stay'}
                    </span>
                    ${petStay ? `
                        <p class="stay-dates">
                            ${new Date(petStay.startDate).toLocaleDateString()} - ${new Date(petStay.endDate).toLocaleDateString()}
                        </p>
                    ` : ''}
                </div>
            </div>
            <div class="pet-actions">
                <button class="manage-stay-btn" onclick="manageStay('${pet.id}')">
                    ${isActive ? 'Edit Stay' : 'Add Stay'}
                </button>
            </div>
        `;
        return card;
    }

    // Manage stay (global function)
    window.manageStay = function(petId) {
        const pet = pets.find(p => p.id === petId);
        const owner = users.find(u => u.id === pet.userId);
        const existingStay = stays.find(s => s.petId === petId);
        
        currentPetForStay = pet;
        isEditingStay = !!existingStay;
        currentStayId = existingStay ? existingStay.id : null;

        // Llenar el modal
        stayPetName.value = pet.name;
        stayOwner.value = owner.name;
        
        // Establecer fecha mínima como hoy
        const today = new Date().toISOString().split('T')[0];
        stayStartDate.min = today;
        stayEndDate.min = today;
        
        if (existingStay) {
            stayModalTitle.textContent = 'Editar Estancia';
            stayStartDate.value = existingStay.startDate;
            stayEndDate.value = existingStay.endDate;
            stayNotes.value = existingStay.notes || '';
            deleteStayBtn.style.display = 'block';
        } else {
            stayModalTitle.textContent = 'Agregar Estancia';
            stayStartDate.value = '';
            stayEndDate.value = '';
            stayNotes.value = '';
            deleteStayBtn.style.display = 'none';
        }

        showStayModal();
    };

    // Mostrar modal de estancia
    function showStayModal() {
        stayModal.classList.remove('hidden');
        stayStartDate.focus();
    }

    // Cerrar modal de estancia
    function closeStayModalFunc() {
        stayModal.classList.add('hidden');
        isEditingStay = false;
        currentStayId = null;
        currentPetForStay = null;
    }

    // Manejar envío del formulario de estancia
    async function handleStayFormSubmit(e) {
        e.preventDefault();
        
        const formData = {
            petId: currentPetForStay.id,
            startDate: stayStartDate.value,
            endDate: stayEndDate.value,
            notes: stayNotes.value
        };

        if (!validateStayForm(formData)) {
            return;
        }

        try {
            if (isEditingStay) {
                await updateStay(currentStayId, formData);
            } else {
                await createStay(formData);
            }
            
            closeStayModalFunc();
            
            // Recargar datos completos para asegurar sincronización
            await loadData();
            
            showSuccess(
                isEditingStay ? 'Estancia actualizada correctamente' : 'Estancia creada correctamente'
            );
        } catch (error) {
            console.error('Error al guardar estancia:', error);
            showError('Error al guardar estancia');
        }
    }

    // Validar formulario de estancia
    function validateStayForm(data) {
        if (!data.startDate || !data.endDate) {
            showValidationError('Por favor completa todas las fechas');
            return false;
        }

        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Resetear a inicio del día

        if (startDate < today) {
            showValidationError('La fecha de inicio no puede ser anterior a hoy');
            return false;
        }

        if (endDate <= startDate) {
            showValidationError('La fecha de fin debe ser posterior a la fecha de inicio');
            return false;
        }

        // Validar que la fecha de fin no sea más de 1 año en el futuro
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 1);
        if (endDate > maxDate) {
            showValidationError('La fecha de fin no puede ser más de 1 año en el futuro');
            return false;
        }

        return true;
    }

    // Crear estancia
    async function createStay(stayData) {
        try {
            const response = await axios.post(apiStays, stayData);
            // Agregar la nueva estancia al array local
            stays.push(response.data);
            return response.data;
        } catch (error) {
            console.error('Error al crear estancia:', error);
            throw error;
        }
    }

    // Actualizar estancia
    async function updateStay(stayId, stayData) {
        try {
            const response = await axios.put(`${apiStays}/${stayId}`, stayData);
            // Actualizar la estancia en el array local
            const index = stays.findIndex(s => s.id === stayId);
            if (index !== -1) {
                stays[index] = response.data;
            }
            return response.data;
        } catch (error) {
            console.error('Error al actualizar estancia:', error);
            throw error;
        }
    }

    // Eliminar estancia
    async function handleDeleteStay() {
        if (!currentStayId) return;

        const stay = stays.find(s => s.id === currentStayId);
        const pet = pets.find(p => p.id === stay.petId);
        
        const result = await showDeleteConfirm(`la estancia de ${pet.name}`);
        if (result.isConfirmed) {
            try {
                await axios.delete(`${apiStays}/${currentStayId}`);
                
                closeStayModalFunc();
                
                // Recargar datos completos para asegurar sincronización
                await loadData();
                
                showSuccess(`Estancia de ${pet.name} eliminada correctamente`);
            } catch (error) {
                console.error('Error al eliminar estancia:', error);
                showError('Error al eliminar estancia');
            }
        }
    }



    console.log('Dashboard de trabajador cargado');
}); 