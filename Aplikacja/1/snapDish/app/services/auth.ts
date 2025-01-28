import { SERVER_URL } from '@/app/config';

const validateCredentials = (email: string, password: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Username must be a valid email address');
    }
    if (password.length < 6 || password.length > 128) {
        throw new Error('Password must be between 6 and 128 characters');
    }
};

export const login = async (email: string, password: string) => {
    validateCredentials(email, password);

    const formData = new URLSearchParams();
    formData.append('username', email); // Note the change here
    formData.append('password', password);

    try {
        console.log('Sending login request to:', `${SERVER_URL}/token`);

        const response = await fetch(`${SERVER_URL}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        });

        console.log('Response status:', response.status);
        console.log('Response status text:', response.statusText);

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        console.log('Login successful', data);

        return data;
    } catch (error) {
        if (error instanceof TypeError) {
            console.error('Network request failed. Please check your internet connection and server URL.');
        } else {
            console.error('Error logging in:', error);
        }
        throw error;
    }
};

export const register = async (email: string, password: string) => {
    validateCredentials(email, password);

    const queryParams = new URLSearchParams({
        email: email,
        password: password,
    }).toString();

    try {
        console.log('Sending register request to:', `${SERVER_URL}/register?${queryParams}`);

        const response = await fetch(`${SERVER_URL}/register?${queryParams}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        console.log('Response status:', response.status);
        console.log('Response status text:', response.statusText);

        if (!response.ok) {
            throw new Error('Registration failed');
        }

        const data = await response.json();
        console.log('Registration successful', data);

        return data;
    } catch (error) {
        if (error instanceof TypeError) {
            console.error('Network request failed. Please check your internet connection and server URL.');
        } else {
            console.error('Error registering:', error);
        }
        throw error;
    }
};