const axios = require('axios');
const cheerio = require('cheerio');

const AIRTABLE_BASE_ID = 'app3iH1fIAQt4A3kz';
const AIRTABLE_TABLE_NAME = 'tblyqD9Pga3edjCPN';
const AIRTABLE_API_KEY = 'paty7Qv08vE2qnSi2.093f8d0babdff82da158705528f98fb7f870d984d67d14c2475c1b7c8ea49fef';

exports.handler = async function(event, context) {
  try {
    // Fetch race data
    const response = await axios.get('https://www.sportinglife.com/greyhounds/racecards');
    const $ = cheerio.load(response.data);
    const allRecords = [];

    $("ul.meetings > li").each((_, list) => {
      $(list).find("section > div > div.GreyhoundRacingMeetingSummary__MeetingRacesContainer-xneuck-0.goyOim > div").each((index, container) => {
        const link = $(container).find('a');
        if (link.length) {
          const href = link.attr('href');
          const trackName = href.split('/')[4].charAt(0).toUpperCase() + href.split('/')[4].slice(1);
          const trackId = href.split('/')[6];
          const time = link.find('span').text();
          
          allRecords.push({
            fields: {
              Track: trackName,
              'Race Number': `Race ${index + 1}`,
              ID: trackId,
              Time: time
            }
          });
        }
      });
    });

    // Send to Airtable
    const airtableResponse = await axios.post(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
      { records: allRecords },
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Data collected and sent to Airtable successfully',
        records: allRecords
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};