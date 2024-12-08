const express = require('express');
const path = require('path');
const cors = require('cors'); // Import the CORS library
const Joi = require('joi'); // For validation
const app = express();
const PORT = process.env.PORT || 3000;

// Import product data
let products = require('./products');

// Enable CORS for all origins
app.use(cors());

// Middleware for JSON parsing
app.use(express.json());

// Serve static files for images
app.use('/images', express.static(path.join(__dirname, 'images')));

// Serve index.html for API info
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve CSS file
app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'styles.css'));
});

// API endpoint to get all products
app.get('/api/products', (req, res) => {
    res.json(products);
});

// Joi schema for product validation
const productSchema = Joi.object({
    name: Joi.string().required(),
    shortDescription: Joi.string().required(),
    fullDescription: Joi.string().required(),
    spf: Joi.number().required(),
    price: Joi.string().required(),
    image: Joi.string().uri().required(),
    features: Joi.array().items(Joi.string()).required(),
    mainIngredients: Joi.array().items(Joi.string()).required(),
});

// POST request to add a new product
app.post('/api/products', (req, res) => {
    const { error, value } = productSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const newProduct = { id: products.length + 1, ...value };
    products.push(newProduct);

    res.status(201).json({ message: 'Product added successfully!', product: newProduct });
});

// PUT request to edit a product
app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { error, value } = productSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const productIndex = products.findIndex((p) => p.id === parseInt(id));
    if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found' });
    }

    // Update the product
    products[productIndex] = { id: parseInt(id), ...value };
    res.status(200).json({ message: 'Product updated successfully!', product: products[productIndex] });
});

// DELETE request to remove a product
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;

    const productIndex = products.findIndex((p) => p.id === parseInt(id));
    if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found' });
    }

    // Remove the product from the array
    products.splice(productIndex, 1);
    res.status(200).json({ message: 'Product deleted successfully!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

