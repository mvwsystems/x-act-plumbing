# X-Act Plumbing Website

High-impact marketing website for X-Act Plumbing — Red Oak & Waxahachie, TX.

## Stack
- Pure HTML / CSS / JavaScript (no framework)
- Netlify hosting with Netlify Forms
- Retell AI voice chat (Chloe)
- HouseCall Pro booking integration

## File Structure

```
/
├── index.html        # Home page
├── about.html        # About / founder story
├── services.html     # Services detail page
├── contact.html      # Contact + service request form
├── thank-you.html    # Form submission confirmation
├── privacy.html      # Privacy Policy (add content)
├── terms.html        # Terms of Use (add content)
├── styles.css        # All styles (CSS variables, components, responsive)
├── main.js           # Nav, scroll, reveal animations, Retell AI init
├── netlify.toml      # Netlify config + redirects + headers
└── README.md
```

## Deployment

1. Push to GitHub repo
2. Connect repo to Netlify
3. Build command: _(leave blank — static site)_
4. Publish directory: `.`

## Retell AI Setup

In `main.js`, replace `YOUR_RETELL_AGENT_ID` with the actual agent ID from the Retell dashboard.

The widget uses a backend endpoint `/api/create-web-call` to generate a web call access token. Options:
- Create a Netlify Function at `netlify/functions/create-web-call.js`
- Or use Retell's embeddable widget approach (no backend needed)

**Netlify Function approach (recommended):**
```js
// netlify/functions/create-web-call.js
exports.handler = async () => {
  const response = await fetch('https://api.retellai.com/v2/create-web-call', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ agent_id: process.env.RETELL_AGENT_ID })
  });
  const data = await response.json();
  return {
    statusCode: 200,
    body: JSON.stringify({ access_token: data.access_token })
  };
};
```

Set environment variables in Netlify dashboard:
- `RETELL_API_KEY` — from Retell dashboard
- `RETELL_AGENT_ID` — your agent ID (also update in main.js)

## Netlify Forms

The contact form uses Netlify Forms natively (`data-netlify="true"`).
Form submissions appear in the Netlify dashboard under **Forms**.
To enable email notifications: Netlify dashboard → Forms → Notifications.

## Design System

**Colors:** Deep black `#0a0a0c`, Dark layers, Electric blue `#00a0ff` accent
**Fonts:** Barlow Condensed (display) + Barlow (body) + JetBrains Mono (mono/labels)
**Motif:** `//` operator decorations, parallelogram clip-paths, horizontal rule gradients

## TODO

- [ ] Replace `YOUR_RETELL_AGENT_ID` in `main.js`
- [ ] Add Netlify Function for Retell web call token (see above)
- [ ] Add real hero/about photo for Daniel
- [ ] Create `privacy.html` and `terms.html` with legal content
- [ ] Add Google Analytics or Plausible tracking
- [ ] Set up Netlify Forms email notification
- [ ] Update Netlify environment variables
