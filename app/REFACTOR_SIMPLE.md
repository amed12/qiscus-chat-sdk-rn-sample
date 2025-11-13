# Refactoring Simple - Multichannel Widget Integration

## 🎯 Tujuan Sederhana

**Yang Harus Berubah**: Hanya cara login/initiate chat  
**Yang Tetap Sama**: Semua fungsi chat SDK yang sudah ada

---

## 📝 Penjelasan Singkat

**Multichannel Widget** = Integrasi widget ke dashboard omnichannel Qiscus

**Perbedaan dengan Chat SDK biasa**:
1. ❌ **TIDAK** pakai `qiscus.setUser(userId, userKey)`
1. ✅ **PAKAI** API `initiate_chat` untuk dapat room + identity_token
3. ✅ Login dengan `qiscus.setUserWithIdentityToken()`
4. ✅ Sisanya tetap pakai Chat SDK seperti biasa

**Session Logic**:
- Jika `appId` **sessional** + room **resolved** → create new room
- Jika **bukan sessional** → tetap di room yang sama

---

## 🔧 Yang Perlu Diubah

### **HANYA 2 HAL**:
1. Buat file baru: `app/qiscus/multichannelApi.js`
2. Update 1 fungsi: `LoginScreen.onSubmit()`

**Flow Baru**: