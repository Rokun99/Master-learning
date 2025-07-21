// This is a Netlify scheduled function, triggered by the cron expression in netlify.toml.

export default async () => {
  console.log("Running daily reminder job...");

  try {
    const {
      AIRTABLE_API_KEY,
      AIRTABLE_BASE_ID,
      AIRTABLE_TABLE_NAME,
      RESEND_API_KEY,
      FROM_EMAIL,
      SITE_URL
    } = process.env;
    
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME || !RESEND_API_KEY || !FROM_EMAIL || !SITE_URL) {
        console.error("One or more environment variables are not set for the daily reminder job.");
        return new Response("Server configuration error.", { status: 500 });
    }
    
    // --- 1. Get all subscribed emails from Airtable ---
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
    const airtableResponse = await fetch(airtableUrl, {
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` },
    });

    if (!airtableResponse.ok) {
      throw new Error(`Airtable API error: ${await airtableResponse.text()}`);
    }

    const { records } = await airtableResponse.json();
    const emails = records
      .map((record: any) => record.fields.Email)
      .filter(Boolean); // Filter out any empty email fields

    if (emails.length === 0) {
      console.log("No subscribed emails found. Job finished.");
      return new Response("No emails to send.", { status: 200 });
    }
    
    console.log(`Found ${emails.length} emails to send reminders to.`);

    // --- 2. Send emails in batches using Resend ---
    // Resend's batch endpoint can handle up to 100 recipients per call.
    const emailPromises = [];
    const batchSize = 100;

    for (let i = 0; i < emails.length; i += batchSize) {
        const batch = emails.slice(i, i + batchSize);
        
        const resendPromise = fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: `Master Lernen <${FROM_EMAIL}>`,
                to: batch, // Send to the batch of emails
                subject: 'Your daily learning lesson is waiting!',
                html: `<h1>Hello!</h1><p>Don't forget your daily learning practice. Your next lesson is just a click away. Keep up the great work!</p><p><a href="${SITE_URL}">Go to your lesson now</a></p>`
            })
        });
        emailPromises.push(resendPromise);
    }

    await Promise.all(emailPromises);
    
    console.log(`Successfully sent reminders to ${emails.length} users.`);
    return new Response(`Sent reminders to ${emails.length} users.`, { status: 200 });

  } catch (error) {
    console.error("Daily reminder job failed:", error);
    return new Response("Job failed.", { status: 500 });
  }
};