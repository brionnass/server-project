const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const Joi = require('joi');

const app = express();
const PORT = process.env.PORT || 3000;

// Original products (always reset to these on server restart)
const originalProducts = [
    {
        id: 1,
        name: "Sunny SPF 50",
        shortDescription: "High protection, broad-spectrum UVA/UVB.",
        fullDescription: "Sunny SPF 50 provides broad-spectrum UVA/UVB protection with a water-resistant formula. Ideal for long sun exposure.",
        spf: 50,
        price: "$19.99",
        image: "/images/sunscreen1.jpg",
        features: ["Water-resistant up to 80 minutes", "Non-greasy formula", "Reef-safe ingredients"],
        mainIngredients: ["Zinc Oxide", "Titanium Dioxide", "Aloe Vera"]
    },
    {
        id: 2,
        name: "Sunny SPF 30",
        shortDescription: "Daily protection against UV rays.",
        fullDescription: "Sunny SPF 30 is lightweight and perfect for daily use. Its formula protects your skin from harmful UV rays without clogging pores.",
        spf: 30,
        price: "$14.99",
        image: "/images/sunscreen2.jpg",
        features: ["Lightweight, non-comedogenic", "Suitable for sensitive skin", "Broad-spectrum UVA/UVB protection"],
        mainIngredients: ["Avobenzone", "Octocrylene", "Vitamin E"]
    },
    {
        id: 3,
        name: "Sunny Kids SPF 40",
        shortDescription: "Gentle sunscreen for children.",
        fullDescription: "Sunny Kids SPF 40 is designed for sensitive skin. It provides strong sun protection with a hypoallergenic formula, making it perfect for children.",
        spf: 40,
        price: "$17.99",
        image: "/images/sunscreen3.jpg",
        features: ["Hypoallergenic", "Tear-free formula", "Pediatrician recommended"],
        mainIngredients: ["Titanium Dioxide", "Coconut Oil", "Chamomile Extract"]
    },
    {
        id: 4,
        name: "Sunny Sport SPF 60",
        shortDescription: "High SPF for active lifestyles.",
        fullDescription: "Sunny Sport SPF 60 is made for those who need extra protection during intense outdoor activities. It's sweat-resistant and provides long-lasting coverage.",
        spf: 60,
        price: "$22.99",
        image: "/images/sunscreen4.jpg",
        features: ["Sweat-resistant", "Long-lasting formula", "Water-resistant up to 90 minutes"],
        mainIngredients: ["Octinoxate", "Oxybenzone", "Aloe Vera Gel"]
    }
];

// Configure multer for file uploads
const upload = multer({ dest: 'images/' });

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

// Runtime products array (starts with original products at server start)
let products = [...originalProducts];

// Get all products
app.get('/api/products', (req, res) => {
    res.json(products);
});

// Add a new product
app.post('/api/products', upload.single('image'), (req, res) => {
    const { error, value } = productSchema.validate({
        ...req.body,
        features: JSON.parse(req.body.features),
        mainIngredients: JSON.parse(req.body.mainIngredients),
        image: req.file ? `/images/${req.file.filename}` : undefined,
    });

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const newProduct = { id: products.length + 1, ...value };
    products.push(newProduct);

    res.status(201).json({ message: 'Product added successfully!', product: newProduct });
});

// Delete a product
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;

    const productIndex = products.findIndex((p) => p.id === parseInt(id));
    if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found.' });
    }

    products.splice(productIndex, 1); // Remove the product
    res.status(200).json({ message: 'Product deleted successfully!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
