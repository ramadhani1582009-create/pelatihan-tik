// Data Dummy Awal jika LocalStorage Masih Kosong
const initialSiswa = [
    { nis: "1001", nama: "Ahmad Rizky", kelas: "10 IPA 1" },
    { nis: "1002", nama: "Siti Nurhaliza", kelas: "10 IPA 1" },
    { nis: "1003", nama: "Budi Pratama", kelas: "10 IPA 2" },
    { nis: "1004", nama: "Dewi Lestari", kelas: "10 IPS 1" }
];

// Inisialisasi Storage Data
let dataSiswa = JSON.parse(localStorage.getItem('absensi_siswa')) || initialSiswa;
let dataAbsensi = JSON.parse(localStorage.getItem('absensi_records')) || [];

// Render Awal Aplikasi
document.addEventListener("DOMContentLoaded", () => {
    updateDateDisplay();
    renderSiswaTable();
    renderAbsensiForm();
    renderDashboard();
    renderRekapTable();
    lucide.createIcons();
});

// Format Tanggal Hari Ini
function getTodayString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

function updateDateDisplay() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('id-ID', options);
}

// Navigasi Tab
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));

    document.getElementById(`tab-${tabName}`).classList.add('active');
    event.currentTarget.classList.add('active');

    // Dynamic Title
    const titles = {
        'dashboard': 'Dashboard Absensi',
        'absensi': 'Presensi Kehadiran Siswa',
        'rekap': 'Rekap & Riwayat Presensi',
        'siswa': 'Kelola Data Siswa'
    };
    document.getElementById('page-title').innerText = titles[tabName];

    // Refresh Data saat Switch Tab
    if (tabName === 'dashboard') renderDashboard();
    if (tabName === 'rekap') renderRekapTable();
    if (tabName === 'absensi') renderAbsensiForm();
}

// --- TAB SISWA ---
function renderSiswaTable() {
    const tbody = document.getElementById('siswa-table-body');
    tbody.innerHTML = '';

    dataSiswa.forEach(siswa => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${siswa.nis}</td>
            <td>${siswa.nama}</td>
            <td>${siswa.kelas}</td>
            <td>
                <button class="btn-danger-sm" onclick="hapusSiswa('${siswa.nis}')">Hapus</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    localStorage.setItem('absensi_siswa', JSON.stringify(dataSiswa));
}

function tambahSiswa(e) {
    e.preventDefault();
    const nis = document.getElementById('nis').value.trim();
    const nama = document.getElementById('nama').value.trim();
    const kelas = document.getElementById('kelas').value;

    if (dataSiswa.some(s => s.nis === nis)) {
        alert("NIS sudah terdaftar!");
        return;
    }

    dataSiswa.push({ nis, nama, kelas });
    renderSiswaTable();
    document.getElementById('form-tambah-siswa').reset();
    alert('Siswa berhasil ditambahkan!');
}

function hapusSiswa(nis) {
    if (confirm("Yakin ingin menghapus siswa ini?")) {
        dataSiswa = dataSiswa.filter(s => s.nis !== nis);
        renderSiswaTable();
    }
}

// --- TAB INPUT ABSENSI ---
function renderAbsensiForm() {
    const filterKelas = document.getElementById('filter-kelas-absen').value;
    const tbody = document.getElementById('absensi-input-table');
    tbody.innerHTML = '';

    const filteredSiswa = filterKelas === 'Semua' 
        ? dataSiswa 
        : dataSiswa.filter(s => s.kelas === filterKelas);

    const today = getTodayString();

    filteredSiswa.forEach(siswa => {
        // Cek apakah sudah absen hari ini
        const existingRecord = dataAbsensi.find(a => a.nis === siswa.nis && a.tanggal === today);
        const currentStatus = existingRecord ? existingRecord.status : 'Hadir';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${siswa.nis}</td>
            <td>${siswa.nama}</td>
            <td>${siswa.kelas}</td>
            <td>
                <div class="status-options">
                    <label><input type="radio" name="status-${siswa.nis}" value="Hadir" ${currentStatus === 'Hadir' ? 'checked' : ''}> Hadir</label>
                    <label><input type="radio" name="status-${siswa.nis}" value="Izin" ${currentStatus === 'Izin' ? 'checked' : ''}> Izin</label>
                    <label><input type="radio" name="status-${siswa.nis}" value="Sakit" ${currentStatus === 'Sakit' ? 'checked' : ''}> Sakit</label>
                    <label><input type="radio" name="status-${siswa.nis}" value="Alpa" ${currentStatus === 'Alpa' ? 'checked' : ''}> Alpa</label>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function simpanAbsensi(e) {
    e.preventDefault();
    const today = getTodayString();
    const filterKelas = document.getElementById('filter-kelas-absen').value;

    const filteredSiswa = filterKelas === 'Semua' 
        ? dataSiswa 
        : dataSiswa.filter(s => s.kelas === filterKelas);

    filteredSiswa.forEach(siswa => {
        const status = document.querySelector(`input[name="status-${siswa.nis}"]:checked`).value;
        
        // Hapus record lama hari ini jika ada (overwritten)
        dataAbsensi = dataAbsensi.filter(a => !(a.nis === siswa.nis && a.tanggal === today));

        // Tambah record baru
        dataAbsensi.push({
            tanggal: today,
            nis: siswa.nis,
            nama: siswa.nama,
            kelas: siswa.kelas,
            status: status,
            waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        });
    });

    localStorage.setItem('absensi_records', JSON.stringify(dataAbsensi));
    alert('Data absensi berhasil disimpan!');
    renderDashboard();
}

// --- TAB DASHBOARD ---
function renderDashboard() {
    const today = getTodayString();
    const todayRecords = dataAbsensi.filter(a => a.tanggal === today);

    // Hitung Stats
    document.getElementById('stat-total').innerText = dataSiswa.length;
    document.getElementById('stat-hadir').innerText = todayRecords.filter(a => a.status === 'Hadir').length;
    document.getElementById('stat-izin').innerText = todayRecords.filter(a => a.status === 'Izin' || a.status === 'Sakit').length;
    document.getElementById('stat-alpa').innerText = todayRecords.filter(a => a.status === 'Alpa').length;

    // Tabel Activity
    const tbody = document.getElementById('dashboard-recent-table');
    tbody.innerHTML = '';

    if (todayRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#94a3b8;">Belum ada data presensi untuk hari ini.</td></tr>';
        return;
    }

    todayRecords.forEach(rec => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${rec.nis}</td>
            <td>${rec.nama}</td>
            <td>${rec.kelas}</td>
            <td><span class="badge badge-${rec.status.toLowerCase()}">${rec.status}</span></td>
            <td>${rec.waktu || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// --- TAB REKAP & EXPORT ---
function renderRekapTable() {
    const dateInput = document.getElementById('rekap-date-filter').value;
    const tbody = document.getElementById('rekap-table-body');
    tbody.innerHTML = '';

    let records = dataAbsensi;
    if (dateInput) {
        records = dataAbsensi.filter(a => a.tanggal === dateInput);
    }

    if (records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#94a3b8;">Tidak ada data riwayat absensi.</td></tr>';
        return;
    }

    records.forEach(rec => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${rec.tanggal}</td>
            <td>${rec.nis}</td>
            <td>${rec.nama}</td>
            <td>${rec.kelas}</td>
            <td><span class="badge badge-${rec.status.toLowerCase()}">${rec.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function exportKeCSV() {
    if (dataAbsensi.length === 0) {
        alert("Tidak ada data untuk diekspor!");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,Tanggal,NIS,Nama,Kelas,Status\n";

    dataAbsensi.forEach(rec => {
        csvContent += `${rec.tanggal},${rec.nis},${rec.nama},${rec.kelas},${rec.status}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rekap_absensi_${getTodayString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
