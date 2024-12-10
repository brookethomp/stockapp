const fs = require('fs');
const { MongoClient } = require('mongodb');

// MongoDB connection URI
const uri = "mongodb+srv://shelfuser:Soccer123@cluster0.smdvj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// File path for the CSV
const filePath = './companies.csv';

async function run() {
    const client = new MongoClient(uri);

    try {
        // Connect to MongoDB
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db('Stock');
        const collection = db.collection('PublicCompanies');

        // Clear existing data in the collection
        await collection.deleteMany({});
        console.log('Cleared existing data in the PublicCompanies collection.');

        // Read and process the CSV file
        const data = fs.readFileSync(filePath, 'utf8');
        const lines = data.split('\n');

        for (let line of lines) {
            if (!line.trim()) continue; // Skip empty lines
            const [companyName, stockTicker, stockPrice] = line.split(',');

            // Insert into the database
            await collection.insertOne({
                companyName: companyName.trim(),
                stockTicker: stockTicker.trim(),
                stockPrice: parseFloat(stockPrice.trim()),
            });
            console.log(`Inserted: ${companyName} (${stockTicker}) - $${stockPrice}`);
        }

        console.log('All data inserted successfully.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
        console.log('Connection to MongoDB closed.');
    }
}

run();
