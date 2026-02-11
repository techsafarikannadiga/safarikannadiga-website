require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
    console.log("No API Key found in .env.local");
    process.exit(0);
}

// Mask the key for display
const maskedKey = apiKey.length > 8 ? `${apiKey.substring(0, 8)}...` : 'INVALID_KEY_LENGTH';
console.log(`Checking domains using API Key: ${maskedKey}`);

const resend = new Resend(apiKey);

async function checkDomains() {
  try {
    const list = await resend.domains.list();
    if (!list.data || list.data.length === 0) {
      console.log("---------------------------------------------------");
      console.log("RESULT: No domains found in this account.");
      console.log("ACTION: The API Key in .env.local does not match the account in your screenshots.");
      console.log("---------------------------------------------------");
    } else {
        console.log("---------------------------------------------------");
        console.log("RESULT: Domains found!");
        list.data.forEach(d => {
            console.log(`- ${d.name} (Status: ${d.status})`);
        });
        console.log("---------------------------------------------------");
    }
  } catch (error) {
    console.error("Error connecting to Resend:", error.message);
  }
}

checkDomains();
