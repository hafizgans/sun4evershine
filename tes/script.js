document.addEventListener('DOMContentLoaded', () => {
    const puzzleContainer = document.getElementById('puzzle-container');
    const messageDisplay = document.getElementById('message');
    const resetButton = document.getElementById('reset-button');

    const IMAGE_PATH = 'gambar-saya.jpg'; // Ganti dengan path/nama file gambar Anda
    const GRID_SIZE = 3; // Ukuran grid (misalnya, 3 untuk 3x3)
    const TILE_SIZE = 100; // Ukuran setiap potongan puzzle dalam piksel

    let puzzle = [];
    // Dalam mode ini, semua tile akan berisi gambar, jadi tidak ada EMPTY_TILE_NUMBER

    let draggedTileIndex; // Menyimpan indeks DOM dari kepingan yang sedang di-drag

    // Fungsi untuk menginisialisasi puzzle
    function initializePuzzle() {
        // Mengisi array puzzle dengan urutan angka yang benar (0, 1, 2, ..., 8)
        // Sekarang ada GRID_SIZE * GRID_SIZE potongan, semuanya dengan gambar.
        puzzle = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i);
        renderPuzzle(); // Gambar puzzle dalam keadaan tersusun
        shufflePuzzle(); // Lalu acak
        messageDisplay.textContent = ''; // Kosongkan pesan kemenangan
    }

    // Fungsi untuk merender (menggambar ulang) puzzle di DOM
    function renderPuzzle() {
        puzzleContainer.innerHTML = ''; // Hapus semua potongan yang ada
        puzzleContainer.style.gridTemplateColumns = `repeat(${GRID_SIZE}, ${TILE_SIZE}px)`;
        puzzleContainer.style.width = `${GRID_SIZE * TILE_SIZE}px`; // Mengatur lebar total container
        puzzleContainer.style.height = `${GRID_SIZE * TILE_SIZE}px`; // Mengatur tinggi total container

        puzzle.forEach((tileNumber, index) => {
            const tile = document.createElement('div');
            tile.classList.add('puzzle-piece');
            tile.dataset.index = index; // Menyimpan indeks posisi saat ini di DOM (0-8)
            tile.dataset.tileNumber = tileNumber; // Menyimpan nomor asli dari potongan gambar (0-8)

            // Semua tile sekarang memiliki gambar
            const originalRow = Math.floor(tileNumber / GRID_SIZE);
            const originalCol = tileNumber % GRID_SIZE;
            
            tile.style.backgroundImage = `url(${IMAGE_PATH})`;
            tile.style.backgroundPosition = `-${originalCol * TILE_SIZE}px -${originalRow * TILE_SIZE}px`;
            tile.style.width = `${TILE_SIZE}px`;
            tile.style.height = `${TILE_SIZE}px`;
            tile.style.backgroundSize = `${GRID_SIZE * TILE_SIZE}px ${GRID_SIZE * TILE_SIZE}px`; 
            
            // --- Tambahkan atribut draggable dan event listener Drag and Drop ---
            tile.setAttribute('draggable', 'true'); // Membuat kepingan bisa di-drag
            tile.addEventListener('dragstart', handleDragStart);
            tile.addEventListener('dragover', handleDragOver);
            tile.addEventListener('dragleave', handleDragLeave);
            tile.addEventListener('drop', handleDrop);
            tile.addEventListener('dragend', handleDragEnd); // Untuk membersihkan setelah drag selesai
            
            puzzleContainer.appendChild(tile); // Tambahkan potongan ke container
        });
    }

    // Fungsi untuk mengacak puzzle (disesuaikan karena tidak ada ruang kosong)
    function shufflePuzzle() {
        // Fisher-Yates (Knuth) shuffle algorithm
        for (let i = puzzle.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [puzzle[i], puzzle[j]] = [puzzle[j], puzzle[i]];
        }
        renderPuzzle(); // Render ulang puzzle setelah diacak
    }

    // --- Handler Event Drag and Drop ---

    function handleDragStart(event) {
        draggedTileIndex = parseInt(event.target.dataset.index); // Simpan indeks kepingan yang di-drag
        event.target.classList.add('dragging'); // Tambahkan kelas untuk efek visual
        event.dataTransfer.setData('text/plain', draggedTileIndex); // Set data yang akan ditransfer
    }

    function handleDragOver(event) {
        event.preventDefault(); // Mencegah perilaku default untuk mengizinkan drop
        // Tambahkan kelas visual jika target drop valid (bukan kepingan yang sama)
        if (event.target.classList.contains('puzzle-piece') && parseInt(event.target.dataset.index) !== draggedTileIndex) {
            event.target.classList.add('over');
        }
    }

    function handleDragLeave(event) {
        event.target.classList.remove('over'); // Hapus kelas visual saat kursor meninggalkan target
    }

    function handleDrop(event) {
        event.preventDefault(); // Mencegah perilaku default drop (mis. membuka URL)
        event.target.classList.remove('over'); // Hapus kelas visual

        const droppedOnTileIndex = parseInt(event.target.dataset.index); // Indeks DOM dari kepingan target drop

        // Pastikan kita tidak drop di atas kepingan yang sama
        if (draggedTileIndex !== droppedOnTileIndex) {
            swapTiles(draggedTileIndex, droppedOnTileIndex); // Tukar posisi di array puzzle
            renderPuzzle(); // Render ulang tampilan
           if (checkWin()) {
                messageDisplay.textContent = 'Cie, bububb menang!';
                // Tambahkan pengalihan halaman setelah 2 detik (opsional, untuk melihat pesan kemenangan dulu)
                setTimeout(() => {
                    // Gunakan path relatif jika folder 'vidio' berada di tingkat yang sama dengan game puzzle
                    // Atau path absolut jika diperlukan (sesuaikan dengan lokasi di server atau lokal)
                    window.location.href = './vidio/index.html'; // Mengarahkan ke index.html di dalam folder 'vidio'
                    // Atau jika pathnya harus spesifik ke lokal:
                    // window.location.href = 'file:///C:/Users/Hafiz/Documents/Envelope-Letter-Animation-main/tes/vidio/index.html';
                }, 2000); // Tunggu 2 detik sebelum mengarahkan
            }
        }
    }

    function handleDragEnd(event) {
        // Bersihkan kelas 'dragging' dari kepingan yang diseret
        event.target.classList.remove('dragging');
        // Pastikan juga menghapus 'over' dari semua kepingan yang mungkin masih memilikinya
        const allPieces = puzzleContainer.querySelectorAll('.puzzle-piece');
        allPieces.forEach(piece => piece.classList.remove('over'));
    }

    // Fungsi helper untuk menukar posisi dua elemen di dalam array 'puzzle'
    function swapTiles(index1, index2) {
        // swap nilai asli dari kepingan di dalam array puzzle
        [puzzle[index1], puzzle[index2]] = [puzzle[index2], puzzle[index1]];
    }

    // Fungsi untuk memeriksa apakah puzzle sudah tersusun dengan benar
    function checkWin() {
        for (let i = 0; i < puzzle.length; i++) { // Loop hingga puzzle.length karena semua terisi
            if (puzzle[i] !== i) {
                return false;
            }
        }
        return true;
    }

    resetButton.addEventListener('click', initializePuzzle);

    initializePuzzle();
});