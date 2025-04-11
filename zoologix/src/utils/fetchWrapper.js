import Swal from 'sweetalert2';

/**
 * @author `Nat Bitton`
 * Custom error class to handle detailed error information.
 * Includes an HTTP status code and any additional details
 * from the server's response (if available).
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
 * @author `Nat Bitton`
 * A wrapper class for making HTTP requests using the Fetch API.
 * Applies default settings if they are not provided in the `options`.
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

/**
 * Loads the navbar from nav.html, inserts the CSS file if needed,
 * and places the resulting HTML in a specified placeholder.
 *
 * By using a ROOT_PATH constant, we can avoid confusing relative paths
 * across different subfolders or pages.
 * @author `Nat Bitton`
 * @param {string} placeholderId - The ID of the element where nav.html should be injected.
 */

const ROOT_PATH = '/ws-assignment2/';

export async function loadNavbar(placeholderId) {
    const navbarEl = document.getElementById(placeholderId);
    if (!navbarEl) {
        console.error(`Element with ID '${placeholderId}' not found.`);
        return;
    }

    try {
        const navUrl = `${ROOT_PATH}/html/nav.html`;
        const response = await fetch(navUrl);

        if (!response.ok) {
            throw new CustomError(
                `Failed to load navbar: ${response.statusText}`,
                response.status
            );
        }

        const html = await response.text();
        navbarEl.innerHTML = html;
    } catch (error) {
        throw new CustomError(
            `Failed to load navbar: ${error.message}`,
            error.statusCode,
            error.details
        );
    }
}