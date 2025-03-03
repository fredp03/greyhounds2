const axios = require('axios');
const cheerio = require('cheerio');

const AIRTABLE_BASE_ID = 'app3iH1fIAQt4A3kz';
const AIRTABLE_TABLE_NAME = 'tblyqD9Pga3edjCPN';
const AIRTABLE_API_KEY = 'paty7Qv08vE2qnSi2.093f8d0babdff82da158705528f98fb7f870d984d67d14c2475c1b7c8ea49fef';

exports.handler = async function(event, context) {
  try {
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

    console.log('Records to send:', JSON.stringify(allRecords, null, 2));

    // Send to Airtable in batches
    const BATCH_SIZE = 10;
    for (let i = 0; i < allRecords.length; i += BATCH_SIZE) {
      const batch = allRecords.slice(i, i + BATCH_SIZE);
      try {
        const airtableResponse = await axios({
          method: 'post',
          url: `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          data: { records: batch }
        });
        
        console.log(`Batch ${Math.floor(i/BATCH_SIZE) + 1} response:`, airtableResponse.data);
      } catch (airtableError) {
        console.error('Airtable Error:', airtableError.response?.data || airtableError);
        throw new Error(`Airtable batch ${Math.floor(i/BATCH_SIZE) + 1} failed: ${airtableError.message}`);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Data sent to Airtable successfully',
        recordCount: allRecords.length,
        records: allRecords
      })
    };

  } catch (error) {
    console.error('Full error:', error.response?.data || error);
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ 
        error: error.response?.data?.error || error.message,
        details: error.response?.data
      })
    };
  }
};