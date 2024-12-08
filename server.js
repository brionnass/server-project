const express = require('express');
const path = require('path');
const cors = require('cors'); // Import the CORS library
const Joi = require('joi');
const multer = require('multer'); // Import multer for file uploads
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

// Set up multer for image uploads
const upload = multer({
    dest: 'images/', // Directory where images will be stored
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    },
});

// Joi schema for product validation
const productSchema = Joi.object({
    name: Joi.string().required(),
    shortDescription: Joi.string().required(),
    fullDescription: Joi.string().required(),
    spf: Joi.number().required(),
    price: Joi.string().required(),
    image: Joi.string().optional(), // Make `image` optional for uploads
    features: Joi.array().items(Joi.string()).required(),
    mainIngredients: Joi.array().items(Joi.string()).required(),
});

// Get all products
app.get('/api/products', (req, res) => {
    res.json(products);
});

// Add a new product with optional file upload
app.post('/api/products', upload.single('image'), (req, res) => {
    const { error, value } = productSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // Use uploaded file path or image field from the request body
    const imagePath = req.file ? `/images/${req.file.filename}` : req.body.image;

    const newProduct = { id: products.length + 1, ...value, image: imagePath };
    products.push(newProduct);

    res.status(201).json({ message: 'Product added successfully!', product: newProduct });
});

// Edit a product with optional file upload
app.put('/api/products/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { error, value } = productSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const productIndex = products.findIndex((p) => p.id === parseInt(id));
    if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found' });
    }

    // Use uploaded file path or image field from the request body
    const imagePath = req.file ? `/images/${req.file.filename}` : req.body.image;

    // Update the product
    products[productIndex] = { id: parseInt(id), ...value, image: imagePath };
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
