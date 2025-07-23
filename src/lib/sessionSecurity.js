/**
 * Session Security Utilities
 * Implements CSRF protection, secure token generation, and data validation
 */

import CryptoJS from 'crypto-js';

class SessionSecurity {
  constructor() {
    this.secretKey = this.generateSecretKey();
    this.csrfTokens = new Map();
  }

  // Generate a secure secret key for encryption
  generateSecretKey() {
    if (typeof window !== 'undefined') {
      let key = localStorage.getItem('session_secret_key');
      if (!key) {
        key = CryptoJS.lib.WordArray.random(256/8).toString();
        localStorage.setItem('session_secret_key', key);
      }
      return key;
    }
    return 'fallback_key_for_ssr';
  }

  // Generate secure session ID
  generateSessionId() {
    const timestamp = Date.now();
    const random = CryptoJS.lib.WordArray.random(128/8).toString();
    const fingerprint = this.generateFingerprint();
    return `${timestamp}_${random}_${fingerprint}`;
  }

  // Generate browser fingerprint for additional security
  generateFingerprint() {
    if (typeof window === 'undefined') return 'ssr_fingerprint';
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Session fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    return CryptoJS.SHA256(fingerprint).toString().substring(0, 16);
  }

  // Encrypt sensitive data
  encryptData(data) {
    try {
      const jsonString = JSON.stringify(data);
      const encrypted = CryptoJS.AES.encrypt(jsonString, this.secretKey).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  }

  // Decrypt sensitive data
  decryptData(encryptedData) {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  // Generate CSRF token
  generateCSRFToken() {
    const token = CryptoJS.lib.WordArray.random(256/8).toString();
    const expiry = Date.now() + (60 * 60 * 1000); // 1 hour expiry
    
    this.csrfTokens.set(token, expiry);
    
    // Clean up expired tokens
    this.cleanupExpiredTokens();
    
    return token;
  }

  // Validate CSRF token
  validateCSRFToken(token) {
    if (!token || !this.csrfTokens.has(token)) {
      return false;
    }
    
    const expiry = this.csrfTokens.get(token);
    if (Date.now() > expiry) {
      this.csrfTokens.delete(token);
      return false;
    }
    
    return true;
  }

  // Clean up expired CSRF tokens
  cleanupExpiredTokens() {
    const now = Date.now();
    for (const [token, expiry] of this.csrfTokens.entries()) {
      if (now > expiry) {
        this.csrfTokens.delete(token);
      }
    }
  }

  // Validate session data integrity
  validateSessionData(sessionData) {
    if (!sessionData || typeof sessionData !== 'object') {
      return false;
    }

    // Check required fields
    const requiredFields = ['sessionId', 'lastActivity', 'expiresAt'];
    for (const field of requiredFields) {
      if (!sessionData[field]) {
        return false;
      }
    }

    // Check session expiry
    if (Date.now() > sessionData.expiresAt) {
      return false;
    }

    // Validate session ID format
    const sessionIdPattern = /^\d+_[a-f0-9]+_[a-f0-9]{16}$/;
    if (!sessionIdPattern.test(sessionData.sessionId)) {
      return false;
    }

    return true;
  }

  // Sanitize user input
  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    return input
      .replace(/[<>]/g, '') // Remove potential XSS characters
      .trim()
      .substring(0, 1000); // Limit length
  }

  // Generate secure headers for API requests
  getSecureHeaders(csrfToken) {
    return {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      'X-Requested-With': 'XMLHttpRequest'
    };
  }
}

// Export singleton instance
export const sessionSecurity = new SessionSecurity();
export default sessionSecurity;