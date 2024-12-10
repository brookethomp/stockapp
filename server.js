const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const path = require('path');

// MongoDB connection string
const mongoURI = process.env.MONGO_URI || "mongodb+srv://stockuser:Stocks123@cluster0.smdvj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

if (!mongoURI) {
    console.error('MONGO_URI is not set');
    process.exit(1); // Exit if no URI is provided
}

const client = new MongoClient(mongoURI);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true })); // Parse form data
app.use(express.static(path.join(__dirname, 'public')));

let collection;

// Connect to MongoDB
client.connect().then(() => {
    const db = client.db('Stock');
    collection = db.collection('PublicCompanies');
    console.log('Connected to MongoDB');
}).catch(err => console.error('Failed to connect to MongoDB:', err));

// Home view (form)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Process view
app.get('/process', async (req, res) => {
    const { query, type } = req.query;

    if (!query || !type) {
        return res.status(400).send('Invalid input. Please provide a query and type.');
    }

    try {
        const searchKey = type === 'ticker' ? 'stockTicker' : 'companyName';
        const results = await collection.find({ [searchKey]: { $regex: query, $options: 'i' } }).toArray();

        if (results.length === 0) {
            res.send('<h1>No results found.</h1><a href="/">Back to Home</a>');
        } else {
            const resultHTML = results.map(result => `
                <p>
                    <strong>Company Name:</strong> ${result.companyName}<br>
                    <strong>Stock Ticker:</strong> ${result.stockTicker}<br>
                    <strong>Stock Price:</strong> $${result.stockPrice}
                </p>
            `).join('');
            res.send(`
                <h1>Search Results</h1>
                ${resultHTML}
                <a href="/">Back to Home</a>
            `);
        }
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).send('An error occurred while processing your request.');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
