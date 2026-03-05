const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email and message are required' });
    }

    try {
        await resend.emails.send({
            from: 'Oscars Pizzeria Kontakt <onboarding@resend.dev>',
            to: ['post@swiftskillsgroup.com'],
            replyTo: email,
            subject: `Ny melding fra ${name} - Oscars Pizzeria`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fafaf8; border-radius: 16px; overflow: hidden;">
          <div style="background: #1a1a1a; color: white; padding: 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">📬 Ny kontaktmelding</h1>
            <p style="margin: 8px 0 0; color: #aaa;">Oscars Pizzeria</p>
          </div>
          <div style="padding: 32px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555; width: 120px;">Navn</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #1a1a1a;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">E-post</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee;"><a href="mailto:${email}" style="color: #1a1a1a;">${email}</a></td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Telefon</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee;"><a href="tel:${phone}" style="color: #1a1a1a;">${phone}</a></td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 12px 0; font-weight: bold; color: #555; vertical-align: top;">Melding</td>
                <td style="padding: 12px 0; color: #1a1a1a; white-space: pre-wrap;">${message}</td>
              </tr>
            </table>
          </div>
          <div style="background: #f5f5f5; padding: 16px 32px; text-align: center; color: #999; font-size: 13px;">
            Sendt fra kontaktskjema på oscarspizzeria.no
          </div>
        </div>
      `,
        });

        return res.status(200).json({ success: true, message: 'Melding sendt!' });
    } catch (error) {
        console.error('Resend error:', error);
        return res.status(500).json({ error: 'Kunne ikke sende melding. Prøv igjen.' });
    }
};
