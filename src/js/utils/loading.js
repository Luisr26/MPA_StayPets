// Loading screen utilities
export class LoadingScreen {
    constructor() {
        this.createLoadingScreen();
    }

    createLoadingScreen() {
        // Create loading screen element
        const loadingScreen = document.createElement('div');
        loadingScreen.className = 'loading-screen';
        loadingScreen.id = 'loading-screen';
        
        loadingScreen.innerHTML = `
            <div class="loading-container">
                <div class="loading-logo">🐾</div>
                <h1 class="loading-title">PetCare Center</h1>
                <p class="loading-subtitle">Loading your experience...</p>
                <div class="loading-spinner"></div>
                <div class="loading-progress">
                    <div class="loading-progress-bar"></div>
                </div>
                <div class="loading-dots">
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                </div>
            </div>
        `;

        // Add to DOM
        document.body.appendChild(loadingScreen);
    }

    show() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }

    hide() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            // Remove completely after animation
            setTimeout(() => {
                if (loadingScreen.parentNode) {
                    loadingScreen.remove();
                }
            }, 500);
        }
    }

    // Method to show loading screen with custom message
    showWithMessage(title, subtitle) {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            const titleElement = loadingScreen.querySelector('.loading-title');
            const subtitleElement = loadingScreen.querySelector('.loading-subtitle');
            
            if (titleElement && title) {
                titleElement.textContent = title;
            }
            if (subtitleElement && subtitle) {
                subtitleElement.textContent = subtitle;
            }
            
            loadingScreen.classList.remove('hidden');
        }
    }
}

// Function to initialize loading screen automatically
export function initLoadingScreen() {
    const loadingScreen = new LoadingScreen();
    
    // Show loading screen immediately
    loadingScreen.show();
    
    // Hide when page is completely loaded
    window.addEventListener('load', () => {
        // Simulate a small delay for better experience
        setTimeout(() => {
            loadingScreen.hide();
        }, 1000);
    });
    
    // Also hide when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                loadingScreen.hide();
            }, 1000);
        });
    } else {
        // If DOM is already ready, hide after a delay
        setTimeout(() => {
            loadingScreen.hide();
        }, 1000);
    }
    
    return loadingScreen;
}

// Function to show loading screen in transitions
export function showLoadingForTransition(title = 'PetCare Center', subtitle = 'Loading...') {
    const loadingScreen = new LoadingScreen();
    loadingScreen.showWithMessage(title, subtitle);
    return loadingScreen;
} 