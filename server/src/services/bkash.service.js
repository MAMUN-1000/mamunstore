/**
 * bKash Payment Service (Tokenized Checkout v1.2.0-beta)
 * Communicates with official bKash Tokenized Checkout APIs via native fetch.
 * All credentials are strictly read from process.env.
 */

let cachedToken = null;
let tokenExpiryTime = 0;

/**
 * Helper to ensure required environment variables are configured
 */
const getBkashConfig = () => {
  const baseURL = process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';
  const username = process.env.BKASH_USERNAME;
  const password = process.env.BKASH_PASSWORD;
  const appKey = process.env.BKASH_APP_KEY;
  const appSecret = process.env.BKASH_APP_SECRET;
  const callbackURL = process.env.BKASH_CALLBACK_URL;

  if (!username || !password || !appKey || !appSecret) {
    const error = new Error('bKash credentials are not fully configured in environment variables.');
    error.status = 500;
    throw error;
  }

  return { baseURL, username, password, appKey, appSecret, callbackURL };
};

/**
 * 1. Grant Token:
 * Obtains an id_token using App Key, App Secret, Username, and Password.
 * Caches token in memory for up to 55 minutes to minimize redundant requests.
 */
export const grantToken = async () => {
  const { baseURL, username, password, appKey, appSecret } = getBkashConfig();

  // Return cached token if valid (with 5-minute safety buffer)
  if (cachedToken && Date.now() < tokenExpiryTime - 300000) {
    return cachedToken;
  }

  try {
    const response = await fetch(`${baseURL}/tokenized/checkout/token/grant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        username,
        password,
      },
      body: JSON.stringify({
        app_key: appKey,
        app_secret: appSecret,
      }),
      signal: AbortSignal.timeout(30000), // 30-second timeout recommended by bKash
    });

    const data = await response.json();

    if (!response.ok || data.statusCode !== '0000' || !data.id_token) {
      const errorMsg = data.statusMessage || `Failed to grant bKash token (HTTP ${response.status})`;
      const error = new Error(errorMsg);
      error.status = 502;
      error.details = data;
      throw error;
    }

    cachedToken = data.id_token;
    // expires_in is typically 3600 seconds
    const expiresInMs = (parseInt(data.expires_in, 10) || 3600) * 1000;
    tokenExpiryTime = Date.now() + expiresInMs;

    return cachedToken;
  } catch (err) {
    if (err.name === 'TimeoutError') {
      const error = new Error('bKash token service timed out after 30 seconds.');
      error.status = 504;
      throw error;
    }
    throw err;
  }
};

/**
 * 2. Create Payment:
 * Initiates a payment session on bKash and receives paymentID and bkashURL for customer redirect.
 */
export const createPayment = async ({
  amount,
  orderId,
  payerReference = '01770618575',
  merchantInvoiceNumber,
}) => {
  const { baseURL, appKey, callbackURL } = getBkashConfig();
  const idToken = await grantToken();

  const formattedAmount = typeof amount === 'number' ? amount.toFixed(2) : parseFloat(amount).toFixed(2);
  const invoiceNumber = merchantInvoiceNumber || `INV-${orderId}-${Date.now()}`;
  const effectiveCallback = callbackURL
    ? `${callbackURL}${callbackURL.includes('?') ? '&' : '?'}orderId=${orderId}`
    : `http://localhost:5000/api/bkash/callback?orderId=${orderId}`;

  try {
    const response = await fetch(`${baseURL}/tokenized/checkout/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: idToken,
        'X-APP-Key': appKey,
      },
      body: JSON.stringify({
        mode: '0011',
        payerReference,
        callbackURL: effectiveCallback,
        amount: formattedAmount,
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: invoiceNumber,
      }),
      signal: AbortSignal.timeout(30000),
    });

    const data = await response.json();

    if (!response.ok || data.statusCode !== '0000' || !data.bkashURL) {
      const errorMsg = data.statusMessage || `Failed to create bKash payment (HTTP ${response.status})`;
      const error = new Error(errorMsg);
      error.status = 502;
      error.details = data;
      throw error;
    }

    return {
      paymentID: data.paymentID,
      bkashURL: data.bkashURL,
      callbackURL: data.callbackURL,
      merchantInvoiceNumber: invoiceNumber,
      amount: data.amount,
      statusCode: data.statusCode,
      statusMessage: data.statusMessage,
    };
  } catch (err) {
    if (err.name === 'TimeoutError') {
      const error = new Error('bKash payment creation timed out after 30 seconds.');
      error.status = 504;
      throw error;
    }
    throw err;
  }
};

/**
 * 3. Execute Payment:
 * Finalizes the payment after the customer completes authorization on the bKash payment page.
 */
export const executePayment = async (paymentID) => {
  if (!paymentID || typeof paymentID !== 'string') {
    const error = new Error('Valid paymentID is required to execute payment.');
    error.status = 400;
    throw error;
  }

  const { baseURL, appKey } = getBkashConfig();
  const idToken = await grantToken();

  try {
    const response = await fetch(`${baseURL}/tokenized/checkout/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: idToken,
        'X-APP-Key': appKey,
      },
      body: JSON.stringify({ paymentID }),
      signal: AbortSignal.timeout(30000),
    });

    const data = await response.json();

    return {
      statusCode: data.statusCode,
      statusMessage: data.statusMessage,
      paymentID: data.paymentID || paymentID,
      trxID: data.trxID,
      transactionStatus: data.transactionStatus,
      amount: data.amount,
      currency: data.currency,
      customerMsisdn: data.customerMsisdn,
      paymentExecuteTime: data.paymentExecuteTime,
      merchantInvoiceNumber: data.merchantInvoiceNumber,
      rawResponse: data,
    };
  } catch (err) {
    if (err.name === 'TimeoutError') {
      const error = new Error('bKash payment execution timed out after 30 seconds.');
      error.status = 504;
      throw error;
    }
    throw err;
  }
};

/**
 * 4. Query Payment:
 * Queries the transaction status for an existing paymentID.
 */
export const queryPayment = async (paymentID) => {
  if (!paymentID) {
    const error = new Error('Valid paymentID is required to query payment.');
    error.status = 400;
    throw error;
  }

  const { baseURL, appKey } = getBkashConfig();
  const idToken = await grantToken();

  try {
    const response = await fetch(`${baseURL}/tokenized/checkout/payment/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: idToken,
        'X-APP-Key': appKey,
      },
      body: JSON.stringify({ paymentID }),
      signal: AbortSignal.timeout(30000),
    });

    const data = await response.json();
    return data;
  } catch (err) {
    if (err.name === 'TimeoutError') {
      const error = new Error('bKash payment query timed out after 30 seconds.');
      error.status = 504;
      throw error;
    }
    throw err;
  }
};
