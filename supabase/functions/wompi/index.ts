// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js"
// Using native crypto for signatures instead of external libraries

// Declare Deno namespace for TypeScript
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Promise<Response>): void;
};

// Environment variables for Wompi configuration
const WOMPI_PUBLIC_KEY = Deno.env.get('WOMPI_PUBLIC_KEY') || 'pub_test_XXXXXXXX'; // Replace with your actual test key
const WOMPI_PRIVATE_KEY = Deno.env.get('WOMPI_PRIVATE_KEY') || 'prv_test_XXXXXXXX'; // Replace with your actual test key
const WOMPI_API_URL = 'https://sandbox.wompi.co/v1'; // Use production URL for production environment
const WOMPI_EVENTS_KEY = Deno.env.get('WOMPI_EVENTS_KEY') || 'test_events_key'; // Webhook verification key

// Environment variables for Supabase
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

// Type definitions for Wompi responses
interface WompiMerchantResponse {
  data: {
    id: string;
    name: string;
    email: string;
    presigned_acceptance: {
      acceptance_token: string;
      permalink: string;
      type: string;
    };
    presigned_personal_data_auth: {
      acceptance_token: string;
      permalink: string;
      type: string;
    };
  };
}

// Payment method interfaces for different payment types
interface WompiPaymentMethodBase {
  type: string;
  phone_number?: string;
}

interface WompiCardPaymentMethod extends WompiPaymentMethodBase {
  type: 'CARD';
  installments?: number;
  card: {
    last_four: string;
    brand: string;
    exp_month: string;
    exp_year: string;
  };
}

interface WompiNequiPaymentMethod extends WompiPaymentMethodBase {
  type: 'NEQUI';
  phone_number: string;
}

interface WompiPSEPaymentMethod extends WompiPaymentMethodBase {
  type: 'PSE';
  financial_institution_code: string;
  payment_description?: string;
}

interface WompiOtherPaymentMethod extends WompiPaymentMethodBase {
  [key: string]: unknown;
}

type WompiPaymentMethod = 
  | WompiCardPaymentMethod 
  | WompiNequiPaymentMethod 
  | WompiPSEPaymentMethod
  | WompiOtherPaymentMethod;

interface WompiTransaction {
  id: string;
  amount_in_cents: number;
  reference: string;
  currency: string;
  payment_method_type: string;
  redirect_url?: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR' | 'VOIDED';
  payment_method: WompiPaymentMethod;
  customer_email: string;
  customer_data?: CustomerData;
}

interface CustomerData {
  full_name: string;
  phone_number?: string;
  legal_id?: string;
  legal_id_type?: string;
}

interface CreateTransactionRequest {
  amount_in_cents: number;
  currency: string;
  customer_email: string;
  payment_method: {
    type: string;
    [key: string]: unknown;
  };
  redirect_url?: string;
  reference: string;
  customer_data?: CustomerData;
}

// Utility function to get the Supabase client
const getSupabaseClient = () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
};

// Utility function to fetch acceptance tokens from Wompi
async function getAcceptanceTokens(): Promise<{
  acceptance_token: string;
  personal_data_token: string;
}> {
  const response = await fetch(`${WOMPI_API_URL}/merchants/${WOMPI_PUBLIC_KEY}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch merchant data: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json() as WompiMerchantResponse;
  
  return {
    acceptance_token: data.data.presigned_acceptance.acceptance_token,
    personal_data_token: data.data.presigned_personal_data_auth.acceptance_token
  };
}

// Generate signature for transaction integrity
async function generateSignature(amount: number, currency: string, reference: string): Promise<string> {
  const amountInCents = amount * 100;
  const stringToHash = `${amountInCents}${currency}${reference}${WOMPI_PRIVATE_KEY}`;
  
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(stringToHash)
  );
  
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Verify webhook signature from Wompi
async function verifyWebhookSignature(request: Request): Promise<boolean> {
  try {
    const signature = request.headers.get('X-Signature');
    if (!signature) return false;
    
    const body = await request.clone().text();
    const stringToVerify = body + WOMPI_EVENTS_KEY;
    const computedSignature = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(stringToVerify)
    );
    
    const computedSignatureHex = Array.from(new Uint8Array(computedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return signature === computedSignatureHex;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

// Create a transaction in Wompi
async function createTransaction(transactionData: CreateTransactionRequest): Promise<WompiTransaction> {
  try {
    // Fetch acceptance tokens
    const tokens = await getAcceptanceTokens();
    
    // Add acceptance tokens to the transaction data
    const completeTransactionData = {
      ...transactionData,
      acceptance_token: tokens.acceptance_token,
      accept_personal_auth: tokens.personal_data_token,
    };
    
    // Make API request to create the transaction
    const response = await fetch(`${WOMPI_API_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WOMPI_PRIVATE_KEY}`
      },
      body: JSON.stringify(completeTransactionData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create transaction: ${JSON.stringify(errorData)}`);
    }
    
    const responseData = await response.json();
    return responseData.data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

// Get transaction status from Wompi
async function getTransactionStatus(transactionId: string): Promise<WompiTransaction> {
  const response = await fetch(`${WOMPI_API_URL}/transactions/${transactionId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to get transaction status: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.data;
}

// Store transaction in Supabase
async function storeTransaction(transaction: WompiTransaction, userId?: string): Promise<void> {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase.from('payments').insert({
    transaction_id: transaction.id,
    reference: transaction.reference,
    amount: transaction.amount_in_cents / 100,
    currency: transaction.currency,
    status: transaction.status,
    payment_method: transaction.payment_method_type,
    payment_details: transaction.payment_method,
    customer_email: transaction.customer_email,
    user_id: userId || undefined,
    created_at: new Date().toISOString()
  });
  
  if (error) {
    console.error('Error storing transaction in Supabase:', error);
    throw error;
  }
}

// Update transaction status in Supabase
async function updateTransactionStatus(transactionId: string, status: string): Promise<void> {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from('payments')
    .update({ status: status, updated_at: new Date().toISOString() })
    .eq('transaction_id', transactionId);
  
  if (error) {
    console.error('Error updating transaction status in Supabase:', error);
    throw error;
  }
}

// Interface for JWT payload
interface JWTPayload {
  // Common JWT claims
  sub?: string;       // Subject (user ID)
  exp?: number;       // Expiration time
  iat?: number;       // Issued at
  iss?: string;       // Issuer
  aud?: string;       // Audience
  // Custom claims for your application
  email?: string;
  role?: string;
  // Allow for additional properties with unknown type
  [key: string]: unknown;
}

// Verify JWT token from client
function verifyToken(token: string): JWTPayload {
  try {
    // Basic JWT parsing - in a real application, you would use a proper JWT library
    // or the Supabase Auth helper functions
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    // Base64 decode the payload
    const payload = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(parts[1].replace(/_/g, '/').replace(/-/g, '+')), c => c.charCodeAt(0))
      )
    );
    
    // In a production application, you should verify the signature here
    // For now, we're just parsing the payload without verification
    
    return payload as JWTPayload;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw new Error('Invalid token');
  }
}

// Main handler for the Supabase function
Deno.serve(async (req) => {
  // Enable CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
  
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    
    // Webhook handling
    if (path === 'webhook') {
      // Verify the signature from Wompi
      const isValidSignature = await verifyWebhookSignature(req);
      if (!isValidSignature) {
        return new Response(JSON.stringify({ error: 'Invalid signature' }), { 
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      
      const event = await req.json();
      const transactionId = event.data.transaction.id;
      const newStatus = event.data.transaction.status;
      
      // Update the transaction status in our database
      await updateTransactionStatus(transactionId, newStatus);
      
      return new Response(JSON.stringify({ success: true }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Create transaction endpoint
    else if (path === 'create-transaction') {
      // Validate the request
      if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
          status: 405,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      
      // Get the authorization header to identify the user (optional)
      const authHeader = req.headers.get('Authorization') || '';
      let userId: string | undefined = undefined;
      
      if (authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7);
          const payload = verifyToken(token);
          userId = payload.sub;
        } catch (error) {
          // Continue without user ID if token is invalid
          console.warn('Invalid token provided:', error);
        }
      }
      
      // Parse the request body
      const requestData = await req.json();
      
      // Validate required fields
      const requiredFields = ['amount_in_cents', 'currency', 'customer_email', 'payment_method', 'reference'];
      for (const field of requiredFields) {
        if (!requestData[field]) {
          return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), { 
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }
      
      // Create the transaction in Wompi
      const transaction = await createTransaction(requestData);
      
      // Store the transaction in Supabase
      await storeTransaction(transaction, userId);
      
      return new Response(JSON.stringify({ data: transaction }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Get transaction status endpoint
    else if (path === 'transaction-status' && req.method === 'GET') {
      const url = new URL(req.url);
      const transactionId = url.searchParams.get('id');
      
      if (!transactionId) {
        return new Response(JSON.stringify({ error: 'Transaction ID is required' }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      
      const transaction = await getTransactionStatus(transactionId);
      
      return new Response(JSON.stringify({ data: transaction }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Get merchant information (acceptance tokens and payment methods)
    else if (path === 'merchant-info' && req.method === 'GET') {
      const response = await fetch(`${WOMPI_API_URL}/merchants/${WOMPI_PUBLIC_KEY}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch merchant data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return new Response(JSON.stringify({ data: data.data }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Default response for other endpoints
    else {
      return new Response(JSON.stringify({ 
        error: 'Not found',
        availableEndpoints: [
          '/wompi/create-transaction',
          '/wompi/transaction-status',
          '/wompi/merchant-info',
          '/wompi/webhook'
        ] 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      message: error instanceof Error ? error.message : String(error) 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  For creating a transaction:
  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/wompi/create-transaction' \
    --header 'Authorization: Bearer YOUR_JWT_TOKEN' \
    --header 'Content-Type: application/json' \
    --data '{
      "amount_in_cents": 1000000,
      "currency": "COP",
      "customer_email": "customer@example.com",
      "reference": "order_123456",
      "payment_method": {
        "type": "CARD",
        "installments": 1,
        "token": "tok_test_1234_abcd"
      }
    }'

  For checking a transaction:
  curl -i --location --request GET 'http://127.0.0.1:54321/functions/v1/wompi/transaction-status?id=TRANSACTION_ID' \
    --header 'Authorization: Bearer YOUR_JWT_TOKEN'

  For getting merchant info:
  curl -i --location --request GET 'http://127.0.0.1:54321/functions/v1/wompi/merchant-info' \
    --header 'Authorization: Bearer YOUR_JWT_TOKEN'
*/
