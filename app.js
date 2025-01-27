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
    const reloadButton = document.querySelector('.reload-button');
    
    try {
        // Start rotation animation
        if (reloadButton) {
            reloadButton.style.transform = 'rotate(360deg)';
            reloadButton.style.transition = 'transform 0.5s ease';
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
        
        // Process and update UI with the fetched data
        updateRacetracks(data);

    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        // Reset button after animation
        setTimeout(() => {
            if (reloadButton) {
                reloadButton.style.transform = 'rotate(0deg)';
                reloadButton.style.transition = 'none';
            }
        }, 500);
    }
}

function updateRacetracks(data) {
    const racetracksList = document.querySelector('.todays-races-list');
    if (!racetracksList || !data.records) return;

    // Clear existing racetracks
    racetracksList.innerHTML = '';

    // Add racetracks from Airtable data
    data.records.forEach(record => {
        if (record.fields.Racetrack) {
            const racetrackDiv = document.createElement('div');
            racetrackDiv.className = 'racetrack';
            racetrackDiv.innerHTML = `<div class="racetrack-2">${record.fields.Racetrack}</div>`;
            
            // Add click handler for each racetrack
            racetrackDiv.addEventListener('click', () => {
                console.log(`Selected racetrack: ${record.fields.Racetrack}`);
                // Add navigation logic here
            });
            
            racetracksList.appendChild(racetrackDiv);
        }
    });
}

// ==========================================
// 3. Event Listeners
// ==========================================
function initializeEventListeners() {
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
    // Initial data fetch
    fetchTrapData();
}
