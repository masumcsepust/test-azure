# Deploying Tempo

Tempo is a fully static single-page app. `npm run build` produces a `dist/`
folder that any static host can serve — there is no server, no API and no
runtime configuration.

```bash
npm install
npm run build     # → dist/
```

---

## Azure Static Web Apps (recommended)

`dist/index.html` sits at the root of the output, so the workflow settings are:

```yaml
app_location: "/"          # source code
output_location: "dist/"   # built site
```

Creating the Static Web App from the Azure portal against this repository
generates the workflow file and the deployment-token secret for you:

1. Azure portal → **Static Web Apps** → **Create**
2. Resource group, name, and the **Free** plan
3. Source: **GitHub** → connect the repository → production branch `main`
4. Build preset: **Angular**
5. **App location** `/`, **Output location** `dist/`

### Node version — read this one

`package.json` pins:

```json
"engines": { "node": "22.22.3" }
```

Angular 22 refuses to run on anything below `v22.22.3` (or `v24.15.0`). Pin it
**exactly**: a range like `>=22.22.3` makes the Azure Oryx builder resolve to
`24.13.0` — the newest Node 24 in the Oryx manifest, but below Angular's
minimum — and the build fails with *"Oryx has found build steps, but identified
unsupported platform versions."*

### The `outputPath` detail

`angular.json` uses the object form:

```json
"outputPath": { "base": "dist", "browser": "" }
```

so `index.html`, the bundles and `media/` land **directly** in `dist/`. This is
what makes `output_location: "dist/"` correct. If you ever switch back to the
classic `dist/<project>/browser` layout, change `output_location` to match or
the deployment will ship a nested folder and the site will 404.

---

## Azure Blob Storage

```bash
npm run build
az storage blob upload-batch \
  --account-name <account> \
  --container-name $web \
  --destination dist \
  --source dist \
  --overwrite true
```

Turn on **Static website** for the container (`index.html` as the index
document) and put a CDN in front of it.

---

## Netlify / Vercel / Cloudflare Pages

| Host | Build command | Publish directory |
| --- | --- | --- |
| Netlify | `npm run build` | `dist` |
| Vercel | `npm run build` | `dist` |
| Cloudflare Pages | `npm run build` | `dist` |

No rewrite rules are needed — Tempo has no client-side routes.

---

## nginx

```nginx
server {
  listen 443 ssl http2;
  server_name tempo.example.com;

  root /var/www/tempo;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location ~* \.(js|css|woff2?|ttf|svg|png|jpg|ico)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

---

## GitHub Pages

A project page is served from `/<repo>/`, so the build needs a matching base
href:

```json
"github-pages": {
  "baseHref": "/<repo>/",
  "outputPath": { "base": "dist/tempo", "browser": "browser" }
}
```

Upload `dist/tempo/browser` as the Pages artifact.

---

## Notes

- `src/fonts/` holds the three self-hosted variable fonts (Space Grotesk,
  Inter, Geist Mono). Angular bundles and fingerprints them, so the CSS
  references them relatively and the app works under any base path.
- The app stores its tasks, stats and preset in `localStorage` — nothing
  leaves the browser.
