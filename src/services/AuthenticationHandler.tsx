import CryptoJS from 'crypto-js';

class AuthenticationHandler{

    public static getHashPassword(password: string): string {
        const hash = CryptoJS.SHA256(password);
        const base64Hash = hash.toString(CryptoJS.enc.Base64);
        return base64Hash;
    }
}

export default AuthenticationHandler;