export const PLATFORM_FEE_PERCENTAGE = 0.10; // 10% platform fee

export function calculateOrderFinancials(orderTotal, deliveryFee) {
    const productPrice = orderTotal - deliveryFee;
    const platformFee = productPrice * PLATFORM_FEE_PERCENTAGE;
    const sellerPayout = productPrice - platformFee;

    return {
        orderTotal,
        deliveryFee, // Goes to delivery partner
        productPrice,
        platformFee, // Goes to platform wallet
        sellerPayout // Goes to seller wallet
    };
}

export function aggregateFinancials(orders) {
    let totalPlatformProfit = 0;
    let totalSellerPayoutPending = 0;
    let totalDeliveryPayoutPending = 0;

    orders.forEach(order => {
        if (order.status === 'Completed' && !order.payoutReleased) {
            const finance = calculateOrderFinancials(order.amount, order.deliveryFee);
            totalPlatformProfit += finance.platformFee;
            totalSellerPayoutPending += finance.sellerPayout;
            totalDeliveryPayoutPending += finance.deliveryFee;
        }
    });

    return {
        totalPlatformProfit,
        totalSellerPayoutPending,
        totalDeliveryPayoutPending
    };
}
