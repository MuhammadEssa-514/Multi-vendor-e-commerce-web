
import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "localhost";
const SMTP_PORT = process.env.SMTP_PORT || 1025;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

export const sendEmail = async ({ to, subject, html }: { to: string, subject: string, html: string }) => {

    // For Development: If no SMTP credentials, just log it.
    if (!process.env.SMTP_USER) {
        console.log("========================================");
        console.log(`[MOCK EMAIL] To: ${to}`);
        console.log(`[MOCK EMAIL] Subject: ${subject}`);
        console.log(`[MOCK EMAIL] Content: ${html}`);
        console.log("========================================");
        return;
    }

    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465, // Use SSL for port 465
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    } as any);

    await transporter.sendMail({
        from: '"Multi Vendor Support" <noreply@multivendor.com>',
        to,
        subject,
        html,
    });
};
