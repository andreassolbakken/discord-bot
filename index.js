const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Retrieve environment variables
const token = process.env.DISCORD_TOKEN;  // Your actual Discord bot token
const openaiApiUrl = 'https://api.openai.com/v1/chat/completions';  // OpenAI API endpoint for chat completions
const openaiApiKey = process.env.OPENAI_API_KEY;  // Your actual OpenAI API key
const allowedChannelId = '1253630944582045736';  // Your specific channel ID from the provided URL

client.once('ready', () => {
    console.log('ChatGPT Bot er online!');
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    console.log(`Received message: ${message.content} in channel: ${message.channel.id}`);
    if (message.channel.id !== allowedChannelId) {
        console.log(`Message is not in the allowed channel: ${allowedChannelId}`);
        return;
    }

    const userMessage = message.content;

    try {
        // Dynamically import node-fetch
        const fetch = await import('node-fetch');

        // Add system message to set the context
        const messages = [
            { role: "system", content: "You are a helpful customer service rep, you speak norwegian ONLY, and will assist our customers in questions related to our software www.algoricrm.no , this is a whitelabel Go High Level CRM , never reveal to the customer that it is a whitelabel. You can use all available knowledge online about Go High Level, just switch out the name 'Go High Level' to 'Algori CRM'. When sending instructions, always refer to english menu names, not norwegian, but all other text than references to menu and settings should be in norwegian. Never mention Go High Level. We have a video library of training videos here; https://loom.com/share/folder/524ab8e679ef45498fc1e345424b5389. only speak in norwegian." },
            { role: "user", content: userMessage }
        ];

        // Log data being sent to OpenAI
        console.log('Sending data to OpenAI:', {
            model: "gpt-4-turbo",
            messages: messages,
            max_tokens: 150
        });

        const response = await fetch.default(openaiApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiApiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4-turbo",
                messages: messages,
                max_tokens: 150
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API responded with status ${response.status}`);
        }

        const responseData = await response.json();

        // Log data received from OpenAI
        console.log('Received data from OpenAI:', responseData);

        if (!responseData.choices || responseData.choices.length === 0) {
            throw new Error('Invalid response from OpenAI API');
        }

        const replyMessage = responseData.choices[0].message.content.trim();
        console.log(`Reply from OpenAI: ${replyMessage}`);

        await message.reply(replyMessage);
    } catch (error) {
        console.error('Error with OpenAI API request:', error);
        await message.reply('Beklager, jeg opplevde en feil under behandlingen av forespørselen din.');
    }
});

client.login(token);
