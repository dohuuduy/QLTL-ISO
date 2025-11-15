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

    let response;
    try {
        response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: params,
        });
    } catch (e) {
        if (e instanceof TypeError && (e.message.includes('Failed to fetch') || e.message.includes('Network request failed'))) {
            // This specific error is often due to CORS or network issues.
            // Throw a specific error type that high-level components are checking for.
            throw new TypeError('Failed to fetch');
        }
        // Re-throw other unexpected errors
        throw e;
    }
    
    if (!response.ok) {
        const errorText = await response.text();
        const shortError = errorText.length > 500 ? errorText.substring(0, 500) + '...' : errorText;
        console.error(`GAS request failed with status ${response.status}:`, shortError);
        throw new Error(`Yêu cầu đến máy chủ thất bại với mã lỗi: ${response.status}.`);
    }

    const textResponse = await response.text();
    try {
        return JSON.parse(textResponse);
    } catch (e) {
        console.error("Failed to parse JSON response from GAS:", textResponse);
        throw new Error("Phản hồi không hợp lệ từ máy chủ. Vui lòng kiểm tra lại quá trình triển khai Google Apps Script.");
    }
};


/**
 * Fetches all data from the Google Sheets backend.
 * @returns A promise that resolves with all the application data.
 * @throws An error if the network request fails.
 */
export const getAllData = async (): Promise<typeof mockData> => {
    if (!isUrlConfigured()) {
        console.error("Google Apps Script URL is not configured. Please update config.ts");
        throw new Error("Ứng dụng chưa được cấu hình. Vui lòng liên hệ quản trị viên để cập nhật URL Google Apps Script.");
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
        throw new Error("Ứng dụng chưa được cấu hình. Không thể lưu dữ liệu.");
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
        console.error("Google Apps Script URL is not configured. Please update config.ts");
        throw new Error("Ứng dụng chưa được cấu hình. Vui lòng liên hệ quản trị viên.");
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

/**
 * Sends a request to the Google Apps Script to send an email.
 * @param to The recipient's email address.
 * @param subject The email subject.
 * @param body The email body, which can be HTML.
 */
export const sendEmail = async (to: string, subject: string, body: string): Promise<void> => {
    if (!isUrlConfigured()) {
        console.warn("Skipping email send: GOOGLE_SCRIPT_URL not configured.");
        return; // Silently fail if not configured
    }

    try {
        const result = await postToGAS({
            action: 'sendEmail',
            to,
            subject,
            body
        });
        if (result.status === 'error') {
            console.error('Failed to send email via GAS:', result.message);
        } else {
            console.log('Email request sent successfully to:', to);
        }
    } catch (error) {
        console.error('Error calling sendEmail API:', error);
    }
};