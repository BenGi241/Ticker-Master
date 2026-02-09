const axios = require('axios');
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('No API key found!');
    process.exit(1);
}

console.log(`Checking API Key: ${apiKey.substring(0, 5)}...`);

const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log('Fetching available models...');
axios.get(listUrl)
    .then(response => {
        console.log('Available models:');
        if (response.data.models) {
            response.data.models.forEach(model => console.log(`- ${model.name}`));
        } else {
            console.log('No models returned in list.');
        }
    })
    .catch(error => {
        console.error('Error fetching models:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    });

// Also try generating content with gemini-pro directly
const generateUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
console.log(`Trying generation with ${generateUrl}...`);

axios.post(generateUrl, {
    contents: [{ parts: [{ text: "Hello, world!" }] }]
})
    .then(response => console.log('Generation success!'))
    .catch(error => {
        console.error('Generation failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    });
