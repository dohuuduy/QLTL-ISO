import { GOOGLE_SCRIPT_URL } from '../config';
import type { NhanSu } from '../types';
import { mockData } from '../data/mockData';

// Helper to check if the URL is the default placeholder
const isUrlConfigured = () => {
    return GOOGLE_SCRIPT_URL && 
           !GOOGLE_SCRIPT_URL.includes('AKfycbw-C_pFUfOYtzWPqwQ1kYgP6cucA5AVe4LTcENv-89COXalBqZejq6gwsAiH96lYZoB');
};

/**
 * Fetches all data from the Google Sheets backend.
 * @returns A promise that resolves with all the application data.
 * @throws An error if the network request fails.
 */
export const getAllData = async (): Promise<typeof mockData> => {
    if (!isUrlConfigured()) {
        console.warn("Google Apps Script URL not configured, falling back to mock data.");
        return mockData;
    }
    
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify({
                action: 'getAllData'
            }),
            redirect: 'follow',
            mode: 'cors'
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Lỗi mạng khi tải dữ liệu: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
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
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify({
                action: 'updateAllData',
                data: updatedData
            }),
            redirect: 'follow',
            mode: 'cors'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Lỗi mạng khi cập nhật dữ liệu: ${response.status} - ${errorText}`);
        }
        
        const responseText = await response.text();
        try {
            if (responseText) {
                const result = JSON.parse(responseText);
                if (result.status === 'error') {
                    throw new Error(result.message || 'Update failed');
                }
                console.log('Data updated successfully in Google Sheets');
            }
        } catch (e) {
            if (e instanceof SyntaxError) {
                console.error("Failed to parse update response as JSON, but request was successful.", responseText);
            } else {
                throw e;
            }
        }
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
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'text/plain'
            },
            body: JSON.stringify({ 
                action: 'login', 
                username, 
                password 
            }),
            redirect: 'follow',
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error(`Yêu cầu đăng nhập thất bại với mã trạng thái ${response.status}`);
        }

        const result = await response.json();
        
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