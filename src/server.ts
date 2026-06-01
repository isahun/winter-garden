import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const browserDistFolder = join(import.meta.dirname, '../browser');
const app = express();
app.set('trust proxy', true); // necessari per a Render (reverse proxy)

const angularApp = new AngularNodeAppEngine({
  allowedHosts: ['winter-garden.onrender.com'],
  trustProxyHeaders: true,
});

// Client Supabase amb service role (bypassa RLS, mai al frontend)
const supabaseAdmin = createClient(
  process.env['SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_KEY']!,
);

const stripe = new Stripe(process.env['STRIPE_SECRET_KEY']!);
const ai = new GoogleGenAI({ apiKey: process.env['GEMINI_API_KEY']! });

app.use(express.json());

app.post('/api/payment-intent', async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    res.status(400).json({ error: 'Import invàlid' });
    return;
  }
  try {
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
    });
    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.error('[Stripe] Error creant PaymentIntent:', err);
    res.status(500).json({ error: 'Error al processador de pagament. Torna-ho a intentar.' });
  }
});

app.post('/api/chatbot', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    res.status(400).json({ error: 'Missatge buit' });
    return;
  }

  const { data: products } = await supabaseAdmin
    .from('products')
    .select('name, description, price')
    .limit(20);

  const productContext = (products ?? [])
    .map((p: any) => `- ${p.name} (${p.price}€): ${p.description ?? ''}`)
    .join('\n');

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Transfer-Encoding', 'chunked');

  ai.models
    .generateContentStream({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: `Ets l'assessora de jardins de Secret Garden, una botiga de jardins eterns de plantes preservades. Ajudes els clients a trobar el jardí perfecte. Respon sempre en català, de forma amable i breu. Aquí tens el catàleg actual:\n${productContext}`,
      },
    })
    .then(async (stream) => {
      for await (const chunk of stream) {
        if (chunk.text) res.write(chunk.text);
      }
      res.end();
    })
    .catch((error) => {
      console.error('Error Gemini:', error);
      res.status(500).send('Error generant la resposta.');
    });
});

app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
