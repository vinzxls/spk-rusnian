<?php
/**
 * API penyimpanan data SPK Rusnian (tanpa database, berbasis file JSON).
 *
 * Kenapa file JSON, bukan MySQL: hosting klien adalah shared hosting yang
 * mendukung PHP. File JSON + flock sudah cukup untuk data penelitian dengan
 * puluhan/ratusan responden, dan tidak perlu konfigurasi database.
 *
 * Prinsip penting:
 *  - Semua penulisan memakai flock eksklusif + atomic rename, sehingga dua
 *    mahasiswa yang mengirim kuesioner bersamaan tidak saling menimpa.
 *  - Kuesioner disimpan per-record (upsert), bukan replace seluruh array.
 *    Ini yang mencegah jawaban hilang saat submit bersamaan.
 *  - Folder data dilindungi .htaccess agar state.json tidak bisa diunduh.
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

$DATA_DIR = __DIR__ . '/data';
$STATE_FILE = $DATA_DIR . '/state.json';
$LOCK_FILE = $DATA_DIR . '/.lock';

const COLLECTIONS = ['users', 'mahasiswa', 'kuesioner', 'ahp', 'kriteria', 'subkriteria'];

function fail(int $status, string $message): void
{
    http_response_code($status);
    echo json_encode(['ok' => false, 'error' => $message]);
    exit;
}

function ensure_data_dir(string $dir): void
{
    if (!is_dir($dir) && !@mkdir($dir, 0755, true) && !is_dir($dir)) {
        fail(500, 'Folder data tidak dapat dibuat');
    }

    // Cegah state.json diakses langsung lewat URL.
    $htaccess = $dir . '/.htaccess';
    if (!file_exists($htaccess)) {
        @file_put_contents($htaccess, "Require all denied\nDeny from all\n");
    }
}

function default_state(): array
{
    $state = [];
    foreach (COLLECTIONS as $name) {
        $state[$name] = null;
    }
    return $state;
}

function read_state(string $file): array
{
    if (!file_exists($file)) {
        return default_state();
    }

    $raw = @file_get_contents($file);
    if ($raw === false || trim($raw) === '') {
        return default_state();
    }

    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        return default_state();
    }

    return array_merge(default_state(), $decoded);
}

/** Tulis atomic: tulis ke file sementara lalu rename. */
function write_state(string $file, array $state): void
{
    $json = json_encode($state, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        fail(500, 'Gagal mengubah data menjadi JSON');
    }

    $tmp = $file . '.tmp.' . bin2hex(random_bytes(4));
    if (@file_put_contents($tmp, $json) === false) {
        fail(500, 'Gagal menulis file data');
    }
    if (!@rename($tmp, $file)) {
        @unlink($tmp);
        fail(500, 'Gagal menyimpan file data');
    }
}

/** Jalankan $fn sambil memegang lock eksklusif. */
function with_lock(string $lockFile, callable $fn)
{
    $fp = @fopen($lockFile, 'c');
    if ($fp === false) {
        fail(500, 'Lock data tidak dapat dibuka');
    }
    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        fail(500, 'Lock data gagal diambil');
    }
    try {
        return $fn();
    } finally {
        flock($fp, LOCK_UN);
        fclose($fp);
    }
}

function body_json(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        fail(400, 'Body JSON tidak valid');
    }
    return $decoded;
}

function is_state_empty(array $state): bool
{
    foreach (COLLECTIONS as $name) {
        $value = $state[$name] ?? null;
        if (is_array($value) && count($value) > 0) {
            return false;
        }
        if (!is_array($value) && $value !== null) {
            return false;
        }
    }
    return true;
}

ensure_data_dir($DATA_DIR);

$action = isset($_GET['action']) ? (string) $_GET['action'] : '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    if ($action === 'state' || $action === '') {
        $state = read_state($STATE_FILE);
        echo json_encode([
            'ok' => true,
            // `empty` dipakai klien untuk memutuskan: tarik data atau kirim data
            // lokal ke server saat pertama kali dipasang.
            'empty' => is_state_empty($state),
            'state' => $state,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
    fail(400, 'Action tidak dikenal');
}

if ($method === 'POST') {
    if ($action === 'push') {
        $input = body_json();
        $collection = isset($input['collection']) ? (string) $input['collection'] : '';
        if (!in_array($collection, COLLECTIONS, true)) {
            fail(400, 'Collection tidak valid');
        }
        if (!array_key_exists('data', $input)) {
            fail(400, 'Field data wajib ada');
        }

        with_lock($LOCK_FILE, function () use ($STATE_FILE, $collection, $input) {
            $state = read_state($STATE_FILE);
            $state[$collection] = $input['data'];
            write_state($STATE_FILE, $state);
        });

        echo json_encode(['ok' => true]);
        exit;
    }

    if ($action === 'submit-kuesioner') {
        $input = body_json();
        $record = isset($input['record']) && is_array($input['record']) ? $input['record'] : null;
        if ($record === null) {
            fail(400, 'Record kuesioner wajib ada');
        }
        $mahasiswaId = isset($record['mahasiswa_id']) ? (string) $record['mahasiswa_id'] : '';
        if ($mahasiswaId === '') {
            fail(400, 'mahasiswa_id wajib ada');
        }

        $total = 0;
        with_lock($LOCK_FILE, function () use ($STATE_FILE, $record, $mahasiswaId, &$total) {
            $state = read_state($STATE_FILE);
            $daftar = is_array($state['kuesioner']) ? $state['kuesioner'] : [];

            $found = false;
            foreach ($daftar as $i => $item) {
                if (isset($item['mahasiswa_id']) && $item['mahasiswa_id'] === $mahasiswaId) {
                    $daftar[$i] = $record;
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $daftar[] = $record;
            }

            $state['kuesioner'] = $daftar;
            $total = count($daftar);
            write_state($STATE_FILE, $state);
        });

        echo json_encode(['ok' => true, 'total' => $total]);
        exit;
    }

    fail(400, 'Action tidak dikenal');
}

fail(405, 'Method tidak didukung');
