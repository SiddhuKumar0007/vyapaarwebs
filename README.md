# VyapaarWebs

A complete static website for VyapaarWebs with six internal, interactive demonstration websites. No build step or production JavaScript dependencies are required. CSS 3D provides the layered hero sculpture, pointer parallax and a static reduced-motion fallback without requiring WebGL.

## Run locally

Use Node.js 18 or newer. From this folder, run `npm start`, then open `http://127.0.0.1:4173`. Alternatively, serve the `dist` folder with any static web server. JavaScript modules require HTTP; double-clicking index.html is not supported.

## Edit

- `dist/data.js`: themes, categories, services, process, FAQs, sample reviews and prompt suggestions.
- `dist/index.html`: main page, metadata, contact form and privacy notice placeholder.
- `dist/app.js`: gallery, seven-step builder, local storage, dialogs, WhatsApp URLs and validation.
- `dist/style.css`: responsive design system and CSS 3D sculpture.
- `dist/demos.js` and `dist/demo.css`: six distinct interactive demo concepts.
- `dist/demos/*/index.html`: standalone demo routes, marked noindex.
- `dist/assets`: locally stored images, original SVG identity, concept art and social image.

Run `node generate-demos.mjs` after changing demo titles in the data. Run `npm run check` for JavaScript syntax checks. `qa.mjs` is the browser verification script; it uses Playwright and the locally installed Microsoft Edge browser. Install Playwright as a development tool to rerun it. It captures WhatsApp URLs without actually sending messages or contacting the business.

## Functional scope

Theme search and all requested category filters work. Six actual concepts are included: Luxury Real Estate, Modern Restaurant, Premium Fashion, Corporate Business, Creative Portfolio and Fitness Studio. Categories without a demo have an honest custom-design empty state. The Fashion concept also appears under E-commerce and the Portfolio concept under Agency.

The main builder saves preferences to localStorage, shows a responsive concept preview, permits revisions, and creates an encoded WhatsApp brief. The prompt section combines suggestions and mood selections into a formatted brief. Contact form details are validated and passed to WhatsApp with a visible fallback link. Visitors must press Send in WhatsApp themselves.

Each demo is explicitly illustrative. Restaurant forms preview enquiries only. The fashion shopping bag supports addition, removal, totals and product sorting but does not accept payment. Property, business and fitness enquiries are for discussing website features with VyapaarWebs, not for booking real properties, services or classes. No AI generation backend is claimed or connected.

## Before public business use

The initial Sites deployment is private. Replace the clearly labelled review placeholders with genuine approved feedback, add verified social URLs, and replace the privacy-policy placeholder with a reviewed business policy. Confirm commercial terms in project agreements. Budget ranges are visitor preferences, not published agency pricing. Set the canonical/OG URL to your production domain when one is connected.

## Assets

Demo photographs are stored locally from Unsplash image endpoints: `photo-1600607687939-ce8a6c25118c`, `photo-1414235077428-338989a2e8c0`, `photo-1483985988355-763728e1935b`, `photo-1497366754035-f200968a6e72`, and `photo-1534438327276-14e5300c3a48`. Logo, hero composition, product illustrations and portfolio concept art are original SVG/CSS. Google Fonts are Space Grotesk, DM Sans and DM Serif Display, with system fallbacks.
