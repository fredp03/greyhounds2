const { JSDOM } = require('jsdom');

const URL = 'https://www.sportinglife.com/greyhounds/racecards';

const AIRTABLE_BASE_ID = 'app3iH1fIAQt4A3kz';
const AIRTABLE_TABLE_NAME = 'tblyqD9Pga3edjCPN';
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;
const AIRTABLE_API_KEY = 'paty7Qv08vE2qnSi2.093f8d0babdff82da158705528f98fb7f870d984d67d14c2475c1b7c8ea49fef'; // Corrected API key

async function sendToAirtable(records) {
  const BATCH_SIZE = 10; // Adjust based on Airtable's rate limits
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const response = await fetch(AIRTABLE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ records: batch })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Airtable Error:', JSON.stringify(errorData, null, 2));
    } else {
      console.log(`Batch ${i / BATCH_SIZE + 1} successfully sent to Airtable.`);
    }
  }
}

async function fetchHtml() {
  try {
    const response = await fetch(URL);
    const html = await response.text();
    
    const dom = new JSDOM(html);
    const lists = dom.window.document.querySelectorAll("ul.meetings > li");

    let allRecords = [];
    lists.forEach(list => {
      const containers = list.querySelectorAll("section > div > div.GreyhoundRacingMeetingSummary__MeetingRacesContainer-xneuck-0.goyOim > div");

      containers.forEach((container, index) => {
        const link = container.querySelector('a');
        const span = link ? link.querySelector('span') : null;

        if (link && span) {
          const href = link.href;
          const trackName = href.split('/')[4].charAt(0).toUpperCase() + href.split('/')[4].slice(1);
          const trackId = href.split('/')[6];
          const time = span.textContent;
          const raceNumber = `Race ${index + 1}`;

          allRecords.push({
            fields: {
              Track: trackName,
              'Race Number': raceNumber,
              ID: trackId,
              Time: time
            }
          });
        }
      });
    });

    await sendToAirtable(allRecords);
  } catch (error) {
    console.error('Error:', error);
  }
}

fetchHtml();


