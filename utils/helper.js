const generateRandomUsername = () => {
    const prefix = 'anonymous';
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    const username = `${prefix}${randomNumber}`;
    return username;
};

const generateRandomReferralCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const codeLength = 8;
    let referralCode = '';

    for (let i = 0; i < codeLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        referralCode += characters.charAt(randomIndex);
    }

    return referralCode;
};

module.exports = {
    generateRandomUsername,
    generateRandomReferralCode
};