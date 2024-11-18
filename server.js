const express = require('express');
const path = require('path');
const Joi = require('joi');
const app = express();
const PORT = process.env.PORT || 3000;

let products = require('./products'); // Assuming products is an array of objects in a separate products.js file

// Middleware
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

// Serve static HTML for API info
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

// Joi schema for validation
const productSchema = Joi.object({
    name: Joi.string().required(),
    shortDescription: Joi.string().required(),
    fullDescription: Joi.string().required(),
    spf: Joi.number().required(),
    price: Joi.string().required(),
    image: Joi.string().uri().required(),
    features: Joi.array().items(Joi.string()).required(),
    mainIngredients: Joi.array().items(Joi.string()).required()
});

// API endpoint to add a new product
app.post('/api/products', (req, res) => {
    const { error, value } = productSchema.validate(req.body);
    
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // Add new product to the products array
    const newProduct = { id: products.length + 1, ...value };
    products.push(newProduct);
    
    res.status(201).json({ message: 'Product added successfully!', product: newProduct });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
