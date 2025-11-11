import { GOOGLE_SCRIPT_URL } from '../config';
import type { NhanSu } from '../types';
import { mockData } from '../data/mockData';

// Helper to check if the URL is the default placeholder
const isUrlConfigured = () => {
    return GOOGLE_SCRIPT_URL && 
           !GOOGLE_SCRIPT_URL.includes('AKfycbw-C_pFUfOYtzWPqwQ1kYgP6cucA5AVe4LTcENv-89COXalBqZejq6gwsAiH96lYZoB');
};

/**
 * A robust fetcher for Google Apps Script that uses a POST request.
 * It sends data as 'application/x-www-form-urlencoded' which is a "simple request"
 * type that avoids CORS preflight issues.
 *
 * NOTE FOR BACKEND: The Google Apps Script must read the payload from `e.parameter.payload`.
 * e.g., `const payload = JSON.parse(e.parameter.payload);`
 */
const postToGAS = async (payload: object): Promise<any> => {
    const params = new URLSearchParams();
    params.append('payload', JSON.stringify(payload));

    const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: params,
        // No Content-Type header is needed; URLSearchParams sets it automatically.
        // The mode 'no-cors' is not used here because we need to read the response.
        // redirect: 'follow' is the default and usually correct for Apps Script.
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network request failed: ${response.status} - ${errorText}`);
    }

    // The Apps Script is expected to return a JSON response with 'Content-Type: application/json'.
    // If it returns 'text/plain' or an HTML error page, .json() will fail. We handle this gracefully.
    const textResponse = await response.text();
    try {
        return JSON.parse(textResponse);
    } catch (e) {
        console.error("Failed to parse JSON response:", textResponse);
        throw new Error("Invalid response from server. Check the Google Apps Script deployment and logs.");
    }
};


/**
 * Fetches all data from the Google Sheets backend.
 * @returns A promise that resolves with all the application data.
 * @throws An error if the network request fails.
 */
export const getAllData = async (): Promise<typeof mockData> => {
    if (!isUrlConfigured()) {
        console.warn("Google Apps Script URL not configured, falling back to mock data.");
        return Promise.resolve(mockData);
    }
    
    try {
        const data = await postToGAS({ action: 'getAllData' });
        console.log('Data loaded successfully from Google Sheets');
        return data;
    } catch (error) {
        console.error('Failed to fetch data from Google Sheets:', error);
        throw error;
    }
};

/**
 * Updates all data in the Google Sheets backend.
 * @param updatedData The entire data object to be saved.
 * @throws An error if the network request fails.
 */
export const updateAllData = async (updatedData: typeof mockData): Promise<void> => {
    if (!isUrlConfigured()) {
        console.warn("Skipping remote update: GOOGLE_SCRIPT_URL not configured.");
        return;
    }
    
    try {
        const result = await postToGAS({
            action: 'updateAllData',
            data: updatedData
        });
        
        if (result.status === 'error') {
            throw new Error(result.message || 'Update failed');
        }
        console.log('Data updated successfully in Google Sheets');
        
    } catch (error) {
        console.error('Failed to update data in Google Sheets:', error);
        throw error;
    }
};

/**
 * Attempts to log in a user with the provided credentials.
 * @param username The user's username.
 * @param password The user's password.
 * @returns A promise that resolves with the user object on success, or null on failure.
 * @throws An error if the network request fails.
 */
export const login = async (username: string, password: string): Promise<NhanSu | null> => {
    if (!isUrlConfigured()) {
        console.warn("Google Apps Script URL not configured, attempting login with mock data.");
        const user = mockData.nhanSu.find(u => 
            u.ten_dang_nhap === username && u.mat_khau === password
        );
        return user || null;
    }

    try {
        const result = await postToGAS({ 
            action: 'login', 
            username, 
            password 
        });
        
        if (result.status === 'success' && result.user) {
            console.log('Login successful');
            return result.user;
        }
        
        console.log('Login failed:', result.message);
        return null;
        
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};