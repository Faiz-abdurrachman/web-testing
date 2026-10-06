(() => {
  const byId = (id) => document.getElementById(id);
  const form = byId('project-form');
  let state;
  let selected;
  let busy = false;
  let dirty = false;
  const errors = {
    UNAUTHORIZED:
      'Masuk dengan akun Google owner untuk mengelola Projects. Perubahan formulir belum disimpan.',
    CONFIGURATION:
      'Konfigurasi penerbitan belum lengkap. Hubungi pengelola situs.',
    INVALID_INPUT:
      'Isi project belum valid. Periksa judul, deskripsi, kategori dan gambar.',
    INVALID_DATA: 'Data projects belum bisa dibaca. Hubungi pengelola situs.',
    CONFLICT:
      'Project sudah berubah sejak halaman dibuka. Muat ulang sebelum menyimpan lagi.',
    NOT_FOUND: 'Project tidak ditemukan. Muat ulang daftar projects.',
    MINIMUM: 'Minimal satu project harus tetap tersedia.',
    LIMIT: 'Maksimal delapan projects. Hapus satu sebelum menambah.',
    COLLISION: 'ID baru belum bisa dibuat. Coba tambah lagi.',
    SERVER_ERROR:
      'Operasi belum berhasil. Muat ulang projects untuk memeriksa isi yang tersimpan.',
  };
  const message = (text, error = false) => {
    byId('status').textContent = text;
    byId('status').dataset.error = String(error);
  };
  const setBusy = (value) => {
    busy = value;
    byId('fields').disabled = value;
    document.querySelectorAll('button').forEach((button) => {
      button.disabled = value;
    });
    byId('workspace').setAttribute('aria-busy', String(value));
    byId('add').disabled =
      value || !state || state.projects.length >= state.maxProjects;
    byId('delete').disabled =
      value ||
      !selected ||
      !state ||
      state.projects.length <= state.minProjects;
  };
  let csrf;
  const expire = () => {
    byId('workspace').hidden = true;
    byId('logout').hidden = true;
    byId('login').hidden = false;
    byId('retry').hidden = true;
    byId('reload').hidden = false;
    message(
      'Sesi berakhir. Masuk lagi sebelum melanjutkan. Perubahan formulir belum disimpan.',
      true,
    );
  };
  const operations = {
    adminLoadProjects: 'load',
    adminSaveProject: 'save',
    adminAddProject: 'add',
    adminDeleteProject: 'delete',
    adminRetryPublication: 'retry',
  };
  const rpc = async (name, payload) => {
    const load = name === 'adminLoadProjects';
    const response = await fetch('/api/admin/projects', {
      method: load ? 'GET' : 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      ...(load
        ? {}
        : {
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': csrf,
            },
            body: JSON.stringify({
              operation: operations[name],
              ...(payload === undefined ? {} : { payload }),
            }),
          }),
    });
    const result = await response.json();
    if (result.error?.code === 'UNAUTHORIZED') {
      expire();
      return result;
    }
    if (result.ok) {
      csrf = result.csrf;
      byId('login').hidden = true;
      byId('logout').hidden = false;
    }
    return result;
  };
  const choose = (id) => {
    if (
      busy ||
      (dirty &&
        !window.confirm(
          'Perubahan belum disimpan. Pindah project dan abaikan perubahan?',
        ))
    )
      return;
    selected = id;
    dirty = false;
    const record = state.projects.find((project) => project.id === id) || {
      title: '',
      description: '',
      tags: ['', ''],
      image: state.imagePresets[0],
    };
    byId('editor-title').textContent = id ? 'Isi project' : 'Project baru';
    setBusy(false);
    byId('title').value = record.title;
    byId('description').value = record.description;
    byId('tag-one').value = record.tags[0];
    byId('tag-two').value = record.tags[1];
    byId('image').value = record.image;
    document
      .querySelectorAll('.project-choice')
      .forEach((button) =>
        button.setAttribute('aria-current', String(button.dataset.id === id)),
      );
  };
  const render = () => {
    byId('project-list').replaceChildren();
    state.projects.forEach((project) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'project-choice';
      button.dataset.id = project.id;
      button.textContent = project.title;
      button.addEventListener('click', () => choose(project.id));
      byId('project-list').append(button);
    });
    byId('image').replaceChildren();
    state.imagePresets.forEach((image, index) => {
      const option = document.createElement('option');
      option.value = image;
      option.textContent = 'Gambar ' + (index + 1);
      byId('image').append(option);
    });
    byId('workspace').hidden = false;
    choose(
      state.projects.some((project) => project.id === selected)
        ? selected
        : state.projects[0].id,
    );
  };
  const publicationMessage = (publication, saved) => {
    const accepted = publication.every((item) => item.accepted);
    byId('retry').hidden = accepted;
    message(
      accepted
        ? (saved ? 'Perubahan tersimpan. ' : '') +
            'Penerbitan dimulai untuk testing dan production. Tunggu beberapa menit sebelum memeriksa situs.'
        : 'Perubahan tersimpan, tetapi penerbitan belum berhasil untuk semua situs. Klik Coba terbitkan lagi.',
      !accepted,
    );
  };
  const load = async () => {
    if (
      busy ||
      (dirty &&
        !window.confirm(
          'Muat ulang dan abaikan perubahan yang belum disimpan?',
        ))
    )
      return;
    setBusy(true);
    message('Memuat projects…');
    try {
      const result = await rpc('adminLoadProjects');
      if (!result.ok) {
        message(errors[result.error.code] || errors.SERVER_ERROR, true);
        byId('reload').hidden = false;
        return;
      }
      state = result.data;
      dirty = false;
      setBusy(false);
      render();
      byId('reload').hidden = true;
      byId('retry').hidden = !state.publicationPending;
      message(
        state.publicationPending
          ? 'Ada perubahan tersimpan yang belum berhasil diterbitkan. Klik Coba terbitkan lagi.'
          : 'Pilih project yang ingin diubah.',
      );
    } catch (_error) {
      message(
        'Koneksi terputus. Muat ulang projects untuk mencoba lagi.',
        true,
      );
      byId('reload').hidden = false;
    } finally {
      setBusy(false);
    }
  };
  form.addEventListener('input', () => {
    dirty = true;
  });
  form.addEventListener('change', () => {
    dirty = true;
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (busy || !form.reportValidity()) return;
    const project = {
      ...(selected ? { id: selected } : {}),
      title: byId('title').value,
      description: byId('description').value,
      tags: [byId('tag-one').value, byId('tag-two').value],
      image: byId('image').value,
    };
    setBusy(true);
    message('Menyimpan dan meminta penerbitan…');
    try {
      const result = await rpc(
        selected ? 'adminSaveProject' : 'adminAddProject',
        {
          project,
          revision: state.revision,
        },
      );
      if (!result.ok) {
        message(errors[result.error.code] || errors.SERVER_ERROR, true);
        byId('reload').hidden = false;
        return;
      }
      state = result.data;
      selected = result.data.affectedId;
      dirty = false;
      setBusy(false);
      render();
      byId('reload').hidden = true;
      publicationMessage(result.data.publication, true);
    } catch (_error) {
      message(
        'Koneksi terputus. Muat ulang projects sebelum menyimpan lagi untuk memeriksa perubahan terakhir.',
        true,
      );
      byId('reload').hidden = false;
    } finally {
      setBusy(false);
    }
  });
  byId('add').addEventListener('click', () => {
    if (busy || state.projects.length >= state.maxProjects) return;
    choose(null);
    if (selected === null) {
      dirty = true;
      byId('title').focus();
    }
  });
  byId('delete').addEventListener('click', async () => {
    if (busy || !selected || state.projects.length <= state.minProjects) return;
    const record = state.projects.find((project) => project.id === selected);
    if (
      !window.confirm(
        'Hapus project “' + record.title + '”? Situs akan dibangun ulang.',
      )
    )
      return;
    setBusy(true);
    message('Menghapus dan meminta penerbitan…');
    try {
      const result = await rpc('adminDeleteProject', {
        id: selected,
        revision: state.revision,
      });
      if (!result.ok) {
        message(errors[result.error.code] || errors.SERVER_ERROR, true);
        byId('reload').hidden = false;
        return;
      }
      state = result.data;
      dirty = false;
      setBusy(false);
      render();
      byId('reload').hidden = true;
      publicationMessage(result.data.publication, true);
      byId('title').focus();
    } catch (_error) {
      message(
        'Koneksi terputus. Muat ulang projects sebelum menghapus lagi untuk memeriksa perubahan terakhir.',
        true,
      );
      byId('reload').hidden = false;
    } finally {
      setBusy(false);
    }
  });
  byId('retry').addEventListener('click', async () => {
    if (busy) return;
    setBusy(true);
    message('Meminta penerbitan ulang…');
    try {
      const result = await rpc('adminRetryPublication');
      if (!result.ok)
        message(errors[result.error.code] || errors.SERVER_ERROR, true);
      else publicationMessage(result.data.publication, false);
    } catch (_error) {
      message('Koneksi terputus. Coba terbitkan lagi.', true);
    } finally {
      setBusy(false);
    }
  });
  byId('reload').addEventListener('click', load);
  window.addEventListener('beforeunload', (event) => {
    if (dirty) {
      event.preventDefault();
      event.returnValue = '';
    }
  });
  byId('logout').addEventListener('click', async () => {
    if (
      busy ||
      (dirty &&
        !window.confirm('Keluar dan abaikan perubahan yang belum disimpan?'))
    )
      return;
    setBusy(true);
    try {
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'X-CSRF-Token': csrf },
      });
      if (!response.ok) {
        message('Belum bisa keluar. Coba lagi.', true);
        return;
      }
      dirty = false;
      state = undefined;
      form.reset();
      byId('project-list').replaceChildren();
      expire();
      byId('reload').hidden = true;
      message('Sudah keluar. Masuk dengan Google untuk mengelola Projects.');
    } catch {
      message('Koneksi terputus. Coba keluar lagi.', true);
    } finally {
      setBusy(false);
    }
  });
  if (new URL(location.href).searchParams.has('login')) {
    message(
      new URL(location.href).searchParams.get('login') === 'unavailable'
        ? 'Login admin belum aktif. Hubungi pengelola situs.'
        : 'Login belum berhasil. Gunakan akun owner atau hubungi pengelola situs.',
      true,
    );
    history.replaceState(null, '', '/admin/');
  } else load();
})();
