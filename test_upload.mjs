import fs from 'fs';
import crypto from 'crypto';

// Create a 3MB dummy image file
const largeBuffer = crypto.randomBytes(3 * 1024 * 1024);

async function testUpload(buffer) {
    const formData = new FormData();
    formData.append('title', 'Test');
    formData.append('destination', 'Test');
    formData.append('start_date', '2025-01-01');
    formData.append('end_date', '2025-01-05');
    formData.append('spots_total', '12');
    formData.append('spots_left', '12');
    formData.append('status', 'upcoming');
    formData.append('image', new Blob([buffer]), 'test.jpg');
    
    try {
        const res = await fetch('http://localhost:3000/api/admin/tours', {
            method: 'POST',
            body: formData
        });
        
        console.log(`Status: ${res.status}`);
        const text = await res.text();
        console.log(`Response: ${text.substring(0, 100)}`);
    } catch(err) {
        console.error('Fetch error:', err.message);
    }
}

testUpload(largeBuffer);
