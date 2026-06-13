# Publishing the Learning HTML Files

The `learning/` folder is now a static site. The mobile home page is `index.html`, and the lessons and reference sheets are plain HTML files with relative links.

## Best Options

### Private or semi-private

- **Cloudflare Pages with access control**: good if you want a clean URL and can put Cloudflare Access in front of it.
- **Netlify with password protection**: simple for static HTML if you use a paid plan or another access layer.
- **OneDrive or iCloud shared folder**: fastest, but the browsing experience is less polished and access links can be awkward.

### Public

- **GitHub Pages**: simplest if public access is acceptable. Put the `learning/` folder in a repo and publish it as a Pages site.
- **Cloudflare Pages**: also simple for public static hosting, with easy upgrade path to access control.

## What I Recommend

Use **Cloudflare Pages plus access control** if this will eventually contain real deal examples, client-adjacent analysis, or internal training notes. Use **GitHub Pages** only if the content will stay generic and non-confidential.

## Local Preview

From this workspace:

```zsh
cd learning
python3 -m http.server 8765 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:8765/
```

## Publish Checklist

- Keep all links relative.
- Make `index.html` the entry point.
- Do not publish client names, deal names, transaction documents, or fact patterns based on confidential matters unless the site is access-controlled and approved for that use.
- If examples are based on real matters, anonymize aggressively and keep the site private.
- Keep personal answer logs in `private/`, which is ignored by git and should not be published to GitHub Pages.
