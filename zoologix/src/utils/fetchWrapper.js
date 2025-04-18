import Swal from 'sweetalert2';

/**
 * 
 * Custom error class to handle detailed error information.
 * Includes an HTTP status code and any additional details
 * from the server's response (if available).
 * 
 * @author `NatBitton54`
 */

export class CustomError extends Error {
    constructor(message, statusCode, details) {
        super(message);
        this.name = 'CustomError';
        this.statusCode = statusCode;
        this.details = details;

        // Maintains proper stack trace for where our error was thrown (only available on V8 engines).
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * 
 * A wrapper class for making HTTP requests using the Fetch API.
 * Applies default settings if they are not provided in the `options`.
 * 
 * @author `NatBitton54`
 */
export class FetchWrapper {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async sendRequest(uri, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers
        };

        const fetchOptions = {
            method: options.method || 'GET', // Default to GET if no method specified
            headers,
            body: options.body ? JSON.stringify(options.body) : null, // Only set body if provided
        };

        const url = `${this.baseURL}${uri}`;
        console.log(`Making request to: ${url}`);

        try {
            const response = await fetch(url, fetchOptions);
            if (!response.ok) {
                const errorDetails = await response.json().catch(() => ({ message: response.statusText }));
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: `Request failed with status ${response.status}: ${errorDetails.message}`,
                });
                throw new CustomError(`Request failed with status ${response.status}`, response.status, errorDetails);
            }

            const data = await response.json();
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Your request was processed successfully!',
            });
            return data;
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Network Error',
                text: error.message,
            });
            throw error;  // Continue to throw to allow calling code to handle it further if needed
        }
    }

    get(uri, headers = {}) {
        return this.sendRequest(uri, { headers });
    }

    post(uri, body, headers = {}) {
        return this.sendRequest(uri, { method: 'POST', body, headers });
    }

    delete(uri, headers = {}) {
        return this.sendRequest(uri, { method: 'DELETE', headers });
    }
}
