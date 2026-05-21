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
import 'dotenv/config';

const browserDistFolder = join(import.meta.dirname, '../browser');
const app = express();
const angularApp = new AngularNodeAppEngine();

// Client Supabase amb service role (bypassa RLS, mai al frontend)
const supabaseAdmin = createClient(
  process.env['SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_KEY']!,
);

const stripe = new Stripe(process.env['STRIPE_SECRET_KEY']!);

app.use(express.json());

app.post('/api/payment-intent', async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    res.status(400).json({ error: 'Import invàlid' });
    return;
  }
  const intent = await stripe.paymentIntents.create({
    amount,
    currency: 'eur',
    automatic_payment_methods: { enabled: true },
  });
  res.json({ clientSecret: intent.client_secret });
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
