const id = {
  translation: {
    common: {
      loading: 'Memuat...',
      error: 'Terjadi kesalahan',
      retry: 'Coba Lagi',
      cancel: 'Batal',
      save: 'Simpan',
      edit: 'Ubah',
      delete: 'Hapus',
      back: 'Kembali',
      logout: 'Keluar',
    },
    auth: {
      userId: 'ID Pengguna',
      userKey: 'Kata Sandi',
      start: 'Mulai',
      loginFailed: 'Login gagal. Silakan coba lagi.',
    },
    roomList: {
      title: 'Percakapan',
      empty: 'Belum ada percakapan',
    },
    chat: {
      placeholder: 'Ketik pesan…',
      online: 'Online',
      typing: '{{username}} sedang mengetik…',
      loadMore: 'Muat lebih banyak',
      sendFailed: 'Gagal mengirim pesan',
      fileTooLarge: 'File terlalu besar (maks {{max}} MB)',
      fileUnsupported: 'Tipe file tidak didukung',
    },
    userList: {
      title: 'Pilih Kontak',
      createGroup: 'Buat Grup Chat',
      contact: 'Kontak',
    },
    createGroup: {
      chooseMembers: 'Pilih Anggota',
      groupName: 'Nama Grup',
      groupNamePlaceholder: 'Masukkan nama grup…',
      create: 'Buat Grup',
    },
    profile: {
      title: 'Profil',
      information: 'Informasi',
      displayName: 'Nama Tampilan',
      userId: 'ID Pengguna',
      editAvatar: 'Ganti foto',
      logoutSuccess: 'Berhasil keluar',
    },
    roomInfo: {
      title: 'Info Ruang',
      participants: 'Peserta',
      addParticipants: 'Tambah Peserta',
      removeParticipant: 'Hapus',
    },
  },
} as const;

export default id;
