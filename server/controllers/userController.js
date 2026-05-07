import User from '../models/User.js';

export async function getDeliveryPartners(req, res, next) {
    try {
        const partners = await User.find({ role: 'Delivery' })
            .select('name _id deliveryStatus'); // Select relevant fields
        res.json(partners);
    } catch (err) {
        next(err);
    }
}

// New: Smart Matching for Checkout
export async function getAvailablePartners(req, res, next) {
    try {
        const { city, province } = req.query;

        let query = {
            role: 'Delivery',
            isProfileComplete: true
        };

        if (city || province) {
            // Case-insensitive regex match within the serviceAreas array
            const searchTerms = [];
            if (city) searchTerms.push(new RegExp(city, 'i'));
            if (province) searchTerms.push(new RegExp(province, 'i'));

            if (searchTerms.length > 0) {
                query.serviceAreas = { $in: searchTerms };
            }
        }

        const partners = await User.find(query)
            .select('name _id deliveryStatus vehicleDetails serviceAreas');

        res.json(partners);
    } catch (err) {
        next(err);
    }
}

// New: Get all covered service areas
export async function getServiceCoverage(req, res, next) {
    try {
        const partners = await User.find({ role: 'Delivery', isProfileComplete: true })
            .select('serviceAreas');

        const coverage = {};

        partners.forEach(p => {
            if (p.serviceAreas) {
                p.serviceAreas.forEach(areaString => {
                    // Expect format "City, Province"
                    const parts = areaString.split(',').map(s => s.trim());
                    if (parts.length >= 2) {
                        const city = parts[0];
                        const province = parts[1];

                        if (!coverage[province]) {
                            coverage[province] = new Set();
                        }
                        coverage[province].add(city);
                    }
                });
            }
        });

        // Convert Sets to Arrays
        const result = {};
        for (const [prov, cities] of Object.entries(coverage)) {
            result[prov] = Array.from(cities).sort();
        }

        res.json(result);
    } catch (err) {
        next(err);
    }
}
