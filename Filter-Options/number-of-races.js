const AIRTABLE_BASE_ID = 'app3iH1fIAQt4A3kz';
const AIRTABLE_TABLE_ID = 'tblyqD9Pga3edjCPN';
const AIRTABLE_TOKEN = 'paty7Qv08vE2qnSi2.093f8d0babdff82da158705528f98fb7f870d984d67d14c2475c1b7c8ea49fef';

async function getUniqueTracks() {
    try {
        const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_TOKEN}`
            }
        });

        const data = await response.json();
        
        // Extract all track names and remove duplicates using Set
        const uniqueTracks = [...new Set(
            data.records
                .map(record => record.fields.Track)
                .filter(track => track) // Remove any undefined or null values
        )];

        // Create filter elements
        createFilterElements(uniqueTracks);

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function createFilterElements(tracks) {
    const container = document.getElementById('filter-container');
    
    tracks.forEach(track => {
        const filterElement = document.createElement('div');
        filterElement.className = 'property-inactive';
        filterElement.onclick = function() { toggleState(this); };
        
        filterElement.innerHTML = `
            <img class="checkbox" src="img/image.svg" />
            <div class="track-name-wrap"><div class="text-wrapper">${track}</div></div>
        `;
        
        container.appendChild(filterElement);
    });
}

// Call the function when the page loads
getUniqueTracks();
