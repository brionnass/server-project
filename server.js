const express = require('express');
const path = require('path');
const cors = require('cors'); // Import the CORS library
const Joi = require('joi');
const app = express();
const PORT = process.env.PORT || 3000;

// Sample in-memory products array
let products = require('./products'); // Load products from a separate file (or replace with an empty array if starting fresh)

// Enable CORS
app.use(cors());

// Middleware for JSON parsing
app.use(express.json());

// Serve static files for images
app.use('/images', express.static(path.join(__dirname, 'images')));

// Serve index.html for API info
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
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

// Get all products
app.get('/api/products', (req, res) => {
    res.json(products);
});

// Add a new product
app.post('/api/products', (req, res) => {
    const { error, value } = productSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const newProduct = { id: products.length + 1, ...value };
    products.push(newProduct);

    res.status(201).json({ message: 'Product added successfully!', product: newProduct });
});

// Edit a product
app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { error, value } = productSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const productIndex = products.findIndex((p) => p.id === parseInt(id));
    if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found.' });
    }

    // Update the product
    products[productIndex] = { id: parseInt(id), ...value };
    res.status(200).json({ message: 'Product updated successfully!', product: products[productIndex] });
});

// Delete a product
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;

    const productIndex = products.findIndex((p) => p.id === parseInt(id));
    if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found.' });
    }

    // Remove the product
    products.splice(productIndex, 1);
    res.status(200).json({ message: 'Product deleted successfully!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
