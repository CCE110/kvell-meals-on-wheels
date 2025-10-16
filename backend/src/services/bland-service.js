const fetch = require('node-fetch');

async function getCallDetails(callId) {
  try {
    const response = await fetch(`https://api.bland.ai/v1/calls/${callId}`, {
      headers: {
        'Authorization': process.env.BLAND_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Bland API error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching call details:', error);
    throw error;
  }
}

module.exports = { getCallDetails };
