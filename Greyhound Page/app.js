// ==========================================
// 1. Date and Time Management
// ==========================================
function updateDateTime() {
    const now = new Date();
    const dateElement = document.getElementById('current-date');
    const timeElement = document.getElementById('current-time');
    
    dateElement.textContent = now.toLocaleDateString();
    timeElement.textContent = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

// ==========================================
// 2. Airtable Integration
// ==========================================
const AIRTABLE_CONFIG = {
    BASE_ID: 'app3iH1fIAQt4A3kz',
    TABLE_ID: 'tblSYkvAVCNDqS5BG',
    SPECIFIC_RECORD_ID: 'recl89JAy0rCGas2f',
    TOKEN: 'paty7Qv08vE2qnSi2.093f8d0babdff82da158705528f98fb7f870d984d67d14c2475c1b7c8ea49fef'
};

async function fetchTrapData() {
    try {
        const response = await fetch(
            `https://api.airtable.com/v0/${AIRTABLE_CONFIG.BASE_ID}/${AIRTABLE_CONFIG.TABLE_ID}`,
            {
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_CONFIG.TOKEN}`
                }
            }
        );
        
        const data = await response.json();
        console.log('Airtable Data:', data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// ==========================================
// 3. Navigation Menu Management
// ==========================================
function toggleMenuState() {
    const menuBar = document.getElementById('menuBar');
    const closedState = document.getElementById('closedState');
    const openState = document.getElementById('openState');
    const navbarContent = openState.querySelector('.navbar-content');
    
    if (menuBar.classList.contains('property-closed')) {
        openMenu();
    } else {
        closeMenu();
    }

    function openMenu() {
        menuBar.classList.remove('property-closed');
        menuBar.classList.add('property-open');
        closedState.style.display = 'none';
        openState.style.display = 'flex';
        navbarContent.classList.add('hidden');
        requestAnimationFrame(() => {
            navbarContent.classList.remove('hidden');
            navbarContent.classList.add('visible');
        });
    }

    function closeMenu() {
        menuBar.classList.remove('property-open');
        menuBar.classList.add('property-closed');
        navbarContent.classList.remove('visible');
        navbarContent.classList.add('hidden');
        setTimeout(() => {
            openState.style.display = 'none';
            closedState.style.display = 'flex';
        }, 300);
    }
}

// ==========================================
// 4. Initialization
// ==========================================
window.onload = function() {
    // Initialize time updates
    updateDateTime();
    setInterval(updateDateTime, 60000);
    
    // Initialize data
    fetchTrapData();
    
    // Initialize event listeners
    document.querySelectorAll('.collapse-button, .colapse-races').forEach(button => {
        button.addEventListener('click', toggleMenuState);
    });
}
