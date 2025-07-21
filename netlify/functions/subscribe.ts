// This is a Netlify serverless function.
// It acts as a secure backend endpoint to handle email subscriptions.

// The handler function receives the event and context from Netlify.
export default async (req: Request) => {
  // Only allow POST requests for this endpoint.
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405 });
  }

  try {
    const { email } = await req.json();

    // Basic email validation.
    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ message: 'Invalid email provided.' }), { status: 400 });
    }

    // Securely get secrets from Netlify's environment variables.
    const {
      AIRTABLE_API_KEY,
      AIRTABLE_BASE_ID,
      AIRTABLE_TABLE_NAME,
      RESEND_API_KEY,
      FROM_EMAIL
    } = process.env;

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME || !RESEND_API_KEY || !FROM_EMAIL) {
        console.error("One or more environment variables are not set.");
        return new Response(JSON.stringify({ message: 'Server configuration error.' }), { status: 500 });
    }

    // --- 1. Add email to Airtable ---
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
    const airtableResponse = await fetch(airtableUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          'Email': email,
          'Status': 'Subscribed',
          'SignupDate': new Date().toISOString(),
        },
      }),
    });

    if (!airtableResponse.ok) {
      const errorBody = await airtableResponse.json();
      console.error('Airtable API Error:', errorBody);
      // Don't expose detailed error to client.
      return new Response(JSON.stringify({ message: 'Could not save email.' }), { status: 500 });
    }

    // --- 2. Send a welcome email with Resend ---
    const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: `Master Lernen <${FROM_EMAIL}>`,
            to: [email],
            subject: 'Welcome to Master Learning!',
            html: `<h1>Welcome!</h1><p>We're thrilled to have you on board to master the art of learning. You will now receive daily reminders for your 30-day journey. Happy learning!</p>`
        })
    });

    if (!resendResponse.ok) {
        // Log the error, but don't fail the whole request since the user is already subscribed.
        console.error('Resend API Error:', await resendResponse.json());
    }

    // Return a success response to the frontend app.
    return new Response(JSON.stringify({ success: true, message: 'Subscribed successfully!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Subscription Error:', error);
    return new Response(JSON.stringify({ message: 'An internal error occurred.' }), { status: 500 });
  }
};