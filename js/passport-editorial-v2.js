/* =========================================
   PASSPORT EDITORIAL ENGINE v2
   Recirculation, Scoring, Archive, SEO
   ========================================= */

const PASSPORT_FEED_URL = '/data/editorial-feed.json';

function calculateScore(current, candidate, selectedEntities) {
    if (current.url === candidate.url) return -1;

    let score = 0;
    const currentEntities = new Set((current.entities || []).map(e => e.toLowerCase()));
    const candidateEntities = (candidate.entities || []).map(e => e.toLowerCase());

    candidateEntities.forEach(entity => {
        if (currentEntities.has(entity)) score += 15;
    });

    if (current.category === candidate.category) score += 5;

    const evergreenFormats = ['STORY', 'MR_NOMAD', 'LIVE_SIGNAL'];
    if (evergreenFormats.includes(candidate.format)) score += 12;

    const pubDate = new Date(candidate.published_at);
    const daysDiff = (new Date() - pubDate) / (1000 * 60 * 60 * 24);
    if (daysDiff <= 7) score += 10;

    const primaryEntity = candidateEntities[0];
    if (primaryEntity && selectedEntities.has(primaryEntity)) score -= 25;

    return score;
}

async function initPassportEditorialSystem() {
    try {
        const response = await fetch(`${PASSPORT_FEED_URL}?v=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) return;
        const feed = await response.json();

        const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
        const currentArticle = feed.find(item => {
            const itemPath = new URL(item.url, window.location.origin).pathname.replace(/\/+$/, '');
            return itemPath === currentPath;
        });

        if (!currentArticle) return;

        injectSEO(currentArticle);
        injectSignature(currentArticle);
        buildRecirculation(currentArticle, feed);
        injectContextualMonetization(currentArticle);
    } catch (err) {
        console.warn('[Passport v2] Fail-open:', err);
    }
}

function injectSEO(article) {
    let script = document.getElementById('passport-article-schema');
    if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'passport-article-schema';
        document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": article.title,
        "description": article.deck,
        "datePublished": article.published_at,
        "author": { "@type": "Person", "name": article.author || "Passport Radio" }
    });
}

function injectSignature(article) {
    const proseContainer = document.querySelector('.passport-prose') || document.querySelector('main') || document.body;
    if (document.querySelector('.passport-signature')) return;

    const signIt = ['STORY', 'MR_NOMAD', 'LIVE_SIGNAL'].includes(article.format);
    if (signIt) {
        const sig = document.createElement('div');
        sig.className = 'passport-signature';
        sig.textContent = 'Mr. Nomad';
        proseContainer.appendChild(sig);
    }
}

function buildRecirculation(current, feed) {
    const selectedEntities = new Set();

    const scoredFeed = feed
        .map(item => {
            const score = calculateScore(current, item, selectedEntities);
            if (score > 0 && item.entities && item.entities[0]) {
                selectedEntities.add(item.entities[0].toLowerCase());
            }
            return { ...item, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score);

    const topRelated = scoredFeed.slice(0, 6);

    const archiveBlock = feed
        .filter(item => item.url !== current.url && ['STORY', 'MR_NOMAD'].includes(item.format))
        .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
        .slice(0, 4);

    renderRail(topRelated);
    renderArchiveBlock(archiveBlock);
}

function renderRail(items) {
    if (!items.length) return;

    let layout = document.querySelector('.passport-layout');
    if (!layout) {
        const main = document.querySelector('main') || document.body;
        layout = document.createElement('div');
        layout.className = 'passport-layout';
        main.parentNode.insertBefore(layout, main);
        layout.appendChild(main);
    }

    let rail = document.querySelector('.passport-rail');
    if (!rail) {
        rail = document.createElement('aside');
        rail.className = 'passport-rail';
        layout.appendChild(rail);
    }

    rail.innerHTML = `<div class="rail-header" style="font-family:Inter,sans-serif;font-weight:800;font-size:.75rem;text-transform:uppercase;letter-spacing:.1em;color:#b20f18;margin-bottom:1rem;">Continue Nesta Rota</div>`;

    items.forEach(item => {
        const card = document.createElement('a');
        card.href = item.url;
        card.className = 'rail-card';
        card.innerHTML = `
            <div class="rail-card__category">${(item.category || 'Passport').replace('_', ' ')}</div>
            <div class="rail-card__title">${item.title}</div>
            <div class="rail-card__deck">${item.deck || ''}</div>
        `;
        rail.appendChild(card);
    });
}

function renderArchiveBlock(items) {
    if (!items.length) return;
    const main = document.querySelector('main') || document.body;
    if (document.querySelector('.passport-archive-block')) return;

    const block = document.createElement('section');
    block.className = 'passport-archive-block';

    let gridHTML = '';
    items.forEach(item => {
        gridHTML += `
            <a href="${item.url}" class="rail-card" style="border:none; padding:0;">
                <div class="rail-card__category">Clássico da Rota</div>
                <div class="rail-card__title">${item.title}</div>
                <div class="rail-card__deck">${item.deck || ''}</div>
            </a>
        `;
    });

    block.innerHTML = `
        <h3>Não Existe Matéria Velha: Você Perdeu Isso?</h3>
        <div class="archive-grid">${gridHTML}</div>
    `;
    main.appendChild(block);
}

function injectContextualMonetization(article) {
    const entities = (article.entities || []).map(e => e.toLowerCase());
    const gearKeywords = ['fender', 'marshall', 'gibson', 'prs', 'ibanez', 'guitarra', 'amplificador'];

    const hasGear = entities.some(e => gearKeywords.some(k => e.includes(k)));

    if (hasGear) {
        const prose = document.querySelector('.passport-prose') || document.querySelector('main');
        const paragraphs = prose.querySelectorAll('p');

        if (paragraphs.length > 4) {
            const slot = document.createElement('div');
            slot.className = 'passport-affiliate-slot';
            slot.innerHTML = `
                <strong style="display:block; margin-bottom:8px; color:#b20f18;">🎸 O Gear desta Rota</strong>
                <p style="margin:0; font-size:0.9rem;">Encontre pedais, guitarras e amps usados nesta matéria na nossa loja parceira.</p>
                <!-- AQUI ENTRA O SEU LINK DA AMAZON / SHOPEE / MERCADO LIVRE -->
            `;
            paragraphs[3].insertAdjacentElement('afterend', slot);
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPassportEditorialSystem);
} else {
    initPassportEditorialSystem();
}
