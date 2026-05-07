import http from 'http';

const req = http.get('http://localhost:5000/api/products', (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const products = JSON.parse(data);
            console.log(JSON.stringify(products, null, 2));
        } catch (e) {
            console.error(e.message);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});
