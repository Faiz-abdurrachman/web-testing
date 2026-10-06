import { HODS_DIVISIONS } from '../data/recruitment-form';

const STORAGE_KEY = 'ds_recruitment_application_draft';
const SUBMISSION_KEY = 'ds_recruitment_application_pending';
let dispose: (() => void) | undefined;

function initRecruitmentForm() {
  dispose?.();
  const form = document.querySelector<HTMLFormElement>(
    '#recruitment-apply-form',
  );
  if (!form) return;
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const steps = [...form.querySelectorAll<HTMLElement>('.form-step')];
  const nav = [...document.querySelectorAll<HTMLButtonElement>('.step-btn')];
  const progress = document.querySelector<HTMLElement>('#stepper-progress');
  const status = document.querySelector<HTMLElement>('#application-status');
  let currentStep = 1;
  let accepting = false;
  let busy = false;
  let confirmed = false;
  let pending:
    { id: string; fields: Record<string, string | string[]> } | undefined;
  const submitButton = document.querySelector<HTMLButtonElement>(
    '#btn-submit-application',
  );
  const submitLabel = submitButton?.querySelector('.submit-text');
  const setMessage = (message: string) => {
    if (status) status.textContent = message;
  };
  const lockAnswers = (locked: boolean) =>
    controls().forEach((input) => (input.disabled = locked));

  let timer: ReturnType<typeof setTimeout> | undefined;
  const controls = () => [
    ...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      'input, textarea',
    ),
  ];
  const scroll = (element: HTMLElement) =>
    element.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
      block: 'start',
    });

  const goToStep = (step: number, focus = true) => {
    currentStep = step;
    steps.forEach((panel) =>
      panel.classList.toggle(
        'is-active',
        Number(panel.dataset.stepPanel) === step,
      ),
    );
    nav.forEach((button) => {
      const number = Number(button.dataset.step);
      button.classList.toggle('is-active', number === step);
      button.classList.toggle('is-completed', number < step);
      if (number === step) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    if (progress) progress.style.width = `${(step / steps.length) * 100}%`;
    if (focus) {
      const panel = steps[step - 1];
      panel.focus({ preventScroll: true });
      scroll(panel);
    }
  };

  const validateStep = (step: number) => {
    const panel = steps[step - 1];
    panel
      .querySelectorAll('.has-error')
      .forEach((field) => field.classList.remove('has-error'));
    panel
      .querySelectorAll('.field-error')
      .forEach((error) => (error.textContent = ''));
    panel
      .querySelectorAll('[aria-invalid]')
      .forEach((input) => input.removeAttribute('aria-invalid'));
    let first: HTMLInputElement | HTMLTextAreaElement | undefined;
    const radioGroups = new Set<string>();
    for (const input of panel.querySelectorAll<
      HTMLInputElement | HTMLTextAreaElement
    >('input, textarea')) {
      let message = '';
      if (input instanceof HTMLInputElement && input.type === 'radio') {
        if (radioGroups.has(input.name)) continue;
        radioGroups.add(input.name);
        const group = controls().filter(
          (control) => control.name === input.name,
        ) as HTMLInputElement[];
        if (
          group.some((control) => control.required) &&
          !group.some((control) => control.checked)
        )
          message = 'Pilihan ini wajib diisi.';
      } else if (
        input instanceof HTMLInputElement &&
        input.type === 'checkbox'
      ) {
        if (input.required && !input.checked)
          message = 'Harap centang semua pernyataan persetujuan.';
      } else if (input.required && !input.value.trim()) {
        message = 'Bagian ini wajib diisi.';
      } else if (
        input.value &&
        input instanceof HTMLInputElement &&
        input.type === 'email' &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())
      ) {
        message = 'Format email tidak valid.';
      } else if (
        input.value &&
        input instanceof HTMLInputElement &&
        input.type === 'url'
      ) {
        try {
          const url = new URL(input.value);
          if (!['https:', 'http:'].includes(url.protocol)) throw new Error();
        } catch {
          message = 'Gunakan tautan lengkap http:// atau https://.';
        }
      }
      if (!message) continue;
      first ??= input;
      input.setAttribute('aria-invalid', 'true');
      const field = input.closest<HTMLElement>('.field');
      field?.classList.add('has-error');
      const error = field?.querySelector<HTMLElement>('.field-error');
      if (error) error.textContent = message;
    }
    if (first) {
      goToStep(step, false);
      first.focus({ preventScroll: true });
      scroll(first.closest<HTMLElement>('.field') || first);
      return false;
    }
    return true;
  };

  const renderDomain = (id: string) => {
    const domain = HODS_DIVISIONS.find((item) => item.id === id);
    if (!domain) return;
    const createOption = (
      name: string,
      value: string,
      type: 'radio' | 'checkbox',
    ) => {
      const label = document.createElement('label');
      label.className = `pill-${type}-label`;
      const input = document.createElement('input');
      input.type = type;
      input.name = name;
      input.value = value;
      const span = document.createElement('span');
      span.className = 'pill-content';
      span.textContent = value;
      label.append(input, span);
      return label;
    };
    const areas = document.querySelector('#specific-area-options');
    areas?.replaceChildren(
      ...domain.specificAreas.map((area) =>
        createOption('specific_area', area, 'radio'),
      ),
    );
    const skills = document.querySelector('#skills-matrix-container');
    skills?.replaceChildren();
    for (const group of domain.skills) {
      if (group.category) {
        const title = document.createElement('h4');
        title.className = 'skill-cat-title';
        title.textContent = group.category;
        skills?.append(title);
      }
      const grid = document.createElement('div');
      grid.className = 'pills-grid';
      grid.append(
        ...group.items.map((skill) =>
          createOption('foundation_skills', skill, 'checkbox'),
        ),
      );
      skills?.append(grid);
    }
  };

  const persist = () => {
    clearTimeout(timer);
    try {
      if (confirmed || pending) return;
      const entries = new FormData(form);
      const draft: Record<string, string[]> = {};
      for (const name of new Set(entries.keys()))
        if (name !== 'website') draft[name] = entries.getAll(name).map(String);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      /* Form remains usable when browser storage is unavailable. */
    }
  };
  const saveDraft = () => {
    clearTimeout(timer);
    timer = setTimeout(persist, 400);
  };
  let draft: Record<string, unknown> = {};
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed))
      draft = parsed;
  } catch {
    /* Ignore malformed/unavailable browser drafts. */
  }
  try {
    const saved = JSON.parse(localStorage.getItem(SUBMISSION_KEY) || 'null');
    if (
      saved &&
      typeof saved.id === 'string' &&
      saved.fields &&
      typeof saved.fields === 'object'
    ) {
      pending = saved;
      draft = saved.fields;
    }
  } catch {
    /* Keep form usable if browser storage is unavailable. */
  }
  const values = (name: string) => {
    const value = draft[name];
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === 'string')
      : typeof value === 'string'
        ? [value]
        : [];
  };
  const urlRole = pending
    ? null
    : new URLSearchParams(location.search).get('role');
  const domain = HODS_DIVISIONS.some((item) => item.id === urlRole)
    ? urlRole!
    : values('primary_hods')[0];
  if (domain) renderDomain(domain);
  for (const input of controls()) {
    const saved = values(input.name);
    if (input.name === 'primary_hods' && input instanceof HTMLInputElement) {
      input.checked = input.value === domain;
    } else if (
      input instanceof HTMLInputElement &&
      ['radio', 'checkbox'].includes(input.type)
    ) {
      if (input.name in draft) input.checked = saved.includes(input.value);
    } else if (saved.length) input.value = saved[0];
  }
  if (urlRole && urlRole !== values('primary_hods')[0]) {
    form
      .querySelectorAll<HTMLInputElement>(
        '[name="specific_area"], [name="foundation_skills"]',
      )
      .forEach((input) => (input.checked = false));
  }

  form.addEventListener('input', saveDraft, options);
  form.addEventListener(
    'change',
    (event) => {
      const input = event.target;
      if (input instanceof HTMLInputElement && input.name === 'primary_hods')
        renderDomain(input.value);
      saveDraft();
    },
    options,
  );
  const navigate = (target: number) => {
    if (busy || confirmed) return;
    if (target < 1 || target > steps.length) return;
    if (target > currentStep && !pending) {
      for (let step = 1; step < target; step++) if (!validateStep(step)) return;
    }
    goToStep(target);
  };
  nav.forEach((button) =>
    button.addEventListener(
      'click',
      () => navigate(Number(button.dataset.step)),
      options,
    ),
  );
  form.addEventListener(
    'click',
    (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
        '[data-action]',
      );
      if (button)
        navigate(
          currentStep + (button.dataset.action === 'next-step' ? 1 : -1),
        );
    },
    options,
  );
  form.addEventListener(
    'submit',
    async (event) => {
      event.preventDefault();
      if (busy || confirmed) return;
      if (!accepting) {
        setMessage('Pendaftaran belum dibuka. Jawaban belum dikirim.');
        return;
      }
      if (!pending) {
        for (let step = 1; step <= steps.length; step++)
          if (!validateStep(step)) return;
        persist();
        const entries = new FormData(form);
        const fields: Record<string, string | string[]> = {};
        const multi = [
          'learning_methods',
          'desired_output',
          'team_roles',
          'contribution_types',
          'foundation_skills',
        ];
        for (const name of new Set(entries.keys())) {
          if (name !== 'website')
            fields[name] = multi.includes(name)
              ? entries.getAll(name).map(String)
              : String(entries.get(name));
        }
        pending = { id: crypto.randomUUID(), fields };
        try {
          localStorage.setItem(SUBMISSION_KEY, JSON.stringify(pending));
        } catch {
          /* In-memory retry still uses the same receipt. */
        }
      }
      busy = true;
      lockAnswers(true);
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.classList.add('is-loading');
      }
      setMessage('Mengirim pendaftaran…');
      try {
        const response = await fetch('/api/recruitment/application', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...pending,
            website:
              form.querySelector<HTMLInputElement>('[name="website"]')?.value ||
              '',
          }),
          signal: AbortSignal.timeout(75000),
        });
        const result = await response.json();
        if (
          !response.ok ||
          result.ok !== true ||
          result.receipt !== pending.id
        ) {
          if (response.status === 400 || response.status === 413) {
            pending = undefined;
            try {
              localStorage.removeItem(SUBMISSION_KEY);
            } catch {
              /* No persistent storage. */
            }
            lockAnswers(false);
            throw new Error('INVALID_INPUT');
          }
          throw new Error('UNCONFIRMED');
        }
        confirmed = true;
        clearTimeout(timer);
        try {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(SUBMISSION_KEY);
        } catch {
          /* Receipt still confirms server storage. */
        }
        form.hidden = true;
        document.querySelector<HTMLElement>('.stepper-nav')!.hidden = true;
        if (status) status.hidden = true;
        const success = document.querySelector<HTMLElement>('#success-screen');
        const receipt = document.querySelector('#application-receipt');
        if (receipt)
          receipt.textContent = `Nomor pendaftaran: ${result.receipt}`;
        if (success) {
          success.hidden = false;
          success.focus();
          scroll(success);
        }
        window.dispatchEvent(new CustomEvent('ds:sfx', { detail: 'success' }));
      } catch (error) {
        setMessage(
          error instanceof Error && error.message === 'INVALID_INPUT'
            ? 'Jawaban belum diterima. Periksa format nomor WhatsApp dan seluruh isian, lalu kirim kembali.'
            : 'Penyimpanan belum terkonfirmasi. Jawaban tetap disimpan di perangkat ini jika tersedia. Coba kirim kembali dengan jawaban yang sama; nomor pendaftaran tetap sama agar tidak tercatat dua kali.',
        );
        if (submitLabel)
          submitLabel.textContent = pending
            ? 'Coba kirim kembali'
            : 'Submit Application';
        if (status) {
          status.focus();
          scroll(status);
        }
      } finally {
        busy = false;
        if (submitButton) {
          submitButton.disabled = confirmed || !accepting;
          submitButton.classList.remove('is-loading');
        }
      }
    },
    options,
  );
  void fetch('/api/recruitment/application', {
    signal: controller.signal,
    cache: 'no-store',
  })
    .then(async (response) => {
      if (!response.ok) return;
      const result = await response.json();
      if (controller.signal.aborted) return;
      accepting = result.ok === true && result.accepting === true;
      if (submitButton) submitButton.disabled = !accepting;
      if (submitLabel && accepting)
        submitLabel.textContent = pending
          ? 'Coba kirim kembali'
          : 'Submit Application';
      if (accepting)
        setMessage(
          pending
            ? 'Penyimpanan sebelumnya belum terkonfirmasi. Coba kirim kembali dengan nomor pendaftaran yang sama.'
            : 'Draft disimpan otomatis di perangkat ini jika penyimpanan browser tersedia. Klik Submit Application untuk mengirim jawaban kepada tim Data Sorcerers.',
        );
    })
    .catch(() => {
      /* Closed on unavailable/configuration status; no false success. */
    });
  goToStep(pending ? 4 : 1, false);
  if (pending) lockAnswers(true);
  dispose = () => {
    persist();
    controller.abort();
    dispose = undefined;
  };
}

document.addEventListener('astro:page-load', initRecruitmentForm);
document.addEventListener('astro:before-swap', () => dispose?.());
window.addEventListener('pagehide', () => dispose?.());
