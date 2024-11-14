const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Import product data
const products = require('./products');

// Serve static files from the 'images' folder
app.use('/images', express.static(path.join(__dirname, 'images')));

// Serve the documentation HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the CSS file
app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'styles.css'));
});

// API endpoint to get all products
app.get('/api/products', (req, res) => {
    res.json(products);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


