// This function checks if the token is expired
const isTokenExpired = (expiresAt) => {
    return Date.now() >= expiresAt * 1000;
};

// Refresh token logic or re-login
const handleTokenExpiration = () => {
    localStorage.removeItem('sb-svlrsvxrzxkqrhhpwkzw-auth-token');
    localStorage.removeItem('parentId');
    localStorage.removeItem('googleId');
    localStorage.removeItem('token');

    alert("Session expired! Please log in to continue.")

    window.location.replace('/login')
};

const validateGoogleToken = () => {
    const accessToken = JSON.parse(localStorage.getItem('sb-svlrsvxrzxkqrhhpwkzw-auth-token'));
    const expiresAt = parseInt(accessToken?.expires_at || '0');

    if (accessToken && expiresAt) {
        if (isTokenExpired(expiresAt)) {
            handleTokenExpiration();
            return false
        }
    }

    return true
}

module.exports = {
    validateGoogleToken,
};