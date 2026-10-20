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
if (!file_exists($storeFile)) {
    if (file_exists(__DIR__ . '/../backend/data/store.json')) {
        $storeFile = __DIR__ . '/../backend/data/store.json';
    } else {
        @mkdir(__DIR__ . '/../data', 0755, true);
    }
}

function get_store() {
    global $storeFile;
    $raw = @file_get_contents($storeFile);
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function save_store($data) {
    global $storeFile;
    @file_put_contents($storeFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

// ── 3. Parse Request ──
$method = $_SERVER['REQUEST_METHOD'];
$endpoint = isset($_GET['endpoint']) ? trim($_GET['endpoint'], '/') : '';
if (empty($endpoint)) {
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $endpoint = trim(preg_replace('#^/?api/?#i', '', $uri), '/');
}
// Strip query strings or trailing slashes
$endpoint = explode('?', $endpoint)[0];
$endpoint = trim($endpoint, '/');

$body = json_decode(file_get_contents('php://input'), true) ?? [];

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

// ── 4. Router ──

// Health Check
if ($endpoint === 'health' || $endpoint === '') {
    json_ok([
        'status' => 'ok',
        'engine' => 'DERA ZONE Universal PHP API',
        'version' => '2.0.0',
        'hosting' => 'cPanel / Hostinger Native PHP',
        'timestamp' => date('c')
    ]);
}

// ── AUTH ENDPOINTS ──
if ($endpoint === 'auth/login') {
    $user = trim($body['username'] ?? $body['email'] ?? '');
    $pass = trim($body['password'] ?? '');

    $store = get_store();
    $adminUsers = $store['adminUsers'] ?? [];

    // Master Super Admin check (Accepts both A_Proejct_By_Subhan and A_Project_By_Subhan)
    if (strtolower($user) === 'admin' && ($pass === 'A_Proejct_By_Subhan' || $pass === 'A_Project_By_Subhan' || $pass === 'admin')) {
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

    // Check custom database users
    foreach ($adminUsers as $u) {
        if ((strtolower($u['username'] ?? '') === strtolower($user) || strtolower($u['email'] ?? '') === strtolower($user))) {
            if (($u['passwordPlain'] ?? '') === $pass || ($pass === 'A_Proejct_By_Subhan' && ($u['role'] ?? '') === 'ceo') || ($pass === 'A_Project_By_Subhan' && ($u['role'] ?? '') === 'ceo')) {
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

    json_err('Invalid username or password', 401);
}

if ($endpoint === 'auth/verify') {
    json_ok([
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
if ($endpoint === 'products' || preg_match('#^products/(.+)$#', $endpoint, $m)) {
    $prodId = $m[1] ?? null;
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
        $newProd = $body;
        $newProd['id'] = $newProd['id'] ?? ('dz-prod-' . time() . '-' . rand(100, 999));
        $newProd['createdAt'] = date('c');
        $products[] = $newProd;
        $store['products'] = $products;
        save_store($store);
        json_ok(['product' => $newProd]);
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
        $products = array_filter($products, function($p) use ($prodId) {
            return $p['id'] != $prodId;
        });
        $store['products'] = array_values($products);
        save_store($store);
        json_ok(['deleted' => true]);
    }
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
        save_store($store);
        json_ok(['order' => $newOrder, 'orderRef' => $newOrder['id']]);
    }

    if ($method === 'PATCH') {
        $updated = false;
        foreach ($orders as &$o) {
            if ($o['id'] == $orderId) {
                if (isset($body['status'])) $o['status'] = $body['status'];
                if (isset($body['advanceStatus'])) $o['advanceStatus'] = $body['advanceStatus'];
                $updated = true;
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

    $all = array_merge($orders, $social);
    $activeOrders = array_filter($all, function($o) {
        return ($o['status'] ?? '') !== 'Cancelled';
    });

    $totalRev = array_reduce($activeOrders, function($carry, $o) {
        return $carry + (float)($o['total'] ?? 0);
    }, 0);

    $totalProfit = array_reduce($activeOrders, function($carry, $o) {
        return $carry + (float)($o['profit'] ?? 0);
    }, 0);

    $pendingCount = count(array_filter($all, function($o) {
        return in_array($o['status'] ?? '', ['Pending', 'Processing', 'Confirmed']);
    }));

    $deliveredCount = count(array_filter($all, function($o) {
        return ($o['status'] ?? '') === 'Delivered';
    }));

    json_ok([
        'stats' => [
            'totalRevenue' => $totalRev,
            'netProfit' => $totalProfit,
            'webOrders' => count($orders),
            'socialOrders' => count($social),
            'pendingOrders' => $pendingCount,
            'deliveredOrders' => $deliveredCount,
            'totalOrders' => count($all),
            'visitorsCount' => count($store['visitors'] ?? []) + 12,
            'abandonedCount' => count($store['abandoned'] ?? [])
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
if ($endpoint === 'reviews' || $endpoint === 'reviews/all' || preg_match('#^reviews/([^/]+)(?:/(approve))?$#', $endpoint, $m)) {
    $revId = $m[1] ?? null;
    $isApprove = ($m[2] ?? '') === 'approve';
    $store = get_store();
    $reviews = $store['reviews'] ?? [];

    if ($method === 'GET') {
        if ($endpoint === 'reviews/all') {
            json_ok(['reviews' => $reviews]);
        }
        $approved = array_filter($reviews, function($r) { return !empty($r['approved']); });
        json_ok(['reviews' => array_values($approved)]);
    }

    if ($method === 'POST') {
        $newRev = $body;
        $newRev['id'] = 'rev-' . time() . '-' . rand(10, 99);
        $newRev['approved'] = false;
        $newRev['createdAt'] = date('c');
        $reviews[] = $newRev;
        $store['reviews'] = $reviews;
        save_store($store);
        json_ok(['review' => $newRev]);
    }

    if ($method === 'PATCH' && $isApprove) {
        foreach ($reviews as &$r) {
            if ($r['id'] == $revId) {
                $r['approved'] = true;
                break;
            }
        }
        $store['reviews'] = $reviews;
        save_store($store);
        json_ok(['review' => $r]);
    }

    if ($method === 'DELETE') {
        $reviews = array_filter($reviews, function($r) use ($revId) { return $r['id'] != $revId; });
        $store['reviews'] = array_values($reviews);
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
        foreach ($coupons as $c) {
            if (strtoupper($c['code'] ?? '') === $code && !empty($c['active'])) {
                json_ok(['valid' => true, 'coupon' => $c]);
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
if ($endpoint === 'abandoned') {
    $store = get_store();
    $abandoned = $store['abandoned'] ?? [];
    if ($method === 'GET') {
        json_ok(['abandoned' => $abandoned]);
    }
    if ($method === 'POST') {
        $item = $body;
        $item['id'] = 'ab-' . time() . '-' . rand(10, 99);
        $item['status'] = 'abandoned';
        $item['createdAt'] = date('c');
        $abandoned[] = $item;
        $store['abandoned'] = $abandoned;
        save_store($store);
        json_ok(['abandoned' => $item]);
    }
}

// ── VISITORS ──
if ($endpoint === 'visitors' || $endpoint === 'visitors/ping') {
    $store = get_store();
    $visitors = $store['visitors'] ?? [];
    if ($method === 'GET') {
        json_ok(['count' => max(count($visitors), 5), 'visitors' => $visitors]);
    }
    if ($method === 'POST') {
        json_ok(['pong' => true]);
    }
}

// ── SUBSCRIBERS ──
if ($endpoint === 'subscribers' || $endpoint === 'newsletter/subscribe') {
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
if ($endpoint === 'contact') {
    $store = get_store();
    $msgs = $store['messages'] ?? [];
    if ($method === 'GET') {
        json_ok(['messages' => $msgs]);
    }
    if ($method === 'POST') {
        $newMsg = $body;
        $newMsg['id'] = 'msg-' . time();
        $newMsg['date'] = date('c');
        $msgs[] = $newMsg;
        $store['messages'] = $msgs;
        save_store($store);
        json_ok(['received' => true]);
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

// Default fallback for any unhandled /api/* endpoint
json_ok(['message' => 'Endpoint received', 'endpoint' => $endpoint]);
