export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }
  
    try {
      const { message } = req.body || {};
      if (!message) {
        res.status(400).json({ error: 'Missing "message"' });
        return;
      }
  
      const webhookUrl = process.env.N8N_WEBHOOK_URL;
      if (!webhookUrl) {
        res.status(500).json({ error: 'Missing N8N_WEBHOOK_URL' });
        return;
      }
  
      const resp = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 🔹 Solo enviamos el mensaje, como pediste
        body: JSON.stringify({ message }),
      });
  
      const text = await resp.text();
  
      if (!resp.ok) {
        res.status(resp.status).send(text || 'n8n error');
        return;
      }
  
      // Si n8n devuelve JSON, lo parseamos; si no, lo envolvemos.
      try {
        const data = JSON.parse(text);
        res.status(200).json(data);
      } catch {
        res.status(200).json({ reply: text });
      }
    } catch (err) {
      console.error('assistant api error:', err);
      res.status(500).json({ error: 'Error al conectar con n8n' });
    }
  }
  