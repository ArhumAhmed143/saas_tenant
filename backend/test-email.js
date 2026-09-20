require('dotenv').config();
const { sendEmail, sendInviteEmail } = require('./services/emailService');

const targetEmail = process.argv[2] || process.env.EMAIL_USER;

if (!targetEmail) {
    console.error('❌ Please provide a recipient email address: node test-email.js someone@gmail.com');
    process.exit(1);
}

console.log('========================================');
console.log('🧪 TESTING EMAIL SERVICE');
console.log('   Recipient:', targetEmail);
console.log('   BREVO_API_KEY:', process.env.BREVO_API_KEY ? '✅ Present' : '❌ Not Set');
console.log('   SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '✅ Present' : '❌ Not Set');
console.log('   EMAIL_USER:', process.env.EMAIL_USER || '❌ Not Set');
console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? `✅ Present (${process.env.EMAIL_PASS.length} chars)` : '❌ Not Set');
console.log('========================================');

async function runTest() {
    try {
        console.log('🚀 Attempting to send test invite email...');
        const result = await sendInviteEmail({
            to: targetEmail,
            role: 'Manager',
            tenantName: 'Test Corporation',
            senderName: 'Admin Tester',
            inviteLink: 'http://localhost:3000/register?invite=test-token-123456'
        });

        console.log('========================================');
        console.log('🎉 SUCCESS! Test email delivered.');
        console.log('   Details:', result);
        console.log('========================================');
        process.exit(0);
    } catch (err) {
        console.error('========================================');
        console.error('❌ FAILED TO SEND EMAIL:');
        console.error('   Error Message:', err.message);
        console.error('========================================');
        process.exit(1);
    }
}

runTest();
