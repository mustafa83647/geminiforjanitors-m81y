const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// --- السطر الجديد حطه هنا ---
app.get('/', (req, res) => res.send('Server is Alive! 🚀'));
// -----------------------

app.post('/v1/chat/completions', async (req, res) => {
    const authHeader = req.headers.authorization;
    const apiKey = authHeader ? authHeader.split(' ')[1] : null;

    if (!apiKey) return res.status(401).json({ error: "Missing API Key" });

    const model = req.body.model?.includes('gemini') ? req.body.model : 'gemini-1.5-flash';
    
    const contents = req.body.messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
    }));

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            { contents }
        );

        const text = response.data.candidates[0].content.parts[0].text;

        res.json({
            choices: [{
                message: { role: 'assistant', content: text },
                finish_reason: 'stop'
            }]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
