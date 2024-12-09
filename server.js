const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer'); // For handling file uploads
const Joi = require('joi');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const upload = multer({ dest: 'images/' }); // Files will be saved in the "images" directory

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
    image: Joi.string().required(),
    features: Joi.array().items(Joi.string()).required(),
    mainIngredients: Joi.array().items(Joi.string()).required(),
});

// In-memory products array
let products = [];

// Get all products
app.get('/api/products', (req, res) => {
    res.json(products);
});

// Add a new product with image upload
app.post('/api/products', upload.single('image'), (req, res) => {
    // Validate the incoming product data
    const { error, value } = productSchema.validate({
        ...req.body,
        features: JSON.parse(req.body.features),
        mainIngredients: JSON.parse(req.body.mainIngredients),
        image: req.file ? `/images/${req.file.filename}` : undefined,
    });

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // Create the new product
    const newProduct = {
        id: products.length + 1,
        ...value,
    };
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
