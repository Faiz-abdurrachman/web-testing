(() => {
  const byId = (id) => document.getElementById(id);
  const api = '/api/admin/recruitment';
  let accessToken = null;
  let applications = [];
  let total = 0;
  let filtered = 0;
  let selectedReceipt = null;
  let busy = false;
  let page = 0;
  const PAGE_SIZE = 50;
  const hodsDivisions = [
    'data',
    'core',
    'language',
    'vision',
    'product',
    'growth',
  ];
  const errors = {
    UNAUTHORIZED: 'Akses ditolak. Login diperlukan.',
    CONFIGURATION: 'Konfigurasi server belum lengkap.',
    INVALID_INPUT: 'Permintaan tidak valid.',
    NOT_FOUND: 'Data tidak ditemukan.',
    SERVER_ERROR: 'Kesalahan server. Coba lagi.',
  };

  const message = (text, error = false) => {
    byId('status').textContent = text;
    byId('status').dataset.error = String(error);
  };

  const setBusy = (value) => {
    busy = value;
    document
      .querySelectorAll('button, input, select')
      .forEach((el) => (el.disabled = value));
  };

  const tokenFromCookie = () => {
    const match = document.cookie.match(/(?:^|;\s*)sb-access-token=([^;]+)/);
    return match ? match[1] : null;
  };

  const expire = () => {
    accessToken = null;
    byId('workspace').hidden = true;
    byId('login').hidden = false;
    byId('logout').hidden = true;
    byId('detail-area').hidden = true;
    byId('table-wrapper').hidden = false;
    message('Sesi berakhir. Silakan login ulang.', true);
  };

  const apiFetch = async (route, params = {}) => {
    const token = accessToken || tokenFromCookie();
    if (!token) {
      expire();
      return null;
    }
    const url = new URL(api + '/' + route, location.origin);
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    }
    try {
      const response = await fetch(url, {
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { Authorization: 'Bearer ' + token },
      });
      const result = await response.json();
      if (result.error?.code === 'UNAUTHORIZED') {
        expire();
        return null;
      }
      if (result.ok) {
        byId('login').hidden = true;
        byId('logout').hidden = false;
        accessToken = token;
      }
      return result;
    } catch {
      if (!busy) message('Koneksi terputus.', true);
      return null;
    }
  };

  const renderStats = (stats) => {
    const container = byId('stats');
    container.innerHTML = '';
    if (!stats) return;
    const cards = [
      { label: 'Total', value: stats.total ?? 0 },
      ...(stats.by_hods || []).map((h) => ({
        label: h.hods,
        value: h.count,
      })),
    ];
    for (const card of cards) {
      const div = document.createElement('div');
      div.className = 'stat-card';
      div.innerHTML =
        '<span class="number">' +
        card.value +
        '</span><span class="label">' +
        card.label +
        '</span>';
      container.appendChild(div);
    }
  };

  const renderTable = () => {
    const tbody = byId('applications-body');
    tbody.innerHTML = '';
    const start = page * PAGE_SIZE;
    const slice = applications.slice(start, start + PAGE_SIZE);
    if (slice.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" style="text-align:center;color:#bcb7cb">Belum ada pendaftar.</td></tr>';
      return;
    }
    for (const app of slice) {
      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      tr.innerHTML =
        '<td>' +
        escapeHtml(app.full_name || '-') +
        '</td><td>' +
        escapeHtml(app.email || '-') +
        '</td><td>' +
        escapeHtml(app.primary_hods || '-') +
        '</td><td>' +
        formatDate(app.received_at) +
        '</td><td style="font-family:monospace;font-size:12px">' +
        (app.receipt || '').slice(0, 8) +
        '…</td>';
      tr.addEventListener('click', () => loadDetail(app.receipt));
      tbody.appendChild(tr);
    }
    byId('page-info').textContent =
      'Halaman ' +
      (page + 1) +
      ' dari ' +
      Math.max(1, Math.ceil(applications.length / PAGE_SIZE));
    byId('pagination').hidden = applications.length <= PAGE_SIZE;
    byId('prev-page').disabled = page === 0;
    byId('next-page').disabled = (page + 1) * PAGE_SIZE >= applications.length;
  };

  const escapeHtml = (text) => {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  };

  const formatDate = (iso) => {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const loadList = async (search, hods) => {
    setBusy(true);
    message('Memuat data…');
    try {
      const params = { limit: 200 };
      if (search) params.search = search;
      if (hods) params.primary_hods = hods;
      const result = await apiFetch('applications', params);
      if (!result || !result.ok) {
        if (result === null) return;
        message(errors[result.error?.code] || errors.SERVER_ERROR, true);
        return;
      }
      applications = result.data?.applications || [];
      total = result.data?.total || 0;
      filtered = result.data?.filtered || 0;
      page = 0;
      selectedReceipt = null;
      byId('detail-area').hidden = true;
      byId('table-wrapper').hidden = false;
      renderTable();
      message(filtered + ' dari ' + total + ' pendaftar');
    } catch {
      message('Gagal memuat data.', true);
    } finally {
      setBusy(false);
    }
  };

  const loadDetail = async (receipt) => {
    setBusy(true);
    message('Memuat detail…');
    try {
      const result = await apiFetch('application', { receipt });
      if (!result || !result.ok) {
        if (result === null) return;
        message(errors[result.error?.code] || 'Gagal memuat detail.', true);
        return;
      }
      selectedReceipt = receipt;
      byId('table-wrapper').hidden = true;
      byId('detail-area').hidden = false;
      byId('pagination').hidden = true;
      const data = result.data;
      const panel = byId('detail-panel');
      panel.innerHTML = '';
      const fields = data.fields || {};
      const allKeys = [
        'full_name',
        'preferred_name',
        'email',
        'whatsapp',
        'institution',
        'city_region',
        'current_status',
        'current_level',
        'primary_hods',
        'most_relevant_work',
        'real_world_problem',
        'explore_or_build',
        'why_join',
        'time_commitment',
        'team_comfort',
        'independent_learning',
        'cross_hods_willingness',
      ];
      for (const key of allKeys) {
        const val = fields[key];
        if (val === undefined || val === null || val === '') continue;
        const div = document.createElement('div');
        div.className = 'field';
        div.innerHTML =
          '<div class="field-label">' +
          escapeHtml(key) +
          '</div><div>' +
          escapeHtml(Array.isArray(val) ? val.join(', ') : String(val)) +
          '</div>';
        panel.appendChild(div);
      }
      message(
        'Detail pendaftar: ' + (data.full_name || fields.full_name || ''),
      );
    } catch {
      message('Gagal memuat detail.', true);
    } finally {
      setBusy(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await apiFetch('stats');
      if (result?.ok) renderStats(result.data);
    } catch {
      // Stats failure is non-critical.
    }
  };

  const init = () => {
    const params = new URL(location.href).searchParams;
    if (params.get('login') === 'failed') {
      message('Login gagal. Coba lagi.', true);
      history.replaceState(null, '', '/admin/recruitment/');
    }

    const token = tokenFromCookie();
    if (token) {
      accessToken = token;
      byId('login').hidden = true;
      byId('logout').hidden = false;
      byId('workspace').hidden = false;
      loadList();
      loadStats();
    } else {
      // Check URL for hash-fragment tokens from Supabase implicit flow
      const hash = location.hash;
      if (hash && hash.includes('access_token=')) {
        const h = new URLSearchParams(hash.replace('#', '?'));
        const t = h.get('access_token');
        const r = h.get('refresh_token');
        if (t) {
          document.cookie =
            'sb-access-token=' +
            t +
            '; Path=/; SameSite=Lax; Max-Age=' +
            86400 +
            '; Secure';
          if (r)
            document.cookie =
              'sb-refresh-token=' +
              r +
              '; Path=/; SameSite=Lax; Max-Age=' +
              86400 +
              '; Secure';
          location.href = '/admin/recruitment/';
          return;
        }
      }
      message('Belum login. Klik "Masuk dengan Google".');
    }

    // Populate filter dropdown
    const select = byId('filter-hods');
    for (const h of hodsDivisions) {
      const opt = document.createElement('option');
      opt.value = h;
      opt.textContent = h;
      select.appendChild(opt);
    }

    byId('login').addEventListener('click', (e) => {
      e.preventDefault();
      location.href = byId('login').href;
    });

    byId('logout').addEventListener('click', async () => {
      document.cookie = 'sb-access-token=; Path=/; Max-Age=0; Secure';
      document.cookie = 'sb-refresh-token=; Path=/; Max-Age=0; Secure';
      expire();
      message('Sudah keluar.');
    });

    byId('filter-btn').addEventListener('click', () => {
      loadList(byId('search').value, byId('filter-hods').value);
    });

    byId('search').addEventListener('keydown', (e) => {
      if (e.key === 'Enter')
        loadList(byId('search').value, byId('filter-hods').value);
    });

    byId('prev-page').addEventListener('click', () => {
      if (page > 0) {
        page--;
        renderTable();
      }
    });

    byId('next-page').addEventListener('click', () => {
      if ((page + 1) * PAGE_SIZE < applications.length) {
        page++;
        renderTable();
      }
    });

    byId('back-list').addEventListener('click', () => {
      selectedReceipt = null;
      byId('detail-area').hidden = true;
      byId('table-wrapper').hidden = false;
      renderTable();
      message(filtered + ' dari ' + total + ' pendaftar');
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
