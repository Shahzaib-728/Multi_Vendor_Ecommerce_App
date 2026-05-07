export const formatCurrency = (amount) => {
    return `Rs. ${new Intl.NumberFormat('en-PK', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount || 0)}`
}
