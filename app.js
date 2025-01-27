// ==========================================
// 1. Date and Time Management
// ==========================================
function updateDateTime() {
    const now = new Date();
    const dateElement = document.getElementById('current-date');
    const timeElement = document.getElementById('current-time');
    
    // Format date as "Monday, 27th of January"
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const date = now.toLocaleDateString('en-US', options);
    const day = now.getDate();
    const suffix = getDaySuffix(day);
    const formattedDate = date.replace(day.toString(), `${day}${suffix}`);
    
    dateElement.textContent = formattedDate;
    timeElement.textContent = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function getDaySuffix(day) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
    }
}

// ==========================================
// 2. Airtable Integration
// ==========================================
const AIRTABLE_CONFIG = {
    BASE_ID: 'app3iH1fIAQt4A3kz',
    TABLE_ID: 'tblSYkvAVCNDqS5BG',
    TOKEN: 'paty7Qv08vE2qnSi2.093f8d0babdff82da158705528f98fb7f870d984d67d14c2475c1b7c8ea49fef'
};

async function fetchTrapData() {
    try {
        const reloadButton = document.querySelector('.reload-button');
        if (reloadButton) {
            reloadButton.style.transform = 'rotate(360deg)';
        }

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

        // Reset reload button after fetch
        setTimeout(() => {
            if (reloadButton) {
                reloadButton.style.transform = 'rotate(0deg)';
            }
        }, 500);

        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// ==========================================
// 3. Event Listeners
// ==========================================
function initializeEventListeners() {
    // Reload button click handler
    const reloadButton = document.querySelector('.reload-button');
    if (reloadButton) {
        reloadButton.addEventListener('click', fetchTrapData);
    }

    // Racetrack click handler
    document.querySelectorAll('.racetrack').forEach(track => {
        track.addEventListener('click', function() {
            const raceName = this.querySelector('.racetrack-2').textContent;
            console.log(`Selected racetrack: ${raceName}`);
            // Add navigation logic here
        });
    });
}

// ==========================================
// 4. Initialization
// ==========================================
window.onload = function() {
    updateDateTime();
    setInterval(updateDateTime, 60000);
    initializeEventListeners();
}
