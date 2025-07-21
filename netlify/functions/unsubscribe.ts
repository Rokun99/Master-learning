// This is a Netlify serverless function.
// It acts as a secure backend endpoint to handle email unsubscriptions.

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405 });
  }

  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ message: 'Invalid email provided.' }), { status: 400 });
    }

    const {
      AIRTABLE_API_KEY,
      AIRTABLE_BASE_ID,
      AIRTABLE_TABLE_NAME,
    } = process.env;
    
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME) {
        console.error("Airtable environment variables are not set.");
        return new Response(JSON.stringify({ message: 'Server configuration error.' }), { status: 500 });
    }

    const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

    // --- 1. Find the record ID for the given email ---
    // Airtable's formula for finding an exact match on the 'Email' field.
    const filterFormula = `({Email} = '${email}')`;
    const findUrl = `${baseUrl}?filterByFormula=${encodeURIComponent(filterFormula)}`;

    const findResponse = await fetch(findUrl, {
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` },
    });

    if (!findResponse.ok) {
      console.error('Airtable Find Error:', await findResponse.json());
      return new Response(JSON.stringify({ message: 'Could not find subscription.' }), { status: 500 });
    }

    const { records } = await findResponse.json();

    if (!records || records.length === 0) {
      // Email not found, but we can treat this as a success for the user.
      return new Response(JSON.stringify({ success: true, message: 'Email not found or already unsubscribed.' }), { status: 200 });
    }

    const recordId = records[0].id;

    // --- 2. Delete the record using its ID ---
    const deleteUrl = `${baseUrl}/${recordId}`;
    const deleteResponse = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` },
    });

    if (!deleteResponse.ok) {
      console.error('Airtable Delete Error:', await deleteResponse.json());
      return new Response(JSON.stringify({ message: 'Could not unsubscribe.' }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, message: 'Unsubscribed successfully.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unsubscription Error:', error);
    return new Response(JSON.stringify({ message: 'An internal error occurred.' }), { status: 500 });
  }
};
