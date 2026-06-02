require('dotenv').config();
const axios = require('axios');

async function getModels() {
  try {
    const response = await axios.get('https://openrouter.ai/api/v1/models');
    const models = response.data.data.map(m => m.id);
    const googleModels = models.filter(id => id.includes('gemini'));
    console.log("Google models:", googleModels);
  } catch (error) {
    console.error("Error:", error.message);
  }
}
getModels();
