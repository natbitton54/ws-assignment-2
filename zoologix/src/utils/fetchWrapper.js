/**
 * CustomError handles runtime exceptions with additional HTTP response details.
 * Extends the native Error object with HTTP status and error data.
 *
 * @class 
 * @extends {Error}
 * 
 * @author `NatBitton54`
 */
export class CustomError extends Error {
    constructor(message, statusCode, details) {
        super(message);
        this.name = 'CustomError';
        this.statusCode = statusCode;
        this.details = details;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * FetchWrapper provides a reusable interface for performing HTTP requests using the Fetch API.
 * Supports all common methods (GET, POST, PUT, DELETE) and includes unified error handling.
 *
 * @class 
 * @author `NatBitton54`
 */
export class FetchWrapper {
    /**
    * @param {string} baseURL - The root URL to prepend to each request.
    */
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    /**
      * Performs an HTTP request to the specified URI with given options.
      *
      * @param {string} uri - The endpoint path (relative to baseURL).
      * @param {object} [options={}] - Options including method, headers, and body.
      * @returns {Promise<object|string>} Parsed JSON or text response.
      * @throws {CustomError} Throws a wrapped error if fetch fails or response is not OK.
      * 
      * @author `NatBitton54`
      */
    async sendRequest(uri, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers
        };

        const fetchOptions = {
            method: options.method || 'GET',
            headers,
            body: options.body ? JSON.stringify(options.body) : null
        };

        const url = `${this.baseURL}${uri}`;
        console.log(`Making request to: ${url}`);

        try {
            const response = await fetch(url, fetchOptions);

            const isJSON = response.headers.get('Content-Type')?.includes('application/json');

            let responseData = null;
            if (isJSON) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            if (!response.ok) {
                throw new CustomError(
                    responseData?.message || response.statusText || 'Unknown error',
                    response.status,
                    responseData
                );
            }

            return responseData;
        } catch (error) {
            if (!(error instanceof CustomError)) {
                throw new CustomError(error.message || 'Network Error', 0, {});
            }
            throw error;
        }
    }

    /**
      * Sends a GET request.
      * @param {string} uri - Endpoint.
      * @param {object} [headers={}] - Optional headers.
      * @returns {Promise<any>}
      * 
      * @author `NatBitton54`
      */
    get(uri, headers = {}) {
        return this.sendRequest(uri, { method: 'GET', headers });
    }

    /**
    * Sends a POST request.
    * @param {string} uri - Endpoint.
    * @param {object} body - Request payload.
    * @param {object} [headers={}] - Optional headers.
    * @returns {Promise<any>}
    * 
    * @author `NatBitton54`
    */
    post(uri, body, headers = {}) {
        return this.sendRequest(uri, { method: 'POST', body, headers });
    }

     /**
     * Sends a PUT request
     * @param {string} uri - Endpoint.
     * @param {object} body - Request payload.
     * @param {object} [headers={}] - Optional headers.
     * @returns {Promise<any>}
     * 
     * @author `NatBitton54`
     */
    put(uri, body, headers = {}) {
        return this.sendRequest(uri, { method: 'PUT', body, headers });
    }

    /**
     * Sends a DELETE request.
     * @param {string} uri - Endpoint.
     * @param {object|null} [body=null] - Optional payload.
     * @param {object} [headers={}] - Optional headers.
     * @returns {Promise<any>}
     * 
     * @author `NatBitton54`
     */
    delete(uri, body = null, headers = {}) {
        return this.sendRequest(uri, { method: 'DELETE', body, headers });
    }
}
