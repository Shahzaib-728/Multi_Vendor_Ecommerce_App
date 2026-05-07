import nodemailer from 'nodemailer';

export const sendResetEmail = async (email, resetLink) => {
    let transporter;
    const isSmtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

    if (isSmtpConfigured) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT == 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    } else {
        // Create Ethereal test account for development
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log('--- ETHEREAL TEST ACCOUNT GENERATED ---');
        console.log(`User: ${testAccount.user}`);
        console.log(`Pass: ${testAccount.pass}`);
    }

    const mailOptions = {
        from: isSmtpConfigured ? `"WT Support" <${process.env.SMTP_USER}>` : '"WT Test Support" <support@wurbanedge.com>',
        to: email,
        subject: 'Password Reset Request',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #1a202c;">Password Reset Request</h2>
                <p style="color: #4a5568;">You requested a password reset. Please click the button below to set a new password. This link is valid for 1 hour.</p>
                <div style="margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
                </div>
                <p style="color: #4a5568; font-size: 14px;">If the button above doesn't work, copy and paste this link into your browser:</p>
                <p style="color: #718096; font-size: 12px; word-break: break-all;">${resetLink}</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="color: #a0aec0; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
        `
    };

    const info = await transporter.sendMail(mailOptions);

    if (!isSmtpConfigured) {
        console.log('--- ETHEREAL EMAIL SENT ---');
        console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return true;
};
