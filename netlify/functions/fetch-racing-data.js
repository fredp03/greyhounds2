const axios = require('axios');
const cheerio = require('cheerio');

const AIRTABLE_BASE_ID = 'app3iH1fIAQt4A3kz';
const AIRTABLE_TABLE_NAME = 'tblyqD9Pga3edjCPN';
const AIRTABLE_API_KEY = 'paty7Qv08vE2qnSi2.093f8d0babdff82da158705528f98fb7f870d984d67d14c2475c1b7c8ea49fef';
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

async function deleteAllRecords() {
  try {
    // First, get all record IDs
    const response = await axios.get(AIRTABLE_API_URL, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`
      }
    });

    const recordIds = response.data.records.map(record => record.id);
    
    // Delete records in batches of 10
    const BATCH_SIZE = 10;
    for (let i = 0; i < recordIds.length; i += BATCH_SIZE) {
      const batchIds = recordIds.slice(i, i + BATCH_SIZE);
      const deleteUrl = `${AIRTABLE_API_URL}?records[]=${batchIds.join('&records[]=')}`;
      
      await axios.delete(deleteUrl, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`
        }
      });
    }

    console.log(`Deleted ${recordIds.length} existing records`);
  } catch (error) {
    console.error('Error deleting records:', error);
    throw error;
  }
}

exports.handler = async function(event, context) {
  try {
    // Delete all existing records first
    await deleteAllRecords();

    // Fetch and process new data
    const response = await axios.get('https://www.sportinglife.com/greyhounds/racecards');
    const $ = cheerio.load(response.data);
    const allRecords = [];

    $("ul.meetings > li").each((_, list) => {
      $(list).find("section > div > div.GreyhoundRacingMeetingSummary__MeetingRacesContainer-xneuck-0.goyOim > div").each((index, container) => {
        const link = $(container).find('a');
        const span = link.find('span');

        if (link.length && span.length) {
          const href = link.attr('href');
          const trackName = href.split('/')[4].charAt(0).toUpperCase() + href.split('/')[4].slice(1);
          const trackId = href.split('/')[6];
          const time = span.text();
          
          // Convert all values to strings for long text fields
          allRecords.push({
            fields: {
              "Track": String(trackName || ''),
              "Race Number": String(`Race ${index + 1}` || ''),
              "ID": String(trackId || ''),
              "Time": String(time || '')
            }
          });
        }
      });
    });

    // Send to Airtable in batches of 10
    const BATCH_SIZE = 10;
    for (let i = 0; i < allRecords.length; i += BATCH_SIZE) {
      const batch = allRecords.slice(i, i + BATCH_SIZE);
      await axios.post(
        AIRTABLE_API_URL,
        { records: batch },
        {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Data refreshed successfully',
        deletedCount: recordIds.length,
        newRecordCount: allRecords.length
      })
    };

  } catch (error) {
    console.error('Error:', error.response?.data || error);
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ 
        error: error.response?.data?.error || error.message 
      })
    };
  }
};