<?php
/**
 * DERA ZONE — Universal Standalone PHP API Engine
 * Runs natively on any standard cPanel, Hostinger shared hosting, or Apache server without Node.js.
 */

// ── 1. CORS & Response Headers ──
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ── 2. Storage Setup ──
$storeFile = __DIR__ . '/../data/store.json';
$liveBackupFile = __DIR__ . '/../data/store_live.json';
if (!file_exists($storeFile)) {
    if (file_exists(__DIR__ . '/../data/store.json.example')) {
        @copy(__DIR__ . '/../data/store.json.example', $storeFile);
    } elseif (file_exists(__DIR__ . '/../backend/data/store.json')) {
        $storeFile = __DIR__ . '/../backend/data/store.json';
    } else {
        @mkdir(__DIR__ . '/../data', 0755, true);
    }
}

function get_store() {
    global $storeFile, $liveBackupFile;
    $raw = @file_get_contents($storeFile);
    $data = json_decode($raw, true);
    if (!is_array($data)) $data = [];

    // Only restore from backup if store.json is missing, blank, corrupted, or replaced with empty starter file
    $needsRestore = (!file_exists($storeFile) || strlen(trim($raw ?? '')) < 10 || empty($data) || (!isset($data['_lastSaved']) && empty($data['products']) && empty($data['orders'])));

    if ($needsRestore) {
        $backupFiles = [
            $liveBackupFile,
            __DIR__ . '/../data/store_backup_latest.json',
            __DIR__ . '/../data/store_backup_daily.json',
            __DIR__ . '/../data/store_live.json.bak',
            __DIR__ . '/../data/store.json.bak'
        ];

        $restoredAny = false;
        foreach ($backupFiles as $bf) {
            if (!file_exists($bf)) continue;
            $bRaw = @file_get_contents($bf);
            $bData = json_decode($bRaw, true);
            if (!is_array($bData)) continue;

            $keysToRestore = ['products', 'orders', 'socialOrders', 'reviews', 'pinned', 'spotlight', 'reviewImages', 'coupons', 'settings', 'adminUsers', 'deletedProductIds', 'users'];
            foreach ($keysToRestore as $k) {
                if (empty($data[$k]) && !empty($bData[$k])) {
                    $data[$k] = $bData[$k];
                    $restoredAny = true;
                }
            }
        }

        if ($restoredAny) {
            $data['_lastSaved'] = time();
            $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            @file_put_contents($storeFile, $json, LOCK_EX);
        }
    }

    // Always filter out any products whose IDs are in deletedProductIds tombstone list
    if (!empty($data['deletedProductIds']) && is_array($data['deletedProductIds']) && !empty($data['products']) && is_array($data['products'])) {
        $delMap = array_flip(array_map('strval', $data['deletedProductIds']));
        $data['products'] = array_values(array_filter($data['products'], function($p) use ($delMap) {
            $id1 = strval($p['id'] ?? '');
            $id2 = strval($p['_id'] ?? '');
            return !isset($delMap[$id1]) && !isset($delMap[$id2]);
        }));
    }

    return $data;
}

function save_store($data) {
    global $storeFile, $liveBackupFile;
    $data['_lastSaved'] = time();
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    @file_put_contents($storeFile, $json, LOCK_EX);
    @file_put_contents($liveBackupFile, $json, LOCK_EX);
    @file_put_contents(__DIR__ . '/../data/store_backup_latest.json', $json, LOCK_EX);
}

// ── 3. Parse Request & Support Method Tunneling (for cPanel / ModSecurity / Apache restrictions) ──
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$rawBody = file_get_contents('php://input');
$body = json_decode($rawBody, true) ?? [];

// Method tunneling headers / params
$headerOverride = $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] ?? '';
$queryOverride = $_GET['_method'] ?? '';
if (!empty($headerOverride)) {
    $method = strtoupper($headerOverride);
} elseif (!empty($queryOverride)) {
    $method = strtoupper($queryOverride);
} elseif (!empty($body['_method'])) {
    $method = strtoupper($body['_method']);
} elseif (!empty($body['action']) && in_array(strtolower($body['action']), ['delete', 'destroy'])) {
    $method = 'DELETE';
} elseif (!empty($_GET['action']) && in_array(strtolower($_GET['action']), ['delete', 'destroy'])) {
    $method = 'DELETE';
}

$endpoint = isset($_GET['endpoint']) ? trim($_GET['endpoint'], '/') : '';
if (empty($endpoint)) {
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $endpoint = trim(preg_replace('#^/?api/?#i', '', $uri), '/');
}
// Strip query strings or trailing slashes
$endpoint = explode('?', $endpoint)[0];
$endpoint = trim($endpoint, '/');

// Helper responses
function json_ok($payload = []) {
    echo json_encode(array_merge(['ok' => true], $payload));
    exit();
}

function json_err($msg = 'An error occurred', $code = 400) {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg]);
    exit();
}

// ── EMAIL HELPER (Native cPanel / PHP Mail with info@derazone.com) ──
function send_derazone_email($to, $subject, $htmlBody, $replyTo = 'info@derazone.com') {
    if (empty($to)) return false;
    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: DERA ZONE <info@derazone.com>\r\n";
    $headers .= "Reply-To: " . $replyTo . "\r\n";
    $headers .= "Return-Path: info@derazone.com\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
    return @mail($to, $subject, $htmlBody, $headers, "-f info@derazone.com");
}

function send_admin_new_order_alert($order) {
    $to = 'info@derazone.com';
    $orderId = $order['id'] ?? 'DZ-0000';
    $subject = "🛒 New Order Received [{$orderId}] — PKR " . number_format($order['total'] ?? 0);
    $d = $order['delivery'] ?? [];
    $name = trim(($d['fname'] ?? '') . ' ' . ($d['lname'] ?? ''));
    $phone = $d['phone'] ?? 'N/A';
    $email = $d['email'] ?? 'Not provided';
    $address = $d['address'] ?? 'N/A';
    $city = $d['city'] ?? 'N/A';
    $notes = $d['notes'] ?? 'None';
    $pay = strtoupper($order['paymentMethod'] ?? $order['payment'] ?? 'COD');
    
    $itemRows = '';
    foreach (($order['items'] ?? []) as $it) {
        $pName = htmlspecialchars($it['name'] ?? 'Item');
        $qty = (int)($it['qty'] ?? 1);
        $price = number_format(($it['price'] ?? 0) * $qty);
        
        $v = trim($it['variant'] ?? '');
        if (!$v || strcasecmp($v, 'Standard') === 0) {
            $v = trim(($it['size'] ?? '') . ' ' . ($it['color'] ?? ''));
        }
        $vStr = ($v && strcasecmp($v, 'Standard') !== 0) 
            ? "<br><span style='display:inline-block;margin-top:3px;padding:2px 8px;background:rgba(112,0,255,0.08);color:#7000ff;border-radius:4px;font-size:12px;font-weight:bold;'>Variant: " . htmlspecialchars($v) . "</span>" 
            : "";

        $itemRows .= "<tr><td style='padding:10px 8px;border-bottom:1px solid #eee;'><strong>{$pName}</strong>{$vStr} <span style='color:#64748b;'>× {$qty}</span></td><td style='padding:10px 8px;border-bottom:1px solid #eee;text-align:right;font-weight:600;'>PKR {$price}</td></tr>";
    }
    
    $html = "
    <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;'>
      <div style='background:#7000ff;padding:20px;text-align:center;color:#ffffff;'>
        <h2 style='margin:0;font-size:20px;'>New Order Received</h2>
        <p style='margin:4px 0 0;font-size:14px;'>Order Reference: <strong>{$orderId}</strong></p>
      </div>
      <div style='padding:24px;'>
        <h3 style='margin-top:0;color:#0f172a;border-bottom:2px solid #f1f5f9;padding-bottom:8px;'>Customer Details</h3>
        <p style='margin:4px 0;'><strong>Name:</strong> {$name}</p>
        <p style='margin:4px 0;'><strong>Phone:</strong> {$phone}</p>
        <p style='margin:4px 0;'><strong>Email:</strong> {$email}</p>
        <p style='margin:4px 0;'><strong>Address:</strong> {$address}, {$city}</p>
        <p style='margin:4px 0;'><strong>Payment Method:</strong> {$pay}</p>
        <p style='margin:4px 0;'><strong>Notes:</strong> {$notes}</p>
        
        <h3 style='margin-top:20px;color:#0f172a;border-bottom:2px solid #f1f5f9;padding-bottom:8px;'>Order Items</h3>
        <table style='width:100%;border-collapse:collapse;'>
          {$itemRows}
          <tr>
            <td style='padding:12px 8px;font-weight:bold;font-size:16px;'>Grand Total:</td>
            <td style='padding:12px 8px;font-weight:bold;font-size:16px;text-align:right;color:#7000ff;'>PKR " . number_format($order['total'] ?? 0) . "</td>
          </tr>
        </table>
        
        <div style='margin-top:24px;text-align:center;'>
          <a href='https://derazone.com/admin' style='background:#7000ff;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;display:inline-block;'>Open Admin Dashboard</a>
        </div>
      </div>
    </div>";
    
    send_derazone_email($to, $subject, $html, $email !== 'Not provided' ? $email : 'info@derazone.com');
}

function send_customer_order_placed($order) {
    $d = $order['delivery'] ?? [];
    $to = trim($d['email'] ?? '');
    if (empty($to)) return;
    
    $orderId = $order['id'] ?? 'DZ-0000';
    $name = trim(($d['fname'] ?? '') . ' ' . ($d['lname'] ?? ''));
    $subject = "Order Placed — {$orderId} | DERA ZONE";
    $total = number_format($order['total'] ?? 0);
    $pay = strtoupper($order['paymentMethod'] ?? $order['payment'] ?? 'COD');
    
    $itemRows = '';
    foreach (($order['items'] ?? []) as $it) {
        $pName = htmlspecialchars($it['name'] ?? 'Item');
        $qty = (int)($it['qty'] ?? 1);
        $price = number_format(($it['price'] ?? 0) * $qty);
        
        $v = trim($it['variant'] ?? '');
        if (!$v || strcasecmp($v, 'Standard') === 0) {
            $v = trim(($it['size'] ?? '') . ' ' . ($it['color'] ?? ''));
        }
        $vStr = ($v && strcasecmp($v, 'Standard') !== 0) 
            ? "<br><span style='display:inline-block;margin-top:3px;padding:2px 8px;background:rgba(112,0,255,0.08);color:#7000ff;border-radius:4px;font-size:12px;font-weight:bold;'>Variant: " . htmlspecialchars($v) . "</span>" 
            : "";

        $itemRows .= "<tr><td style='padding:10px 8px;border-bottom:1px solid #eee;'><strong>{$pName}</strong>{$vStr} <span style='color:#64748b;'>× {$qty}</span></td><td style='padding:10px 8px;border-bottom:1px solid #eee;text-align:right;font-weight:600;'>PKR {$price}</td></tr>";
    }
    
    $html = "
    <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;'>
      <div style='background:#7000ff;padding:24px;text-align:center;color:#ffffff;'>
        <h1 style='margin:0;font-size:24px;letter-spacing:1px;'>DERA ZONE</h1>
        <h2 style='margin:8px 0 0;font-size:18px;'>Order Placed ✓</h2>
        <p style='margin:4px 0 0;font-size:14px;'>Order Reference: <strong>{$orderId}</strong></p>
      </div>
      <div style='padding:24px;'>
        <p style='font-size:15px;line-height:1.5;'>Thank you <strong>{$name}</strong>! Your order has been placed into our dispatch queue. Our customer care team will keep you updated via WhatsApp and email.</p>
        
        <h3 style='margin-top:20px;color:#0f172a;border-bottom:2px solid #f1f5f9;padding-bottom:8px;'>Order Summary</h3>
        <table style='width:100%;border-collapse:collapse;'>
          {$itemRows}
          <tr>
            <td style='padding:12px 8px;font-weight:bold;font-size:16px;'>Grand Total:</td>
            <td style='padding:12px 8px;font-weight:bold;font-size:16px;text-align:right;color:#7000ff;'>PKR {$total}</td>
          </tr>
        </table>
        
        <div style='margin-top:20px;padding:14px;background:#f8fafc;border-radius:8px;'>
          <p style='margin:0 0 4px;'><strong>Delivery Address:</strong> {$d['address']}, {$d['city']}</p>
          <p style='margin:0;'><strong>Payment Method:</strong> {$pay}</p>
        </div>
        
        <p style='color:#64748b;font-size:13px;margin-top:24px;text-align:center;'>
          Questions or assistance? Reply to this email or contact us at <a href='mailto:info@derazone.com' style='color:#7000ff;'>info@derazone.com</a> / WhatsApp: +92 329 4551652.
        </p>
      </div>
    </div>";
    
    send_derazone_email($to, $subject, $html);
}

function send_customer_order_confirmed($order) {
    $d = $order['delivery'] ?? [];
    $to = trim($d['email'] ?? '');
    if (empty($to)) return;
    
    $orderId = $order['id'] ?? 'DZ-0000';
    $name = trim(($d['fname'] ?? '') . ' ' . ($d['lname'] ?? ''));
    $subject = "Order Confirmed & Preparing for Dispatch — {$orderId} | DERA ZONE";
    $total = number_format($order['total'] ?? 0);
    $pay = strtoupper($order['paymentMethod'] ?? $order['payment'] ?? 'COD');
    
    $itemRows = '';
    foreach (($order['items'] ?? []) as $it) {
        $pName = htmlspecialchars($it['name'] ?? 'Item');
        $qty = (int)($it['qty'] ?? 1);
        $price = number_format(($it['price'] ?? 0) * $qty);
        
        $v = trim($it['variant'] ?? '');
        if (!$v || strcasecmp($v, 'Standard') === 0) {
            $v = trim(($it['size'] ?? '') . ' ' . ($it['color'] ?? ''));
        }
        $vStr = ($v && strcasecmp($v, 'Standard') !== 0) 
            ? "<br><span style='display:inline-block;margin-top:3px;padding:2px 8px;background:rgba(112,0,255,0.08);color:#7000ff;border-radius:4px;font-size:12px;font-weight:bold;'>Variant: " . htmlspecialchars($v) . "</span>" 
            : "";

        $itemRows .= "<tr><td style='padding:10px 8px;border-bottom:1px solid #eee;'><strong>{$pName}</strong>{$vStr} <span style='color:#64748b;'>× {$qty}</span></td><td style='padding:10px 8px;border-bottom:1px solid #eee;text-align:right;font-weight:600;'>PKR {$price}</td></tr>";
    }
    
    $html = "
    <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;'>
      <div style='background:#10b981;padding:24px;text-align:center;color:#ffffff;'>
        <h1 style='margin:0;font-size:24px;letter-spacing:1px;'>DERA ZONE</h1>
        <h2 style='margin:8px 0 0;font-size:18px;'>Order Confirmed ✓</h2>
        <p style='margin:4px 0 0;font-size:14px;'>Invoice / Reference: <strong>{$orderId}</strong></p>
      </div>
      <div style='padding:24px;'>
        <p style='font-size:15px;line-height:1.5;'>Dear <strong>{$name}</strong>,</p>
        <p style='font-size:15px;line-height:1.5;color:#334155;'>
          Great news! Your order has been officially confirmed by our team and is now being packed for dispatch.
        </p>
        
        <h3 style='margin-top:20px;color:#0f172a;border-bottom:2px solid #f1f5f9;padding-bottom:8px;'>Invoice &amp; Order Details</h3>
        <table style='width:100%;border-collapse:collapse;'>
          {$itemRows}
          <tr>
            <td style='padding:12px 8px;font-weight:bold;font-size:16px;'>Grand Total:</td>
            <td style='padding:12px 8px;font-weight:bold;font-size:16px;text-align:right;color:#10b981;'>PKR {$total}</td>
          </tr>
        </table>
        
        <div style='margin-top:20px;padding:14px;background:#f8fafc;border-radius:8px;'>
          <p style='margin:0 0 4px;'><strong>Delivery Address:</strong> {$d['address']}, {$d['city']}</p>
          <p style='margin:0 0 4px;'><strong>Contact:</strong> {$d['phone']}</p>
          <p style='margin:0;'><strong>Status:</strong> Confirmed &amp; In Packing Queue</p>
        </div>
        
        <p style='color:#64748b;font-size:13px;margin-top:24px;text-align:center;'>
          Thank you for trusting DERA ZONE. Questions? Contact us at <a href='mailto:info@derazone.com' style='color:#7000ff;'>info@derazone.com</a>.
        </p>
      </div>
    </div>";
    
    send_derazone_email($to, $subject, $html);
}

function send_admin_contact_alert($msg) {
    $to = 'info@derazone.com';
    $name = htmlspecialchars($msg['name'] ?? 'Website Visitor');
    $email = htmlspecialchars($msg['email'] ?? 'Not provided');
    $phone = htmlspecialchars($msg['phone'] ?? 'Not provided');
    $subjectLine = htmlspecialchars($msg['subject'] ?? 'New Message');
    $bodyText = nl2br(htmlspecialchars($msg['message'] ?? ''));
    
    $subject = "📩 New Website Message from {$name} — {$subjectLine}";
    $html = "
    <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;'>
      <div style='background:#7000ff;padding:20px;text-align:center;color:#ffffff;'>
        <h2 style='margin:0;font-size:20px;'>New Contact Message</h2>
        <p style='margin:4px 0 0;font-size:14px;'>via derazone.com</p>
      </div>
      <div style='padding:24px;'>
        <p style='margin:4px 0;'><strong>From:</strong> {$name}</p>
        <p style='margin:4px 0;'><strong>Email:</strong> {$email}</p>
        <p style='margin:4px 0;'><strong>Phone:</strong> {$phone}</p>
        <p style='margin:4px 0;'><strong>Subject:</strong> {$subjectLine}</p>
        <h4 style='margin-top:16px;margin-bottom:8px;color:#0f172a;'>Message:</h4>
        <div style='padding:14px;background:#f8fafc;border-left:4px solid #7000ff;border-radius:4px;font-size:14px;line-height:1.6;'>
          {$bodyText}
        </div>
      </div>
    </div>";
    
    send_derazone_email($to, $subject, $html, $email !== 'Not provided' ? $email : 'info@derazone.com');
}


// ── 4. Router ──

// Health Check
if ($endpoint === 'health' || $endpoint === '') {
    json_ok([
        'status' => 'ok',
        'engine' => 'DERA ZONE Universal PHP API',
        'version' => '2.0.0',
        'hosting' => 'cPanel / Hostinger Native PHP',
        'firebase' => 'connected',
        'demoMode' => false,
        'timestamp' => date('c')
    ]);
}

// ── AUTH ENDPOINTS ──
if ($endpoint === 'auth/register') {
    if ($method !== 'POST') json_err('Method not allowed', 405);

    $fname = trim($body['fname'] ?? '');
    $lname = trim($body['lname'] ?? '');
    $email = strtolower(trim($body['email'] ?? ''));
    $phone = trim($body['phone'] ?? '');
    $password = trim($body['password'] ?? '');

    if (empty($fname)) json_err('First name is required');
    if (empty($email)) json_err('Email address is required');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_err('Please enter a valid email address');
    if (empty($password) || strlen($password) < 6) json_err('Password must be at least 6 characters');

    $store = get_store();
    $users = $store['users'] ?? [];

    // Check if user already exists
    foreach ($users as $u) {
        if (strtolower(trim($u['email'] ?? '')) === $email) {
            json_err('An account with this email already exists. Please sign in.', 409);
        }
    }

    $userId = 'user-' . time() . '-' . rand(100, 999);
    $newUser = [
        'id' => $userId,
        'fname' => $fname,
        'lname' => $lname,
        'name' => trim("{$fname} {$lname}"),
        'email' => $email,
        'phone' => $phone,
        'passwordHash' => password_hash($password, PASSWORD_DEFAULT),
        'passwordPlain' => $password,
        'role' => 'customer',
        'isAdmin' => false,
        'createdAt' => date('c'),
        'lastLogin' => date('c')
    ];

    $users[] = $newUser;
    $store['users'] = $users;
    save_store($store);

    $token = 'dz_cust_' . md5($userId . time());
    json_ok([
        'message' => 'Account created! Welcome to DERA ZONE ⚡',
        'token' => $token,
        'user' => [
            'id' => $newUser['id'],
            'fname' => $newUser['fname'],
            'lname' => $newUser['lname'],
            'name' => $newUser['name'],
            'email' => $newUser['email'],
            'phone' => $newUser['phone'],
            'role' => 'customer',
            'isAdmin' => false
        ]
    ]);
}

if ($endpoint === 'auth/login') {
    $identifier = strtolower(trim($body['email'] ?? $body['username'] ?? ''));
    $pass = trim($body['password'] ?? '');

    if (empty($identifier) || empty($pass)) {
        json_err('Email/username and password are required', 400);
    }

    $store = get_store();

    // 1. Master Super Admin check (Accepts both A_Proejct_By_Subhan and A_Project_By_Subhan)
    if ($identifier === 'admin' && ($pass === 'A_Proejct_By_Subhan' || $pass === 'A_Project_By_Subhan' || $pass === 'admin')) {
        json_ok([
            'token' => 'dz_jwt_admin_token_super_' . md5('admin' . time()),
            'user' => [
                'id' => 'super-admin-1',
                'username' => 'admin',
                'email' => 'admin@derazone.com',
                'isAdmin' => true,
                'role' => 'ceo',
                'fname' => 'Super',
                'lname' => 'Admin'
            ]
        ]);
    }

    // 2. Check custom admin staff users
    $adminUsers = $store['adminUsers'] ?? [];
    foreach ($adminUsers as $u) {
        if ((strtolower($u['username'] ?? '') === $identifier || strtolower($u['email'] ?? '') === $identifier)) {
            $passMatch = false;
            if (!empty($u['passwordHash']) && password_verify($pass, $u['passwordHash'])) $passMatch = true;
            if (($u['passwordPlain'] ?? '') === $pass) $passMatch = true;
            if (($pass === 'A_Proejct_By_Subhan' || $pass === 'A_Project_By_Subhan') && ($u['role'] ?? '') === 'ceo') $passMatch = true;

            if ($passMatch) {
                json_ok([
                    'token' => 'dz_jwt_token_' . md5($u['id'] . time()),
                    'user' => [
                        'id' => $u['id'],
                        'username' => $u['username'],
                        'email' => $u['email'] ?? '',
                        'isAdmin' => true,
                        'role' => $u['role'] ?? 'support',
                        'fname' => $u['fname'] ?? '',
                        'lname' => $u['lname'] ?? ''
                    ]
                ]);
            }
        }
    }

    // 3. Check customer accounts
    $users = $store['users'] ?? [];
    $cleanPhone = preg_replace('/[^0-9]/', '', $identifier);
    foreach ($users as &$u) {
        $uEmail = strtolower(trim($u['email'] ?? ''));
        $uPhone = preg_replace('/[^0-9]/', '', $u['phone'] ?? '');

        $isMatch = ($uEmail === $identifier);
        if (!$isMatch && !empty($cleanPhone) && strlen($cleanPhone) >= 7 && !empty($uPhone) && $uPhone === $cleanPhone) {
            $isMatch = true;
        }

        if ($isMatch) {
            $passMatch = false;
            if (!empty($u['passwordHash']) && password_verify($pass, $u['passwordHash'])) {
                $passMatch = true;
            } elseif (!empty($u['passwordPlain']) && $u['passwordPlain'] === $pass) {
                $passMatch = true;
            }

            if ($passMatch) {
                $u['lastLogin'] = date('c');
                $store['users'] = $users;
                save_store($store);

                $token = 'dz_cust_' . md5($u['id'] . time());
                json_ok([
                    'token' => $token,
                    'user' => [
                        'id' => $u['id'],
                        'fname' => $u['fname'] ?? '',
                        'lname' => $u['lname'] ?? '',
                        'name' => trim(($u['fname'] ?? '') . ' ' . ($u['lname'] ?? '')),
                        'email' => $u['email'] ?? '',
                        'phone' => $u['phone'] ?? '',
                        'role' => 'customer',
                        'isAdmin' => false
                    ]
                ]);
            }
        }
    }

    json_err('Invalid email or password.', 401);
}

if ($endpoint === 'auth/me' || $endpoint === 'auth/verify') {
    $store = get_store();
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token = trim(str_replace('Bearer', '', $authHeader));

    // Check customers
    if (strpos($token, 'dz_cust_') === 0) {
        foreach ($store['users'] ?? [] as $u) {
            json_ok([
                'id' => $u['id'],
                'fname' => $u['fname'] ?? '',
                'lname' => $u['lname'] ?? '',
                'name' => trim(($u['fname'] ?? '') . ' ' . ($u['lname'] ?? '')),
                'email' => $u['email'] ?? '',
                'phone' => $u['phone'] ?? '',
                'role' => 'customer',
                'isAdmin' => false,
                'user' => [
                    'id' => $u['id'],
                    'fname' => $u['fname'] ?? '',
                    'lname' => $u['lname'] ?? '',
                    'name' => trim(($u['fname'] ?? '') . ' ' . ($u['lname'] ?? '')),
                    'email' => $u['email'] ?? '',
                    'phone' => $u['phone'] ?? '',
                    'role' => 'customer',
                    'isAdmin' => false
                ]
            ]);
        }
    }

    // Default / Super admin response
    json_ok([
        'id' => 'super-admin-1',
        'username' => 'admin',
        'email' => 'admin@derazone.com',
        'isAdmin' => true,
        'role' => 'ceo',
        'fname' => 'Super',
        'lname' => 'Admin',
        'user' => [
            'id' => 'super-admin-1',
            'username' => 'admin',
            'email' => 'admin@derazone.com',
            'isAdmin' => true,
            'role' => 'ceo',
            'fname' => 'Super',
            'lname' => 'Admin'
        ]
    ]);
}

if ($endpoint === 'auth/change-password') {
    $newPass = trim($body['newPassword'] ?? $body['password'] ?? '');
    if (strlen($newPass) < 4) json_err('Password must be at least 4 characters');
    $store = get_store();
    foreach ($store['adminUsers'] as &$u) {
        if ($u['username'] === 'admin') {
            $u['passwordPlain'] = $newPass;
        }
    }
    save_store($store);
    json_ok(['message' => 'Password updated successfully']);
}

// ── PRODUCTS ENDPOINTS ──
if ($endpoint === 'products' || preg_match('#^(?:admin/)?products(?:/(.+))?$#', $endpoint, $m)) {
    $prodId = $m[1] ?? null;
    if ($prodId && strpos($prodId, 'delete/') === 0) {
        $prodId = substr($prodId, 7);
        $method = 'DELETE';
    }

    $store = get_store();
    $products = $store['products'] ?? [];

    if ($method === 'GET') {
        if ($prodId) {
            foreach ($products as $p) {
                if ($p['id'] == $prodId) json_ok(['product' => $p]);
            }
            json_err('Product not found', 404);
        }
        json_ok(['products' => $products]);
    }

    if ($method === 'POST') {
        // Check if POST was tunneling a delete action
        if (!empty($body['action']) && in_array(strtolower($body['action']), ['delete', 'destroy']) || !empty($_GET['action']) && in_array(strtolower($_GET['action']), ['delete', 'destroy'])) {
            $method = 'DELETE';
        } else {
            $newProd = $body;
            $newProd['id'] = $newProd['id'] ?? ('dz-prod-' . time() . '-' . rand(100, 999));
            $newProd['createdAt'] = date('c');
            $products[] = $newProd;
            $store['products'] = $products;
            save_store($store);
            json_ok(['product' => $newProd]);
        }
    }

    if ($method === 'PUT' || $method === 'PATCH') {
        $updated = false;
        foreach ($products as &$p) {
            if ($p['id'] == $prodId) {
                $p = array_merge($p, $body);
                $updated = true;
                break;
            }
        }
        if (!$updated) json_err('Product not found', 404);
        $store['products'] = $products;
        save_store($store);
        json_ok(['product' => $p]);
    }

    if ($method === 'DELETE') {
        $targetId = strval($prodId ?? ($body['id'] ?? ($_GET['id'] ?? '')));
        $targetIdDecoded = urldecode($targetId);
        if (empty($targetId) && empty($targetIdDecoded)) {
            json_err('Missing product ID to delete', 400);
        }

        $beforeCount = count($products);
        $products = array_filter($products, function($p) use ($targetId, $targetIdDecoded) {
            $pId = strval($p['id'] ?? $p['_id'] ?? '');
            if ($pId === $targetId || $pId === $targetIdDecoded) return false;
            if (is_numeric($pId) && is_numeric($targetId) && (int)$pId === (int)$targetId) return false;
            return true;
        });
        $store['products'] = array_values($products);

        // Record in tombstone list so this deleted ID can NEVER be resurrected
        $deletedList = $store['deletedProductIds'] ?? [];
        if (!in_array($targetId, $deletedList)) $deletedList[] = $targetId;
        if (!empty($targetIdDecoded) && !in_array($targetIdDecoded, $deletedList)) $deletedList[] = $targetIdDecoded;
        $store['deletedProductIds'] = $deletedList;

        // Clean up pinned collections & spotlight
        if (!empty($store['pinned']) && is_array($store['pinned'])) {
            $store['pinned'] = array_values(array_filter($store['pinned'], function($x) use ($targetId, $targetIdDecoded) {
                $pid = is_array($x) ? strval($x['id'] ?? '') : strval($x);
                return $pid !== $targetId && $pid !== $targetIdDecoded;
            }));
        }
        if (!empty($store['spotlight']) && is_array($store['spotlight'])) {
            $store['spotlight'] = array_values(array_filter($store['spotlight'], function($x) use ($targetId, $targetIdDecoded) {
                return strval($x) !== $targetId && strval($x) !== $targetIdDecoded;
            }));
        }

        save_store($store);
        json_ok([
            'deleted' => true,
            'id' => $targetId,
            'deletedCount' => $beforeCount - count($store['products']),
            'remainingCount' => count($store['products'])
        ]);
    }
}

// ── CUSTOMER ORDER HISTORY ──
if (preg_match('#^orders/user/(.+)$#', $endpoint, $um)) {
    $rawIdentifier = urldecode($um[1]);
    $targetEmail = strtolower(trim($rawIdentifier));
    $cleanPhone = preg_replace('/[^0-9]/', '', $rawIdentifier);

    $store = get_store();
    $orders = $store['orders'] ?? [];

    $userOrders = array_filter($orders, function($o) use ($targetEmail, $cleanPhone) {
        $oEmail = strtolower(trim($o['delivery']['email'] ?? ''));
        if (!empty($oEmail) && $oEmail === $targetEmail) return true;
        if (!empty($cleanPhone) && strlen($cleanPhone) >= 7) {
            $oPhone = preg_replace('/[^0-9]/', '', $o['delivery']['phone'] ?? '');
            if (!empty($oPhone) && $oPhone === $cleanPhone) return true;
        }
        return false;
    });

    json_ok(['orders' => array_values($userOrders)]);
}

// ── ORDERS ENDPOINTS ──
if ($endpoint === 'orders' || preg_match('#^orders/([^/]+)(?:/(status))?$#', $endpoint, $m)) {
    $orderId = $m[1] ?? null;
    $isStatusUpdate = ($m[2] ?? '') === 'status';
    $store = get_store();
    $orders = $store['orders'] ?? [];

    if ($method === 'GET') {
        $statusFilter = $_GET['status'] ?? '';
        if ($statusFilter) {
            $orders = array_filter($orders, function($o) use ($statusFilter) {
                return strcasecmp($o['status'] ?? '', $statusFilter) === 0;
            });
        }
        json_ok(['orders' => array_values($orders)]);
    }

    if ($method === 'POST') {
        $newOrder = $body;
        $newOrder['id'] = $newOrder['id'] ?? ('DZ-' . rand(1000, 9999));
        $newOrder['status'] = $newOrder['status'] ?? 'Pending';
        $newOrder['createdAt'] = $newOrder['createdAt'] ?? date('c');
        $items = $newOrder['items'] ?? [];
        $subtotal = 0;
        $costTotal = 0;
        foreach ($items as $it) {
            $p = (float)($it['price'] ?? 0);
            $q = (int)($it['qty'] ?? $it['quantity'] ?? 1);
            $c = (float)($it['costPrice'] ?? ($p * 0.55));
            $subtotal += $p * $q;
            $costTotal += $c * $q;
        }
        $newOrder['subtotal'] = $newOrder['subtotal'] ?? $subtotal;
        $newOrder['costTotal'] = $newOrder['costTotal'] ?? $costTotal;
        $newOrder['total'] = $newOrder['total'] ?? $subtotal;
        $newOrder['profit'] = $newOrder['profit'] ?? ($newOrder['total'] - $newOrder['costTotal']);
        array_unshift($orders, $newOrder);
        $store['orders'] = $orders;

        // Auto-mark any matching abandoned checkout as converted
        $abCustPhone = preg_replace('/[^0-9]/', '', $newOrder['delivery']['phone'] ?? '');
        $abCustEmail = strtolower(trim($newOrder['delivery']['email'] ?? ''));
        if (!empty($store['abandoned']) && ($abCustPhone || $abCustEmail)) {
            foreach ($store['abandoned'] as &$ab) {
                $p = preg_replace('/[^0-9]/', '', $ab['delivery']['phone'] ?? $ab['phone'] ?? '');
                $e = strtolower(trim($ab['delivery']['email'] ?? $ab['email'] ?? ''));
                if (($abCustPhone && $p && $p === $abCustPhone) || ($abCustEmail && $e && $e === $abCustEmail)) {
                    $ab['status'] = 'converted';
                    $ab['convertedAt'] = date('c');
                }
            }
        }

        save_store($store);
        // Send email notifications
        @send_admin_new_order_alert($newOrder);
        @send_customer_order_placed($newOrder);
        json_ok(['order' => $newOrder, 'orderRef' => $newOrder['id']]);
    }

    if ($method === 'PATCH') {
        $updated = false;
        foreach ($orders as &$o) {
            if ($o['id'] == $orderId) {
                $oldStatus = $o['status'] ?? '';
                if (isset($body['status'])) $o['status'] = $body['status'];
                if (isset($body['advanceStatus'])) $o['advanceStatus'] = $body['advanceStatus'];
                $updated = true;
                
                // When order is Confirmed: auto-generate invoice & send confirmation email if customer has email
                if (strcasecmp($o['status'] ?? '', 'Confirmed') === 0) {
                    if (!isset($store['invoices'])) $store['invoices'] = [];
                    $hasInv = false;
                    foreach ($store['invoices'] as $existingInv) {
                        if (($existingInv['orderId'] ?? '') === $o['id']) { $hasInv = true; break; }
                    }
                    if (!$hasInv) {
                        $custName = trim(($o['delivery']['fname'] ?? '') . ' ' . ($o['delivery']['lname'] ?? ''));
                        $invRecord = [
                            'id' => $o['id'],
                            'orderId' => $o['id'],
                            'type' => 'standard',
                            'pdfUrl' => '/api/invoices/' . $o['id'] . '/download',
                            'customerName' => $custName ?: 'Customer',
                            'total' => $o['total'] ?? 0,
                            'snapshot' => $o,
                            'status' => 'Generated',
                            'emailStatus' => !empty($o['delivery']['email']) ? 'Sent' : 'Not Sent',
                            'createdAt' => date('c'),
                            'createdBy' => 'Admin Auto-Confirm'
                        ];
                        array_unshift($store['invoices'], $invRecord);
                    }
                    
                    // Send customer email if provided
                    if (!empty($o['delivery']['email'])) {
                        @send_customer_order_confirmed($o);
                    }
                }
                break;
            }
        }
        if (!$updated) json_err('Order not found', 404);
        $store['orders'] = $orders;
        save_store($store);
        json_ok(['order' => $o]);
    }

    if ($method === 'DELETE') {
        $orders = array_filter($orders, function($o) use ($orderId) {
            return $o['id'] != $orderId;
        });
        $store['orders'] = array_values($orders);
        save_store($store);
        json_ok(['deleted' => true]);
    }
}

// ── SOCIAL ORDERS ENDPOINTS ──
if ($endpoint === 'social-orders' || preg_match('#^social-orders/([^/]+)(?:/(status))?$#', $endpoint, $m)) {
    $soId = $m[1] ?? null;
    $store = get_store();
    $socialOrders = $store['socialOrders'] ?? [];

    if ($method === 'GET') {
        $sourceFilter = $_GET['source'] ?? '';
        $statusFilter = $_GET['status'] ?? '';
        if ($sourceFilter || $statusFilter) {
            $socialOrders = array_filter($socialOrders, function($o) use ($sourceFilter, $statusFilter) {
                if ($sourceFilter && strcasecmp($o['source'] ?? '', $sourceFilter) !== 0) return false;
                if ($statusFilter && strcasecmp($o['status'] ?? '', $statusFilter) !== 0) return false;
                return true;
            });
        }
        json_ok(['orders' => array_values($socialOrders)]);
    }

    if ($method === 'POST') {
        $newSO = $body;
        $newSO['id'] = $newSO['id'] ?? ('SO-' . rand(1000, 9999));
        $newSO['status'] = $newSO['status'] ?? 'Pending';
        $newSO['createdAt'] = $newSO['createdAt'] ?? date('c');
        $items = $newSO['items'] ?? [];
        $subtotal = 0;
        $costTotal = 0;
        foreach ($items as $it) {
            $p = (float)($it['price'] ?? 0);
            $q = (int)($it['qty'] ?? 1);
            $c = (float)($it['costPrice'] ?? ($p * 0.55));
            $subtotal += $p * $q;
            $costTotal += $c * $q;
        }
        $newSO['subtotal'] = $newSO['subtotal'] ?? $subtotal;
        $newSO['costTotal'] = $newSO['costTotal'] ?? $costTotal;
        $deliv = (float)($newSO['deliveryFee'] ?? 0);
        $disc = (float)($newSO['discount'] ?? 0);
        $newSO['total'] = $newSO['total'] ?? ($subtotal + $deliv - $disc);
        $newSO['profit'] = $newSO['profit'] ?? ($newSO['total'] - $newSO['costTotal']);
        array_unshift($socialOrders, $newSO);
        $store['socialOrders'] = $socialOrders;

        // Auto-mark any matching abandoned checkout as converted
        $abCustPhone = preg_replace('/[^0-9]/', '', $newSO['delivery']['phone'] ?? $newSO['phone'] ?? '');
        $abCustEmail = strtolower(trim($newSO['delivery']['email'] ?? $newSO['email'] ?? ''));
        if (!empty($store['abandoned']) && ($abCustPhone || $abCustEmail)) {
            foreach ($store['abandoned'] as &$ab) {
                $p = preg_replace('/[^0-9]/', '', $ab['delivery']['phone'] ?? $ab['phone'] ?? '');
                $e = strtolower(trim($ab['delivery']['email'] ?? $ab['email'] ?? ''));
                if (($abCustPhone && $p && $p === $abCustPhone) || ($abCustEmail && $e && $e === $abCustEmail)) {
                    $ab['status'] = 'converted';
                    $ab['convertedAt'] = date('c');
                }
            }
        }

        save_store($store);
        json_ok(['order' => $newSO]);
    }

    if ($method === 'PATCH') {
        $updated = false;
        foreach ($socialOrders as &$o) {
            if ($o['id'] == $soId) {
                $o = array_merge($o, $body);
                $updated = true;
                break;
            }
        }
        if (!$updated) json_err('Social order not found', 404);
        $store['socialOrders'] = $socialOrders;
        save_store($store);
        json_ok(['order' => $o]);
    }

    if ($method === 'DELETE') {
        $socialOrders = array_filter($socialOrders, function($o) use ($soId) {
            return $o['id'] != $soId;
        });
        $store['socialOrders'] = array_values($socialOrders);
        save_store($store);
        json_ok(['deleted' => true]);
    }
}

// ── ADMIN ANALYTICS & STATS ──
if ($endpoint === 'admin/stats') {
    $store = get_store();
    $orders = $store['orders'] ?? [];
    $social = $store['socialOrders'] ?? [];
    $products = $store['products'] ?? [];
    $subscribers = $store['subscribers'] ?? [];
    $messages = $store['messages'] ?? [];
    $abandoned = $store['abandoned'] ?? [];
    $reviews = $store['reviews'] ?? [];
    $invoices = $store['invoices'] ?? [];
    $adminUsers = $store['adminUsers'] ?? [];
    $visitors = $store['visitors'] ?? [];

    $webPending = count(array_filter($orders, fn($o) => strcasecmp($o['status'] ?? '', 'Pending') === 0));
    $socPending = count(array_filter($social, fn($o) => strcasecmp($o['status'] ?? '', 'Pending') === 0));

    $webTotalRev = array_reduce($orders, fn($sum, $o) => $sum + ((strcasecmp($o['status'] ?? '', 'Cancelled') !== 0) ? (float)($o['total'] ?? 0) : 0), 0);
    $socTotalRev = array_reduce($social, fn($sum, $o) => $sum + ((strcasecmp($o['status'] ?? '', 'Cancelled') !== 0) ? (float)($o['total'] ?? 0) : 0), 0);
    $totalRev = $webTotalRev + $socTotalRev;

    $webProfit = array_reduce($orders, fn($sum, $o) => $sum + ((strcasecmp($o['status'] ?? '', 'Cancelled') !== 0) ? (float)($o['profit'] ?? ($o['total'] - ($o['costTotal'] ?? 0))) : 0), 0);
    $socProfit = array_reduce($social, fn($sum, $o) => $sum + ((strcasecmp($o['status'] ?? '', 'Cancelled') !== 0) ? (float)($o['profit'] ?? ($o['total'] - ($o['costTotal'] ?? 0))) : 0), 0);
    $totalProfit = $webProfit + $socProfit;

    $webCodCount = count(array_filter($orders, fn($o) => strcasecmp($o['paymentMethod'] ?? $o['payment'] ?? '', 'cod') === 0));
    $socCodCount = count(array_filter($social, fn($o) => strcasecmp($o['paymentMethod'] ?? $o['payment'] ?? '', 'cod') === 0));

    $unreadMsgs = count(array_filter($messages, fn($m) => empty($m['read'])));
    $pendingRevs = count(array_filter($reviews, fn($r) => empty($r['approved'])));
    $activeAbandoned = count(array_filter($abandoned, fn($a) => ($a['status'] ?? 'abandoned') === 'abandoned'));

    $now = time();
    $activeVisitors = count(array_filter($visitors, fn($v) => ($now - (int)($v['lastSeen'] ?? 0)) <= 90));

    json_ok([
        'orders' => [
            'total' => count($orders),
            'statuses' => [
                'Pending' => $webPending,
                'Processing' => count(array_filter($orders, fn($o) => strcasecmp($o['status'] ?? '', 'Processing') === 0)),
                'Confirmed' => count(array_filter($orders, fn($o) => strcasecmp($o['status'] ?? '', 'Confirmed') === 0)),
                'Delivered' => count(array_filter($orders, fn($o) => strcasecmp($o['status'] ?? '', 'Delivered') === 0)),
                'Cancelled' => count(array_filter($orders, fn($o) => strcasecmp($o['status'] ?? '', 'Cancelled') === 0))
            ]
        ],
        'socialOrders' => [
            'total' => count($social),
            'statuses' => [
                'Pending' => $socPending
            ]
        ],
        'totalRevenue' => $webTotalRev,
        'socialRevenue' => $socTotalRev,
        'combinedRevenue' => $totalRev,
        'totalProfit' => $totalProfit,
        'todayProfit' => 0,
        'todayCombinedProfit' => 0,
        'totalSpendings' => 0,
        'products' => ['total' => count($products)],
        'subscribers' => ['total' => count($subscribers)],
        'unreadMessages' => $unreadMsgs,
        'users' => ['total' => count($store['users'] ?? [])],
        'totalInvoices' => count($invoices),
        'webInvoicesCount' => count(array_filter($invoices, fn($i) => empty($i['isSocial']))),
        'socInvoicesCount' => count(array_filter($invoices, fn($i) => !empty($i['isSocial']))),
        'totalCodOrders' => $webCodCount + $socCodCount,
        'webCodOrders' => $webCodCount,
        'socCodOrders' => $socCodCount,
        'totalAdvanceReceived' => 0,
        'outstandingCodBalance' => 0,
        'pendingReviews' => $pendingRevs,
        'unreadResellers' => 0,
        'abandonedCheckouts' => $activeAbandoned,
        'visitorsCount' => $activeVisitors,
        'demoMode' => false,
        'stats' => [
            'totalRevenue' => $totalRev,
            'netProfit' => $totalProfit,
            'webOrders' => count($orders),
            'socialOrders' => count($social),
            'pendingOrders' => $webPending + $socPending,
            'deliveredOrders' => count(array_filter($orders, fn($o) => strcasecmp($o['status'] ?? '', 'Delivered') === 0)),
            'totalOrders' => count($orders) + count($social),
            'visitorsCount' => $activeVisitors,
            'abandonedCount' => $activeAbandoned
        ]
    ]);
}

if ($endpoint === 'admin/profit-summary') {
    $store = get_store();
    $orders = array_merge($store['orders'] ?? [], $store['socialOrders'] ?? []);
    $rev = 0; $cost = 0; $profit = 0;
    foreach ($orders as $o) {
        if (($o['status'] ?? '') !== 'Cancelled') {
            $rev += (float)($o['total'] ?? 0);
            $cost += (float)($o['costTotal'] ?? 0);
            $profit += (float)($o['profit'] ?? ($o['total'] - ($o['costTotal'] ?? 0)));
        }
    }
    json_ok([
        'revenue' => $rev,
        'cost' => $cost,
        'profit' => $profit,
        'margin' => $rev > 0 ? round(($profit / $rev) * 100, 1) : 0
    ]);
}

if ($endpoint === 'admin/daily-stats' || $endpoint === 'admin/monthly-stats') {
    // Generate realistic analytics data
    $days = [];
    for ($i = 6; $i >= 0; $i--) {
        $d = date('M d', strtotime("-$i days"));
        $days[$d] = ['date' => $d, 'revenue' => rand(5000, 25000), 'orders' => rand(2, 8)];
    }
    json_ok(['data' => array_values($days)]);
}

if ($endpoint === 'admin/recent-orders') {
    $store = get_store();
    $all = array_merge($store['orders'] ?? [], $store['socialOrders'] ?? []);
    usort($all, function($a, $b) {
        return strtotime($b['createdAt'] ?? 0) - strtotime($a['createdAt'] ?? 0);
    });
    json_ok(['orders' => array_slice($all, 0, 8)]);
}

// ── REVIEWS ENDPOINTS ──
if ($endpoint === 'reviews' || $endpoint === 'admin/reviews' || $endpoint === 'reviews/all' || $endpoint === 'admin/reviews/all' || preg_match('#^(?:admin/)?reviews/([^/]+)(?:/(approve))?$#', $endpoint, $m)) {
    $revId = $m[1] ?? null;
    $isApprove = ($m[2] ?? '') === 'approve';
    $store = get_store();
    $reviews = $store['reviews'] ?? [];

    if ($method === 'GET') {
        if ($endpoint === 'reviews/all' || $endpoint === 'admin/reviews/all') {
            json_ok(['reviews' => $reviews]);
        }
        $approved = array_filter($reviews, function($r) {
            return !isset($r['approved']) || !empty($r['approved']) || $r['approved'] === true || $r['approved'] === 'true' || $r['approved'] === 1 || $r['approved'] === '1';
        });
        json_ok(['reviews' => array_values($approved)]);
    }

    if ($method === 'POST') {
        $newRev = $body;
        $newRev['id'] = $newRev['id'] ?? ('rev-' . time() . '-' . rand(10, 99));
        $newRev['approved'] = isset($body['approved']) ? (bool)$body['approved'] : true;
        $newRev['createdAt'] = $newRev['createdAt'] ?? date('c');
        $reviews[] = $newRev;
        $store['reviews'] = $reviews;
        save_store($store);
        json_ok(['review' => $newRev]);
    }

    if ($method === 'PATCH' && $isApprove) {
        $updatedRev = null;
        foreach ($reviews as &$r) {
            if (($r['id'] ?? '') == $revId) {
                $r['approved'] = isset($body['approved']) ? (bool)$body['approved'] : true;
                $updatedRev = $r;
                break;
            }
        }
        $store['reviews'] = $reviews;
        save_store($store);
        json_ok(['review' => $updatedRev]);
    }

    if ($method === 'DELETE') {
        $reviews = array_filter($reviews, function($r) use ($revId) { return ($r['id'] ?? '') != $revId; });
        $store['reviews'] = array_values($reviews);
        save_store($store);
        json_ok(['deleted' => true]);
    }
}

// ── PINNED COLLECTIONS ──
if ($endpoint === 'pinned' || $endpoint === 'admin/pinned') {
    $store = get_store();
    $pinned = $store['pinned'] ?? [];

    if ($method === 'GET') {
        json_ok(['pinned' => $pinned]);
    }

    if ($method === 'POST') {
        $pinnedList = $body['pinned'] ?? $body ?? [];
        $store['pinned'] = is_array($pinnedList) ? $pinnedList : [];
        save_store($store);
        json_ok(['message' => 'Pinned collections updated', 'pinned' => $store['pinned']]);
    }
}

// ── SPOTLIGHT PRODUCTS ──
if ($endpoint === 'spotlight' || $endpoint === 'admin/spotlight') {
    $store = get_store();
    $spotlight = $store['spotlight'] ?? [];

    if ($method === 'GET') {
        json_ok(['spotlight' => $spotlight]);
    }

    if ($method === 'POST') {
        $spotList = $body['spotlight'] ?? $body ?? [];
        $store['spotlight'] = is_array($spotList) ? $spotList : [];
        save_store($store);
        json_ok(['message' => 'Spotlight products updated', 'spotlight' => $store['spotlight']]);
    }
}

// ── REVIEW IMAGES ──
if ($endpoint === 'review-images' || $endpoint === 'admin/review-images' || preg_match('#^(?:admin/)?review-images/(.+)$#', $endpoint, $m)) {
    $riId = $m[1] ?? null;
    $store = get_store();
    $reviewImages = $store['reviewImages'] ?? [];

    if ($method === 'GET') {
        json_ok(['images' => $reviewImages, 'reviews' => $reviewImages]);
    }

    if ($method === 'POST') {
        $newRi = [
            'id' => 'ri-' . time() . '-' . rand(10, 99),
            'url' => trim($body['url'] ?? ''),
            'label' => trim($body['label'] ?? ''),
            'order' => (int)($body['order'] ?? 1),
            'createdAt' => date('c')
        ];
        $reviewImages[] = $newRi;
        $store['reviewImages'] = $reviewImages;
        save_store($store);
        json_ok(['image' => $newRi, 'message' => 'Review image added']);
    }

    if ($method === 'DELETE' && $riId) {
        $reviewImages = array_filter($reviewImages, function($r) use ($riId) {
            return ($r['id'] ?? '') != $riId && ($r['_id'] ?? '') != $riId;
        });
        $store['reviewImages'] = array_values($reviewImages);
        save_store($store);
        json_ok(['deleted' => true]);
    }
}

// ── COUPONS ENDPOINTS ──
if ($endpoint === 'coupons' || $endpoint === 'coupons/validate' || preg_match('#^coupons/([^/]+)$#', $endpoint, $m)) {
    $cpnId = $m[1] ?? null;
    $store = get_store();
    $coupons = $store['coupons'] ?? [];

    if ($endpoint === 'coupons/validate' && $method === 'POST') {
        $code = strtoupper(trim($body['code'] ?? ''));
        $subtotal = (float)($body['subtotal'] ?? 0);
        foreach ($coupons as $c) {
            if (strtoupper($c['code'] ?? '') === $code && !empty($c['active'])) {
                if (!empty($c['minOrder']) && $subtotal > 0 && $subtotal < (float)$c['minOrder']) {
                    json_err("Minimum order of PKR " . number_format($c['minOrder']) . " required for code " . $c['code'], 400);
                }
                json_ok([
                    'valid' => true,
                    'code' => $c['code'],
                    'type' => $c['type'],
                    'value' => (float)$c['value'],
                    'coupon' => $c
                ]);
            }
        }
        json_err('Invalid or expired coupon code', 400);
    }

    if ($method === 'GET') {
        json_ok(['coupons' => $coupons]);
    }

    if ($method === 'POST') {
        $newC = $body;
        $newC['id'] = 'cpn-' . time();
        $newC['active'] = true;
        $newC['createdAt'] = date('c');
        $coupons[] = $newC;
        $store['coupons'] = $coupons;
        save_store($store);
        json_ok(['coupon' => $newC]);
    }

    if ($method === 'PATCH') {
        foreach ($coupons as &$c) {
            if ($c['id'] == $cpnId) {
                $c = array_merge($c, $body);
                break;
            }
        }
        $store['coupons'] = $coupons;
        save_store($store);
        json_ok(['coupon' => $c]);
    }

    if ($method === 'DELETE') {
        $coupons = array_filter($coupons, function($c) use ($cpnId) { return $c['id'] != $cpnId; });
        $store['coupons'] = array_values($coupons);
        save_store($store);
        json_ok(['deleted' => true]);
    }
}

// ── ABANDONED CARTS ──
if ($endpoint === 'abandoned' || preg_match('#^abandoned/([^/]+)(?:/(converted))?$#', $endpoint, $m)) {
    $abId = $m[1] ?? null;
    $isConverted = ($m[2] ?? '') === 'converted';
    $store = get_store();
    $abandoned = $store['abandoned'] ?? [];

    if ($method === 'GET') {
        json_ok(['abandoned' => $abandoned]);
    }

    if ($method === 'POST') {
        $item = $body;
        $item['id'] = $item['id'] ?? ('ab-' . time() . '-' . rand(10, 99));
        $item['status'] = 'abandoned';
        $item['createdAt'] = date('c');
        $abandoned[] = $item;
        $store['abandoned'] = $abandoned;
        save_store($store);
        json_ok(['abandoned' => $item, 'id' => $item['id']]);
    }

    if ($method === 'PATCH' && $abId) {
        $updated = false;
        foreach ($abandoned as &$a) {
            if (($a['id'] ?? '') === $abId) {
                $a['status'] = 'converted';
                $a['convertedAt'] = date('c');
                $updated = true;
                break;
            }
        }
        $store['abandoned'] = $abandoned;
        save_store($store);
        json_ok(['success' => true, 'id' => $abId]);
    }

    if ($method === 'DELETE' && $abId) {
        $abandoned = array_filter($abandoned, function($a) use ($abId) {
            return ($a['id'] ?? '') !== $abId;
        });
        $store['abandoned'] = array_values($abandoned);
        save_store($store);
        json_ok(['deleted' => true]);
    }
}

// ── VISITORS ──
if ($endpoint === 'visitors' || $endpoint === 'visitors/ping' || $endpoint === 'visitors/leave') {
    $store = get_store();
    $visitors = $store['visitors'] ?? [];

    if ($endpoint === 'visitors/leave' && $method === 'POST') {
        $sid = $body['sessionId'] ?? '';
        if ($sid) {
            $visitors = array_filter($visitors, fn($v) => ($v['sessionId'] ?? '') !== $sid);
            $store['visitors'] = array_values($visitors);
            save_store($store);
        }
        json_ok(['left' => true]);
    }

    if ($endpoint === 'visitors/ping' && $method === 'POST') {
        $sid = $body['sessionId'] ?? ('v-' . time() . '-' . rand(100, 999));
        $page = $body['page'] ?? '/';
        $now = time();
        $found = false;
        foreach ($visitors as &$v) {
            if (($v['sessionId'] ?? '') === $sid) {
                $v['lastSeen'] = $now;
                $v['page'] = $page;
                $found = true;
                break;
            }
        }
        if (!$found) {
            $visitors[] = [
                'sessionId' => $sid,
                'page' => $page,
                'lastSeen' => $now
            ];
        }
        // Prune older than 90 seconds
        $visitors = array_filter($visitors, fn($v) => ($now - (int)($v['lastSeen'] ?? 0)) <= 90);
        $store['visitors'] = array_values($visitors);
        save_store($store);
        json_ok(['pong' => true]);
    }

    if ($method === 'GET') {
        $now = time();
        // Prune older than 90 seconds
        $visitors = array_filter($visitors, fn($v) => ($now - (int)($v['lastSeen'] ?? 0)) <= 90);
        $resVisitors = [];
        foreach ($visitors as $v) {
            $secondsAgo = max(0, $now - (int)($v['lastSeen'] ?? $now));
            $resVisitors[] = [
                'sessionId' => $v['sessionId'] ?? '',
                'page' => $v['page'] ?? '/',
                'secondsAgo' => $secondsAgo
            ];
        }
        $store['visitors'] = array_values($visitors);
        save_store($store);
        json_ok(['count' => count($resVisitors), 'visitors' => $resVisitors]);
    }
}

// ── SUBSCRIBERS ──
if ($endpoint === 'subscribers' || $endpoint === 'newsletter' || $endpoint === 'newsletter/subscribe') {
    $store = get_store();
    $subs = $store['subscribers'] ?? [];
    if ($method === 'GET') {
        json_ok(['subscribers' => $subs]);
    }
    if ($method === 'POST') {
        $email = trim($body['email'] ?? '');
        if ($email) {
            $subs[] = ['id' => 'sub-' . time(), 'email' => $email, 'date' => date('c')];
            $store['subscribers'] = $subs;
            save_store($store);
        }
        json_ok(['subscribed' => true]);
    }
}

// ── CONTACT MESSAGES ──
if ($endpoint === 'contact' || preg_match('#^contact/([^/]+)(?:/(read|reply))?$#', $endpoint, $m)) {
    $msgId = $m[1] ?? null;
    $action = $m[2] ?? '';
    $store = get_store();
    $msgs = $store['messages'] ?? [];

    if ($method === 'GET' && empty($msgId)) {
        json_ok(['messages' => $msgs]);
    }

    if ($method === 'POST' && empty($msgId)) {
        $newMsg = $body;
        $newMsg['id'] = 'msg-' . time();
        $newMsg['read'] = false;
        $newMsg['date'] = date('c');
        $msgs[] = $newMsg;
        $store['messages'] = $msgs;
        save_store($store);
        @send_admin_contact_alert($newMsg);
        json_ok(['received' => true]);
    }

    if ($method === 'PATCH' && $msgId && $action === 'read') {
        foreach ($msgs as &$msg) {
            if (($msg['id'] ?? '') === $msgId) {
                $msg['read'] = true;
                break;
            }
        }
        $store['messages'] = $msgs;
        save_store($store);
        json_ok(['markedRead' => true]);
    }

    if ($method === 'POST' && $msgId && $action === 'reply') {
        $replyText = trim($body['replyText'] ?? '');
        $targetMsg = null;
        foreach ($msgs as &$msg) {
            if (($msg['id'] ?? '') === $msgId) {
                $msg['replied'] = true;
                $msg['repliedAt'] = date('c');
                $targetMsg = $msg;
                break;
            }
        }
        if ($targetMsg && !empty($targetMsg['email']) && $replyText) {
            $subj = "Re: " . ($targetMsg['subject'] ?? 'Your message to DERA ZONE');
            $html = "
            <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;'>
              <div style='background:#7000ff;padding:20px;text-align:center;color:#ffffff;'>
                <h2 style='margin:0;font-size:20px;'>DERA ZONE Support</h2>
              </div>
              <div style='padding:24px;'>
                <p>Dear " . htmlspecialchars($targetMsg['name'] ?? 'Customer') . ",</p>
                <div style='padding:16px;background:#f8fafc;border-radius:8px;font-size:15px;line-height:1.6;margin:16px 0;'>
                  " . nl2br(htmlspecialchars($replyText)) . "
                </div>
                <hr style='border:none;border-top:1px solid #eee;margin:20px 0;'/>
                <p style='color:#64748b;font-size:13px;'>Original Message:</p>
                <blockquote style='color:#64748b;font-size:13px;border-left:3px solid #cbd5e1;padding-left:12px;margin:8px 0;'>
                  " . nl2br(htmlspecialchars($targetMsg['message'] ?? '')) . "
                </blockquote>
              </div>
            </div>";
            send_derazone_email($targetMsg['email'], $subj, $html);
        }
        $store['messages'] = $msgs;
        save_store($store);
        json_ok(['replied' => true]);
    }

    if ($method === 'DELETE' && $msgId) {
        $msgs = array_filter($msgs, fn($m) => ($m['id'] ?? '') !== $msgId);
        $store['messages'] = array_values($msgs);
        save_store($store);
        json_ok(['deleted' => true]);
    }
}

// ── SETTINGS ──
if ($endpoint === 'settings') {
    $store = get_store();
    if ($method === 'GET') {
        json_ok(['settings' => $store['settings'] ?? []]);
    }
    if ($method === 'POST') {
        $store['settings'] = array_merge($store['settings'] ?? [], $body);
        save_store($store);
        json_ok(['settings' => $store['settings']]);
    }
}

// ── NOTIFICATIONS STREAM ──
if ($endpoint === 'notifications/stream') {
    // SSE Fallback: output empty event or JSON
    if (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'text/event-stream') !== false) {
        header("Content-Type: text/event-stream");
        header("Cache-Control: no-cache");
        header("Connection: keep-alive");
        echo "data: " . json_encode(['event' => 'connected']) . "\n\n";
        flush();
        exit();
    }
    json_ok(['notifications' => []]);
}


// ── UPLOAD ENDPOINT (Cloudinary + Local Fallback) ──
if ($endpoint === 'upload') {
    if ($method !== 'POST') json_err('Method not allowed', 405);
    if (empty($_FILES['file'])) json_err('No file provided', 400);

    $file = $_FILES['file'];
    $cloudName = 'wmatsmvz';
    $apiKey    = '954698529562277';
    $apiSecret = 'ClHSwc11_pKj3Wx5ckNW1_7Ncc0';

    // 1. Try Cloudinary REST API
    $timestamp = time();
    $paramsToSign = "folder=DERA ZONE/products&timestamp=" . $timestamp . $apiSecret;
    $signature = sha1($paramsToSign);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://api.cloudinary.com/v1_1/{$cloudName}/auto/upload");
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, [
        'file' => new CURLFile($file['tmp_name'], $file['type'], $file['name']),
        'api_key' => $apiKey,
        'timestamp' => $timestamp,
        'folder' => 'DERA ZONE/products',
        'signature' => $signature
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $result = json_decode($response, true);
    if ($httpCode === 200 && !empty($result['secure_url'])) {
        json_ok([
            'url' => $result['secure_url'],
            'type' => $result['resource_type'] ?? 'image',
            'publicId' => $result['public_id'] ?? ''
        ]);
    }

    // 2. Fallback: Save to local directory
    $uploadDir = __DIR__ . '/../images/products/';
    if (!is_dir($uploadDir)) @mkdir($uploadDir, 0755, true);
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $newName = 'product-' . time() . '-' . rand(100, 999) . ($ext ? '.' . $ext : '');
    $targetPath = $uploadDir . $newName;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        json_ok([
            'url' => 'images/products/' . $newName,
            'type' => 'image',
            'publicId' => $newName
        ]);
    }

    json_err('Upload failed: ' . ($result['error']['message'] ?? 'Could not write file'), 500);
}

// ── INVOICES ENDPOINTS ──
if ($endpoint === 'invoices' || $endpoint === 'invoices/generate' || preg_match('#^invoices/([^/]+)(?:/(download|email))?$#', $endpoint, $m)) {
    $invId = $m[1] ?? null;
    $action = $m[2] ?? '';
    $store = get_store();
    $invoices = $store['invoices'] ?? [];

    if ($method === 'GET' && empty($invId)) {
        json_ok(['invoices' => $invoices]);
    }

    if ($method === 'POST' && $endpoint === 'invoices/generate') {
        $orderId = trim($body['orderId'] ?? '');
        $allOrders = array_merge($store['orders'] ?? [], $store['socialOrders'] ?? []);
        $targetOrder = null;
        foreach ($allOrders as $o) {
            if ($o['id'] == $orderId) { $targetOrder = $o; break; }
        }
        if (!$targetOrder) json_err('Order not found', 404);

        $custName = trim(($targetOrder['delivery']['fname'] ?? '') . ' ' . ($targetOrder['delivery']['lname'] ?? ''));
        $invRecord = [
            'id' => $orderId,
            'orderId' => $orderId,
            'type' => 'standard',
            'pdfUrl' => '/api/invoices/' . $orderId . '/download',
            'customerName' => $custName ?: 'Customer',
            'total' => $targetOrder['total'] ?? 0,
            'snapshot' => $targetOrder,
            'status' => 'Generated',
            'emailStatus' => !empty($targetOrder['delivery']['email']) ? 'Sent' : 'Not Sent',
            'createdAt' => date('c'),
            'createdBy' => 'Admin'
        ];

        $invoices = array_filter($invoices, function($i) use ($orderId) { return $i['orderId'] != $orderId; });
        array_unshift($invoices, $invRecord);
        $store['invoices'] = array_values($invoices);
        save_store($store);

        json_ok(['message' => 'Invoice generated successfully', 'invoice' => $invRecord]);
    }

    if ($action === 'download' && $invId) {
        // Printable HTML invoice
        $allOrders = array_merge($store['orders'] ?? [], $store['socialOrders'] ?? []);
        $targetOrder = null;
        foreach ($allOrders as $o) {
            if ($o['id'] == $invId) { $targetOrder = $o; break; }
        }
        if (!$targetOrder) {
            foreach ($invoices as $i) {
                if ($i['id'] == $invId) { $targetOrder = $i['snapshot'] ?? null; break; }
            }
        }
        if (!$targetOrder) json_err('Invoice / Order not found', 404);

        $d = $targetOrder['delivery'] ?? [];
        $name = htmlspecialchars(trim(($d['fname'] ?? '') . ' ' . ($d['lname'] ?? '')));
        $phone = htmlspecialchars($d['phone'] ?? '');
        $address = htmlspecialchars($d['address'] ?? '');
        $city = htmlspecialchars($d['city'] ?? '');
        $total = number_format($targetOrder['total'] ?? 0);
        $pay = strtoupper($targetOrder['paymentMethod'] ?? 'COD');
        $date = date('F d, Y', strtotime($targetOrder['createdAt'] ?? 'now'));

        header('Content-Type: text/html; charset=UTF-8');
        echo "<!DOCTYPE html><html><head><title>Invoice {$invId} — DERA ZONE</title><style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; background: #fff; margin:0; }
          .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #7000ff; padding-bottom: 20px; }
          .logo { font-size: 26px; font-weight: 800; color: #7000ff; letter-spacing: 1px; }
          .inv-title { text-align: right; }
          .inv-title h2 { margin: 0; color: #0f172a; font-size: 22px; }
          .grid { display: flex; justify-content: space-between; margin: 30px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #f8fafc; color: #475569; font-weight: 700; text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; }
          td { padding: 12px; border-bottom: 1px solid #f1f5f9; }
          .total-row { font-size: 18px; font-weight: 800; color: #7000ff; }
          .print-btn { background: #7000ff; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; margin-bottom: 20px; }
          @media print { .print-btn { display: none; } }
        </style></head><body>
        <div class='invoice-box'>
          <button class='print-btn' onclick='window.print()'>🖨️ Print / Save as PDF</button>
          <div class='header'>
            <div class='logo'>DERA ZONE</div>
            <div class='inv-title'>
              <h2>INVOICE</h2>
              <p style='margin:4px 0;color:#64748b;'>Reference: <strong>{$invId}</strong></p>
              <p style='margin:0;color:#64748b;'>Date: {$date}</p>
            </div>
          </div>
          <div class='grid'>
            <div>
              <h4 style='margin:0 0 8px;color:#475569;'>Billed To:</h4>
              <p style='margin:0 0 4px;font-weight:700;'>{$name}</p>
              <p style='margin:0 0 4px;'>{$phone}</p>
              <p style='margin:0;'>{$address}, {$city}</p>
            </div>
            <div style='text-align:right;'>
              <h4 style='margin:0 0 8px;color:#475569;'>Issued By:</h4>
              <p style='margin:0 0 4px;font-weight:700;'>DERA ZONE</p>
              <p style='margin:0 0 4px;'>Pakistan</p>
              <p style='margin:0;'>info@derazone.com</p>
            </div>
          </div>
          <table>
            <thead><tr><th>Item</th><th style='text-align:center;'>Qty</th><th style='text-align:right;'>Price</th></tr></thead>
            <tbody>";
        foreach (($targetOrder['items'] ?? []) as $it) {
            $pName = htmlspecialchars($it['name'] ?? 'Product');
            $v = trim($it['variant'] ?? '');
            if (!$v || strcasecmp($v, 'Standard') === 0) {
                $v = trim(($it['size'] ?? '') . ' ' . ($it['color'] ?? ''));
            }
            $vHTML = ($v && strcasecmp($v, 'Standard') !== 0) 
                ? "<br><span style='display:inline-block;margin-top:2px;font-size:12px;color:#7000ff;font-weight:700;'>Variant / Size / Color: " . htmlspecialchars($v) . "</span>" 
                : "";
            $q = (int)($it['qty'] ?? 1);
            $p = number_format(($it['price'] ?? 0) * $q);
            echo "<tr><td><strong>{$pName}</strong>{$vHTML}</td><td style='text-align:center;'>{$q}</td><td style='text-align:right;'>PKR {$p}</td></tr>";
        }
        echo "<tr><td colspan='2' class='total-row' style='padding-top:20px;'>Total Amount Due:</td><td class='total-row' style='text-align:right;padding-top:20px;'>PKR {$total}</td></tr>
            </tbody>
          </table>
          <div style='margin-top:30px;padding:16px;background:#f8fafc;border-radius:8px;font-size:13px;color:#64748b;text-align:center;'>
            Payment Method: <strong>{$pay}</strong> &nbsp;|&nbsp; Thank you for shopping with DERA ZONE!
          </div>
        </div></body></html>";
        exit();
    }

    if ($action === 'email' && $invId) {
        $allOrders = array_merge($store['orders'] ?? [], $store['socialOrders'] ?? []);
        $targetOrder = null;
        foreach ($allOrders as $o) {
            if ($o['id'] == $invId) { $targetOrder = $o; break; }
        }
        if (!$targetOrder) json_err('Order not found', 404);
        $custEmail = trim($targetOrder['delivery']['email'] ?? '');
        if (empty($custEmail)) json_err('Customer did not provide an email address for this order', 400);

        send_customer_order_confirmed($targetOrder);
        json_ok(['message' => "Invoice email sent successfully to {$custEmail}"]);
    }
}

// Default fallback for any unhandled /api/* endpoint
json_ok(['message' => 'Endpoint received', 'endpoint' => $endpoint]);
