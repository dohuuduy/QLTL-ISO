import { GOOGLE_SCRIPT_URL } from '../config';
import type { NhanSu } from '../types';
import { mockData } from '../data/mockData';

// Helper to check if the URL is the default placeholder
const isUrlConfigured = () => {
    return GOOGLE_SCRIPT_URL && 
           !GOOGLE_SCRIPT_URL.includes('AKfycbw-C_pFUfOYtzWPqwQ1kYgP6cucA5AVe4LTcENv-89COXalBqZejq6gwsAiH96lYZoB');
};

/**
 * A robust fetcher for Google Apps Script that uses a POST request with
 * FormData. This helps avoid CORS preflight issues that can occur with
 * 'application/json' or large 'text/plain' payloads, which often result
 * in "Failed to fetch" errors.
 *
 * NOTE FOR BACKEND: The Google Apps Script must be updated to read the
 * payload from `e.parameter.payload` instead of `e.postData.contents`.
 * e.g., `const payload = JSON.parse(e.parameter.payload);`
 */
const postToGAS = async (payload: object): Promise<any> => {
    const formData = new FormData();
    formData.append('payload', JSON.stringify(payload));
    
    // Using FormData avoids the need for a CORS preflight request, making the
    // call more reliable for large payloads. The browser will automatically set
    // the correct 'Content-Type: multipart/form-data'.
    const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: formData,
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network request failed: ${response.status} - ${errorText}`);
    }

    return response.json();
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