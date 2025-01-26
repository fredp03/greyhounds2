const axios = require('axios');
const cheerio = require('cheerio');

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
              Track: trackName,
              'Race Number': `Race ${index + 1}`,
              ID: trackId,
              Time: time
            }
          });
        }
      });
    });

    return {
      statusCode: 200,
      body: JSON.stringify(allRecords)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data' })
    };
  }
};