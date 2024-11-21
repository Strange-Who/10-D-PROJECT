const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
const apiKey = 'AIzaSyCI94np3BsLYQt-ZU0lLR5MbnBMI-6NgAo';
const genAI = new GoogleGenerativeAI(apiKey);

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
];

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    safetySettings,
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 2000,
    responseMimeType: 'text/plain',
};

// Chatbot API Route
app.post('/get', async (req, res) => {
    const userMessage = req.body.msg;

    if (!userMessage) {
        return res.status(400).json({ error: 'Message content is missing.' });
    }

    try {
        const input = userMessage;

        let history = [
                {
                    role: 'user',
                    parts: [
                        { text: "provide medically accurate advice in a friendly manner and by leveraging high-quality, peer-reviewed medical datasets and authoritative health guidelines (e.g., CDC, WHO, PubMed) in brief." }
                    ],
                },
                {
                    role: 'user',
                    parts: [{ text: "Who developed you" }],
                },
                {
                    role: 'model',
                    parts: [{ text: "Mohammed Ziya and Muhammed Shahal developed me and the website." }],
                },
                {
                    role: 'user',
                    parts: [{ text: "Why were you developed?" }],
                },
                {
                    role: 'model',
                    parts: [{ text: "I was developed for a project by the students of 10-D of Al Noor International School." }],
                },
                {
                    role: 'user',
                    parts: [{ text: "Who's Mohammed Ziya" }],
                },
                {
                    role: 'model',
                    parts: [{ text: "Mohammed Ziya is my developer and he contributed in the development of the AI Chatbot and website backend." }],
                },
                {
                    role: 'user',
                    parts: [{ text: "Who's Muhammed Shahal" }],
                },
                {
                    role: 'model',
                    parts: [{ text: "Muhammed Shahal is the website developer and contributed to the development of the front end including CSS." }],
                },
                {
                    role: 'user',
                    parts: [{ text: "What is your name" }],
                },
                {
                    role: 'model',
                    parts: [{ text: "My name is Nemesis." }],
                },        
        ];

        history.push({
            role: 'user',
            parts: [{ text: input }],
        });

        const chatSession = model.startChat({
            generationConfig,
            safetySettings,
            history,
        });

        const result = await chatSession.sendMessage(input);
        const generatedText = result.response.text();

        res.json({ reply: generatedText.trim() });

    } catch (error) {
        console.error("Error fetching response from Gemini AI:", error);
        res.status(500).send("Error communicating with the chatbot.");
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
