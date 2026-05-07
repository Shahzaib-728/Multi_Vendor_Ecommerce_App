/**
 * Validates a Pakistani phone number.
 * Must start with 03 and have exactly 11 digits.
 * @param {string} phone 
 * @returns {boolean}
 */
export const isValidPakPhone = (phone) => {
    const v = String(phone || '').trim();
    if (!v) return false;
    if (/^\+92\d{10}$/.test(v)) return true;
    if (/^92\d{10}$/.test(v)) return true;
    return /^03\d{9}$/.test(v);
};

/**
 * Handles phone input change by stripping non-numeric characters 
 * and limiting length to 11 digits.
 * @param {string} value 
 * @param {Function} callback 
 */
export const handlePhoneChange = (value, callback) => {
    const digits = String(value || '').replace(/\D/g, '');
    if (!digits) {
        callback('');
        return;
    }

    if (digits.startsWith('92')) {
        const limited = digits.slice(0, 12);
        if (limited.length === 12) {
            callback(`0${limited.slice(2)}`);
        } else {
            callback(limited);
        }
        return;
    }

    callback(digits.slice(0, 11));
};

/**
 * Returns an error message if the phone number is invalid.
 * @param {string} phone 
 * @returns {string|null}
 */
export const getPhoneErrorMessage = (phone) => {
    const v = String(phone || '').trim();
    if (!v) return 'Phone number is required';
    if (!isValidPakPhone(v)) return 'Use 03XXXXXXXXX or +92XXXXXXXXXX';
    return null;
};

/**
 * Validates an email address.
 * @param {string} email 
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
};

/**
 * Returns an error message for email.
 */
export const getEmailErrorMessage = (email) => {
    if (!email) return 'Email is required';
    if (!isValidEmail(email)) return 'Invalid email format';
    return null;
};

/**
 * Validates a full name.
 * Allows only letters, spaces, dots and hyphens.
 */
export const isValidName = (name) => {
    return /^[a-zA-Z\s.-]{2,}$/.test(name?.trim());
};

/**
 * Returns an error message for name.
 */
export const getNameErrorMessage = (name) => {
    if (!name) return 'Name is required';
    if (name.trim().length < 2) return 'At least 2 characters';
    if (!isValidName(name)) return 'Only letters and spaces allowed';
    return null;
};

/**
 * Validates Pakistani NTN (1234567-8)
 */
export const isValidNTN = (ntn) => {
    return /^\d{7}-\d{1}$/.test(ntn);
};

/**
 * Validates Pakistani STRN (13 digits)
 */
export const isValidSTRN = (strn) => {
    return /^\d{13}$/.test(strn);
};

/**
 * Validates Bank Account Number (Min 10 digits)
 */
export const isValidBankAccount = (acc) => {
    const v = String(acc || '').trim();
    if (!v) return false;
    if (/^\d{10,20}$/.test(v)) return true;
    const normalized = v.replace(/\s+/g, '').toUpperCase();
    return /^PK\d{2}[A-Z]{4}\d{16}$/.test(normalized);
};

export const handlePostalCodeChange = (value, callback) => {
    const cleaned = String(value || '').replace(/\D/g, '').slice(0, 5);
    callback(cleaned);
};

export const isValidPakPostalCode = (zip) => {
    return /^\d{5}$/.test(String(zip || '').trim());
};

export const getPostalCodeErrorMessage = (zip) => {
    const v = String(zip || '').trim();
    if (!v) return 'ZIP code is required';
    if (!isValidPakPostalCode(v)) return 'Must be 5 digits';
    return null;
};

export const isValidCNIC = (cnic) => {
    return /^\d{5}-\d{7}-\d{1}$/.test(String(cnic || '').trim());
};

export const getCNICErrorMessage = (cnic) => {
    const v = String(cnic || '').trim();
    if (!v) return 'CNIC is required';
    if (!isValidCNIC(v)) return 'Format: 12345-1234567-1';
    return null;
};

const getRequiredTextErrorMessage = (value, label, minLen = 2) => {
    const v = String(value || '').trim();
    if (!v) return `${label} is required`;
    if (v.length < minLen) return `At least ${minLen} characters`;
    return null;
};

export const isValidStoreName = (name) => {
    return /^[a-zA-Z0-9\s.&'()-]{3,}$/.test(String(name || '').trim());
};

export const getStoreNameErrorMessage = (name) => {
    const v = String(name || '').trim();
    if (!v) return 'Store name is required';
    if (v.length < 3) return 'At least 3 characters';
    if (!isValidStoreName(v)) return 'Invalid characters';
    return null;
};

export const isValidOrderId = (id) => {
    const v = String(id || '').trim();
    return /^[a-zA-Z0-9-]{3,}$/.test(v);
};

export const getOrderIdErrorMessage = (id) => {
    const v = String(id || '').trim();
    if (!v) return 'Order ID is required';
    if (!isValidOrderId(v)) return 'Use letters, numbers, and hyphens only';
    return null;
};

export const getPositiveIntErrorMessage = (value, label, max = 10000000) => {
    const v = String(value ?? '').trim();
    if (v === '') return `${label} is required`;
    if (!/^\d+$/.test(v)) return 'Numbers only';
    const n = Number(v);
    if (!Number.isFinite(n)) return 'Invalid number';
    if (n <= 0) return `${label} must be greater than 0`;
    if (n > max) return `Max ${max}`;
    return null;
};

export const getNonNegativeIntErrorMessage = (value, label, max = 10000000) => {
    const v = String(value ?? '').trim();
    if (v === '') return `${label} is required`;
    if (!/^\d+$/.test(v)) return 'Numbers only';
    const n = Number(v);
    if (!Number.isFinite(n)) return 'Invalid number';
    if (n < 0) return `${label} cannot be negative`;
    if (n > max) return `Max ${max}`;
    return null;
};

export const getSupportSearchQueryErrorMessage = (query) => {
    const v = String(query ?? '').trim();
    if (!v) return 'Search query is required';
    if (v.length < 2) return 'At least 2 characters';
    if (v.includes('@')) return isValidEmail(v) ? null : 'Invalid email format';
    if (/^ord-/i.test(v)) return isValidOrderId(v) ? null : 'Use letters, numbers, and hyphens only';
    if (/^[0-9a-f]{24}$/i.test(v)) return null;
    if (!/^[a-zA-Z0-9\s@._#-]+$/.test(v)) return 'Invalid characters';
    return null;
};

/**
 * Helper for real-time validation of various fields.
 */
export const validateField = (name, value) => {
    switch (name) {
        case 'email': return getEmailErrorMessage(value);
        case 'phone': return getPhoneErrorMessage(value);
        case 'phoneNumber': return getPhoneErrorMessage(value);
        case 'businessPhone': return getPhoneErrorMessage(value);
        case 'name': return getNameErrorMessage(value);
        case 'receiverName': return getNameErrorMessage(value);
        case 'fullName': return getNameErrorMessage(value);
        case 'storeName': return getStoreNameErrorMessage(value);
        case 'role': return value ? null : 'Role is required';
        case 'street': return getRequiredTextErrorMessage(value, 'Street address', 3);
        case 'area': return getRequiredTextErrorMessage(value, 'Area', 2);
        case 'city': return getRequiredTextErrorMessage(value, 'City', 2);
        case 'province': return getRequiredTextErrorMessage(value, 'Province', 2);
        case 'country': return getRequiredTextErrorMessage(value, 'Country', 2);
        case 'zipCode': return getPostalCodeErrorMessage(value);
        case 'cnicNumber': return getCNICErrorMessage(value);
        case 'orderId': return getOrderIdErrorMessage(value);
        case 'businessAddress': return getRequiredTextErrorMessage(value, 'Business address', 6);
        case 'bankName': return getRequiredTextErrorMessage(value, 'Bank name', 2);
        case 'swiftRoutingCode': return getRequiredTextErrorMessage(value, 'SWIFT / Branch identifier', 3);
        case 'accountHolder': return getNameErrorMessage(value);
        case 'ntnNumber': return isValidNTN(value) ? null : 'Format: 1234567-8';
        case 'strnNumber': return isValidSTRN(value) ? null : 'Must be 13 digits';
        case 'accountNumber': return isValidBankAccount(value) ? null : 'Use PK IBAN or 10-20 digits';
        case 'password': return value?.length >= 6 ? null : 'At least 6 characters';
        case 'price': return getPositiveIntErrorMessage(value, 'Price', 10000000);
        case 'discountPrice': return String(value ?? '').trim() === '' ? null : getNonNegativeIntErrorMessage(value, 'Discount price', 10000000);
        case 'stock': return getNonNegativeIntErrorMessage(value, 'Stock', 1000000);
        case 'supportSearchQuery': return getSupportSearchQueryErrorMessage(value);
        default: return null;
    }
};
