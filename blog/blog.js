/* ═══ Blog hub: search, category filter, pagination ═══ */
(function () {
  const grid = document.getElementById('postGrid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.post-card'));
  const chips = Array.from(document.querySelectorAll('.filter-chip'));
  const searchInput = document.getElementById('blogSearch');
  const pagination = document.getElementById('pagination');
  const noResults = document.getElementById('noResults');
  const featuredSection = document.getElementById('featuredSection');
  const resetBtn = document.getElementById('resetFilters');
  const PER_PAGE = 6;

  const params = new URLSearchParams(location.search);
  let state = {
    category: params.get('categorie') || 'alle',
    query: (params.get('zoeken') || '').toLowerCase(),
    page: 1
  };

  if (searchInput) searchInput.value = params.get('zoeken') || '';
  chips.forEach(chip => chip.classList.toggle('active', chip.dataset.category === state.category));

  function matches(card) {
    const inCategory = state.category === 'alle' || card.dataset.category === state.category;
    const haystack = (card.dataset.title + ' ' + card.dataset.excerpt + ' ' + card.dataset.tags).toLowerCase();
    const inQuery = !state.query || haystack.includes(state.query);
    return inCategory && inQuery;
  }

  function render() {
    const filtered = cards.filter(matches);
    const hasFilter = state.category !== 'alle' || state.query;
    if (featuredSection) featuredSection.hidden = hasFilter;

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    if (state.page > totalPages) state.page = totalPages;
    const start = (state.page - 1) * PER_PAGE;
    const visible = new Set(filtered.slice(start, start + PER_PAGE));

    cards.forEach(card => { card.hidden = !visible.has(card); });
    if (noResults) noResults.classList.toggle('visible', filtered.length === 0);

    renderPagination(totalPages);

    const url = new URL(location.href);
    state.category === 'alle' ? url.searchParams.delete('categorie') : url.searchParams.set('categorie', state.category);
    state.query ? url.searchParams.set('zoeken', state.query) : url.searchParams.delete('zoeken');
    history.replaceState(null, '', url.pathname + url.search);
  }

  function renderPagination(totalPages) {
    if (!pagination) return;
    pagination.innerHTML = '';
    if (totalPages <= 1) return;

    const makeBtn = (label, page, opts = {}) => {
      const b = document.createElement('button');
      b.className = 'page-btn' + (opts.active ? ' active' : '');
      b.type = 'button';
      b.textContent = label;
      b.disabled = !!opts.disabled;
      b.addEventListener('click', () => { state.page = page; render(); pagination.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
      return b;
    };

    pagination.appendChild(makeBtn('←', state.page - 1, { disabled: state.page === 1 }));
    for (let i = 1; i <= totalPages; i++) {
      pagination.appendChild(makeBtn(String(i), i, { active: i === state.page }));
    }
    pagination.appendChild(makeBtn('→', state.page + 1, { disabled: state.page === totalPages }));
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      state.category = chip.dataset.category;
      state.page = 1;
      chips.forEach(c => c.classList.toggle('active', c === chip));
      render();
    });
  });

  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        state.query = searchInput.value.toLowerCase().trim();
        state.page = 1;
        render();
      }, 200);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state = { category: 'alle', query: '', page: 1 };
      if (searchInput) searchInput.value = '';
      chips.forEach(c => c.classList.toggle('active', c.dataset.category === 'alle'));
      render();
    });
  }

  render();
})();

/* ═══ Article: table-of-contents scrollspy ═══ */
(function () {
  const tocLinks = Array.from(document.querySelectorAll('.toc a'));
  if (!tocLinks.length) return;

  const targets = tocLinks
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const link = tocLinks.find(a => a.getAttribute('href') === '#' + entry.target.id);
      if (!link) return;
      if (entry.isIntersecting) {
        tocLinks.forEach(a => a.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  targets.forEach(t => spy.observe(t));
})();

/* ═══ Newsletter signup ═══ */
(function () {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  const msg = document.getElementById('newsletterMsg');
  const emailInput = form.querySelector('input[type="email"]');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!valid) {
      msg.textContent = 'Vul een geldig e-mailadres in.';
      msg.className = 'newsletter-msg error';
      return;
    }

    const endpoint = form.getAttribute('action');
    // Zodra een echt formulier-endpoint is ingevuld (Mailchimp, Brevo, een Vercel
    // serverless function, etc.) via action="...", wordt hier naartoe gepost.
    if (endpoint && endpoint !== '#') {
      try {
        await fetch(endpoint, { method: 'POST', body: new FormData(form), mode: 'no-cors' });
        msg.textContent = 'Bedankt! U ontvangt een bevestiging per e-mail.';
        msg.className = 'newsletter-msg ok';
        form.reset();
        return;
      } catch (err) {
        /* val terug op mailto hieronder */
      }
    }

    // Fallback zolang er nog geen provider is gekoppeld: open de mail-client.
    window.location.href = 'mailto:info@donkersadvies.nl?subject=' +
      encodeURIComponent('Aanmelding nieuwsbrief') + '&body=' +
      encodeURIComponent('Meld dit e-mailadres aan voor de nieuwsbrief: ' + email);
    msg.textContent = 'Uw e-mailprogramma wordt geopend om de aanmelding te versturen.';
    msg.className = 'newsletter-msg ok';
  });
})();
