const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Import product data
const products = require('./products');

// Enable CORS to allow requests from your React frontend
app.use(cors());

// Serve static files from the 'images' folder (if you have images here)
app.use('/images', express.static(path.join(__dirname, 'images')));

// Serve the documentation HTML file (assuming you have `index.html` as the main documentation file)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the CSS file for styling the index.html page
app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'styles.css'));
});

// API endpoint to get all products
app.get('/api/products', (req, res) => {
    res.json(products);
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

