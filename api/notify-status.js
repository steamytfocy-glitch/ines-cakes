// Sends an email to the client when their order status changes (via Brevo).
// Required Vercel env vars:
//   BREVO_KEY          - Brevo API key (Settings -> SMTP & API -> API Keys)
//   BREVO_SENDER       - a verified sender email (Senders & IP -> verify one address)
// Optional:
//   BREVO_SENDER_NAME  - display name, defaults to "I.N.E.S. Bakery"

var STATUS_LABELS = {
    en: { new: 'Order received', confirmed: 'Confirmed', progress: 'Being made', ready: 'Ready for pickup', done: 'Completed', declined: 'Order declined' },
    ua: { new: 'Замовлення отримано', confirmed: 'Підтверджено', progress: 'Готується', ready: 'Готово до видачі', done: 'Виконано', declined: 'Замовлення відхилено' },
    ru: { new: 'Заказ получен', confirmed: 'Подтверждён', progress: 'Готовится', ready: 'Готов к выдаче', done: 'Выполнен', declined: 'Заказ отклонён' }
};

var TEXTS = {
    en: { subject: 'order', greeting: 'Hello', statusLine: 'Status of your order', noteLabel: 'Message from us', track: 'View your order status', signoff: '- I.N.E.S. Bakery' },
    ua: { subject: 'замовлення', greeting: 'Вітаємо', statusLine: 'Статус вашого замовлення', noteLabel: 'Повідомлення від нас', track: 'Переглянути статус замовлення', signoff: '- Пекарня I.N.E.S.' },
    ru: { subject: 'заказ', greeting: 'Здравствуйте', statusLine: 'Статус вашего заказа', noteLabel: 'Сообщение от нас', track: 'Посмотреть статус заказа', signoff: '- Пекарня I.N.E.S.' }
};

function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    var key = process.env.BREVO_KEY;
    var sender = process.env.BREVO_SENDER;
    if (!key || !sender) {
        res.status(500).json({ error: 'Email not configured' });
        return;
    }

    var o = req.body || {};
    var to = (o.to || '').trim();
    if (!to || to.indexOf('@') < 0) {
        res.status(400).json({ error: 'No valid recipient' });
        return;
    }

    var lang = TEXTS[o.lang] ? o.lang : 'en';
    var T = TEXTS[lang];
    var labels = STATUS_LABELS[lang];
    var status = o.status || 'new';
    var statusLabel = labels[status] || status;
    var code = o.code || '';
    var name = o.name || '';
    var note = (o.note || '').trim();

    // Always link to the public domain (the admin may be opened on a
    // *.vercel.app preview URL, so don't derive this from the request host).
    var site = (process.env.SITE_URL || 'https://www.inescake.com').replace(/\/+$/, '');
    var orderUrl = code ? site + '/order?code=' + encodeURIComponent(code) : '';

    var subject = 'I.N.E.S. - ' + T.subject + ' ' + code + ': ' + statusLabel;

    var noteHtml = note
        ? '<div style="background:#FBF6EC;border-left:3px solid #C8963E;border-radius:8px;padding:14px 16px;margin:18px 0;">' +
          '<div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6B5B4E;margin-bottom:6px;">' + esc(T.noteLabel) + '</div>' +
          '<div style="color:#3D2E1C;line-height:1.6;white-space:pre-wrap;">' + esc(note) + '</div></div>'
        : '';

    var trackBtn = orderUrl
        ? '<a href="' + orderUrl + '" style="display:inline-block;background:#C8963E;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;margin-top:8px;">' + esc(T.track) + '</a>'
        : '';

    var html =
        '<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#3D2E1C;">' +
        '<div style="text-align:center;padding:20px 0;"><span style="font-size:26px;font-weight:700;color:#C8963E;letter-spacing:3px;">I.N.E.S.</span></div>' +
        '<div style="background:#fff;border:1px solid #Eee5d2;border-radius:16px;padding:28px;">' +
        '<p style="font-size:15px;">' + esc(T.greeting) + (name ? ' ' + esc(name) : '') + ',</p>' +
        '<p style="font-size:15px;">' + esc(T.statusLine) + ' <strong>' + esc(code) + '</strong>:</p>' +
        '<p style="font-size:22px;font-weight:700;color:#C8963E;margin:6px 0 4px;">' + esc(statusLabel) + '</p>' +
        noteHtml +
        '<div style="text-align:center;margin-top:18px;">' + trackBtn + '</div>' +
        '<p style="font-size:13px;color:#6B5B4E;margin-top:26px;">' + esc(T.signoff) + '</p>' +
        '</div></div>';

    var textLines = [
        T.greeting + (name ? ' ' + name : '') + ',',
        '',
        T.statusLine + ' ' + code + ': ' + statusLabel
    ];
    if (note) { textLines.push('', T.noteLabel + ': ' + note); }
    if (orderUrl) { textLines.push('', T.track + ': ' + orderUrl); }
    textLines.push('', T.signoff);

    try {
        var brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: { 'api-key': key, 'Content-Type': 'application/json', 'accept': 'application/json' },
            body: JSON.stringify({
                sender: { email: sender, name: process.env.BREVO_SENDER_NAME || 'I.N.E.S. Bakery' },
                to: [{ email: to, name: name || to }],
                subject: subject,
                htmlContent: html,
                textContent: textLines.join('\n')
            })
        });
        var result = await brevoRes.json();
        if (!brevoRes.ok) {
            res.status(502).json({ error: 'Brevo error', detail: result });
            return;
        }
        res.status(200).json({ sent: true, result: result });
    } catch (e) {
        res.status(500).json({ error: String(e) });
    }
}
