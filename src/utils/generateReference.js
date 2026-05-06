// Generates a human-readable booking reference like "SEBS-A1B2C3"
const generateReference = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `SEBS-${code}`;
};

module.exports = generateReference;