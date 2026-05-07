import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function run() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'seller@example.com',
            password: 'password123'
        });
        const { token } = loginRes.data;
        console.log('Login successful. Token acquired.');

        // 2. Add Product
        console.log('Adding product...');
        const productData = {
            name: 'Debug Product ' + Date.now(),
            description: 'Test product for debugging',
            price: 99.99,
            category: 'Electronics',
            stock: 10,
            image: 'https://via.placeholder.com/150'
        };

        // Note: The previous "addProduct" implementation in frontend sends to /api/seller/products?
        // Let's check sellerService.js... wait, the route in app.js is /api/seller -> routes/seller.js
        // Let's check routes/seller.js content to confirm the endpoint.
        // Assuming it is POST /api/seller/products based on standard REST.

        await axios.post(`${API_URL}/seller/products`, productData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Product added successfully.');

        // 3. Verify Visibility
        console.log('Fetching public products...');
        const productsRes = await axios.get(`${API_URL}/products`);
        const found = productsRes.data.find(p => p.name === productData.name);

        if (found) {
            console.log('SUCCESS: Product is visible to customers!');
            console.log('Product ID:', found.id || found._id);
        } else {
            console.error('FAILURE: Product was added but NOT found in public list.');
            console.log('Total products found:', productsRes.data.length);
        }

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

run();
