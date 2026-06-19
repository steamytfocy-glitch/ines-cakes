export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    var token = process.env.TELEGRAM_TOKEN;
    var chatId = process.env.TELEGRAM_CHAT;
    if (!token || !chatId) {
        res.status(500).json({ error: 'Telegram not configured' });
        return;
    }

    var o = req.body || {};

    var lines = [];
    lines.push('🎂 New Order — I.N.E.S.');
    lines.push('');
    if (o.name) lines.push('👤 Name: ' + o.name);
    if (o.phone) lines.push('📞 Phone: ' + o.phone);
    if (o.email) lines.push('✉️ Email: ' + o.email);
    if (o.date) lines.push('📅 Date: ' + o.date);
    var size = o.cakeSize || '';
    if (o.customDiameter) size += ' (' + o.customDiameter + '")';
    if (size) lines.push('📏 Size: ' + size);
    if (o.flavour) lines.push('🍰 Flavour: ' + o.flavour);
    if (o.decorComplexity) lines.push('🎨 Decor: ' + o.decorComplexity);
    if (o.allergies) lines.push('⚠️ Allergies: ' + o.allergies);
    if (o.message) lines.push('📝 Wishes: ' + o.message);
    if (o.total) lines.push('💶 Estimated total: ' + o.total);
    lines.push('');
    lines.push('Submitted: ' + (o.submitted || ''));

    try {
        var tgRes = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: lines.join('\n') })
        });
        var data = await tgRes.json();
        res.status(200).json(data);
    } catch (e) {
        res.status(500).json({ error: String(e) });
    }
}
