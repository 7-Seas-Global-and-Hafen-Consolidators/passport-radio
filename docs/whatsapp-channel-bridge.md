# Passport Radio · WhatsApp Channel local bridge

This bridge is the last hop between the Blog circulation outbox and the Passport
Radio WhatsApp Channel.

## What GitHub does

The Blog Tunnel writes `data/whatsapp-channel-outbox.json` from every changed
`blog/w/*.html`: new stories and revitalized archive stories. Each item carries
the canonical Passport URL with WhatsApp Channel UTM tracking.

## What the local bridge does

A computer controlled by Passport Radio keeps the linked WhatsApp Web session.
The bridge reads the outbox and sends unseen items to the Channel JID
(`@newsletter`). Its authentication directory and local sent-state never belong
in Git.

## One-time pairing

Install Node.js 20+ and, in a local clone:

```bash
npm install --no-save @whiskeysockets/baileys pino
export PASSPORT_WA_CHANNEL_JID='YOUR_CHANNEL_JID@newsletter'
node tools/whatsapp_channel_bridge.mjs --pair
```

Pair with the **Passport Radio WhatsApp Business** account. Keep
`.passport-wa-auth/` private.

## Normal run

```bash
git pull --ff-only
export PASSPORT_WA_CHANNEL_JID='YOUR_CHANNEL_JID@newsletter'
node tools/whatsapp_channel_bridge.mjs
```

Run that command from Task Scheduler/systemd/cron on the machine that remains
online. The bridge records each successful item immediately in
`data/whatsapp-channel-local-state.json`, so a later failure does not resend
already completed items.

Never commit the auth directory, Channel JID secrets/configuration, QR material,
or local sent-state.
