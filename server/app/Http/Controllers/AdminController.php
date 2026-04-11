<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    private function checkAdmin(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        return null;
    }

    // GET /api/admin/stats
    public function stats(Request $request)
    {
        $deny = $this->checkAdmin($request);
        if ($deny) return $deny;

        $totalCustomers  = DB::selectOne('SELECT COUNT(*) as count FROM users WHERE role = "customer"');
        $totalPharmacies = DB::selectOne('SELECT COUNT(*) as count FROM pharmacies');
        $totalOrders     = DB::selectOne('SELECT COUNT(*) as count FROM orders');
        $pendingOrders   = DB::selectOne('SELECT COUNT(*) as count FROM orders WHERE status = "pending"');
        $totalMedicines  = DB::selectOne('SELECT COUNT(*) as count FROM medicines WHERE pharmacy_id IS NOT NULL');
        $totalRevenue    = DB::selectOne('SELECT COALESCE(SUM(total_price), 0) as total FROM orders');

        return response()->json([
            'success' => true,
            'stats'   => [
                'total_customers'  => $totalCustomers->count,
                'total_pharmacies' => $totalPharmacies->count,
                'total_orders'     => $totalOrders->count,
                'pending_orders'   => $pendingOrders->count,
                'total_medicines'  => $totalMedicines->count,
                'total_revenue'    => $totalRevenue->total,
            ]
        ]);
    }

    // GET /api/admin/users?search=&role=&page=
    public function users(Request $request)
    {
        $deny = $this->checkAdmin($request);
        if ($deny) return $deny;

        $search  = $request->query('search', '');
        $role    = $request->query('role', '');
        $page    = max(1, (int) $request->query('page', 1));
        $perPage = 15;
        $offset  = ($page - 1) * $perPage;
        $like    = '%' . $search . '%';

        if ($role) {
            $users = DB::select(
                'SELECT id, name, email, role, email_verified_at, created_at
                 FROM users
                 WHERE (name LIKE ? OR email LIKE ?) AND role = ?
                 ORDER BY created_at DESC
                 LIMIT ? OFFSET ?',
                [$like, $like, $role, $perPage, $offset]
            );
            $total = DB::selectOne(
                'SELECT COUNT(*) as count FROM users WHERE (name LIKE ? OR email LIKE ?) AND role = ?',
                [$like, $like, $role]
            );
        } else {
            $users = DB::select(
                'SELECT id, name, email, role, email_verified_at, created_at
                 FROM users
                 WHERE name LIKE ? OR email LIKE ?
                 ORDER BY created_at DESC
                 LIMIT ? OFFSET ?',
                [$like, $like, $perPage, $offset]
            );
            $total = DB::selectOne(
                'SELECT COUNT(*) as count FROM users WHERE name LIKE ? OR email LIKE ?',
                [$like, $like]
            );
        }

        return response()->json([
            'success'  => true,
            'users'    => $users,
            'total'    => $total->count,
            'page'     => $page,
            'per_page' => $perPage,
        ]);
    }

    // GET /api/admin/pharmacies?search=&page=
    public function pharmacies(Request $request)
    {
        $deny = $this->checkAdmin($request);
        if ($deny) return $deny;

        $search  = $request->query('search', '');
        $page    = max(1, (int) $request->query('page', 1));
        $perPage = 15;
        $offset  = ($page - 1) * $perPage;
        $like    = '%' . $search . '%';

        $pharmacies = DB::select(
            'SELECT p.*, u.name as owner_name, u.email as owner_email,
                    COUNT(m.id) as medicine_count
             FROM pharmacies p
             JOIN users u ON p.user_id = u.id
             LEFT JOIN medicines m ON m.pharmacy_id = p.id
             WHERE p.pharmacy_name LIKE ? OR p.location LIKE ? OR u.name LIKE ?
             GROUP BY p.id, p.user_id, p.pharmacy_name, p.location,
                      p.division, p.city, p.area, p.phone,
                      p.created_at, p.updated_at, u.name, u.email
             ORDER BY p.created_at DESC
             LIMIT ? OFFSET ?',
            [$like, $like, $like, $perPage, $offset]
        );

        $total = DB::selectOne(
            'SELECT COUNT(*) as count
             FROM pharmacies p
             JOIN users u ON p.user_id = u.id
             WHERE p.pharmacy_name LIKE ? OR p.location LIKE ? OR u.name LIKE ?',
            [$like, $like, $like]
        );

        return response()->json([
            'success'    => true,
            'pharmacies' => $pharmacies,
            'total'      => $total->count,
            'page'       => $page,
            'per_page'   => $perPage,
        ]);
    }

    // GET /api/admin/orders?search=&status=&page=
    public function orders(Request $request)
    {
        $deny = $this->checkAdmin($request);
        if ($deny) return $deny;

        $search  = $request->query('search', '');
        $status  = $request->query('status', '');
        $page    = max(1, (int) $request->query('page', 1));
        $perPage = 15;
        $offset  = ($page - 1) * $perPage;
        $like    = '%' . $search . '%';

        if ($status) {
            $orders = DB::select(
                "SELECT o.id, o.status, o.payment_type, o.payment_status,
                        o.delivery_type, o.total_price, o.created_at,
                        u.name as customer_name, u.email as customer_email,
                        p.pharmacy_name,
                        GROUP_CONCAT(m.name SEPARATOR ', ') as medicine_names
                 FROM orders o
                 JOIN users u ON o.user_id = u.id
                 JOIN pharmacies p ON o.pharmacy_id = p.id
                 LEFT JOIN order_items oi ON o.id = oi.order_id
                 LEFT JOIN medicines m ON oi.medicine_id = m.id
                 WHERE (u.name LIKE ? OR p.pharmacy_name LIKE ?) AND o.status = ?
                 GROUP BY o.id, o.status, o.payment_type, o.payment_status,
                          o.delivery_type, o.total_price, o.created_at,
                          u.name, u.email, p.pharmacy_name
                 ORDER BY o.created_at DESC
                 LIMIT ? OFFSET ?",
                [$like, $like, $status, $perPage, $offset]
            );

            $total = DB::selectOne(
                'SELECT COUNT(DISTINCT o.id) as count
                 FROM orders o
                 JOIN users u ON o.user_id = u.id
                 JOIN pharmacies p ON o.pharmacy_id = p.id
                 WHERE (u.name LIKE ? OR p.pharmacy_name LIKE ?) AND o.status = ?',
                [$like, $like, $status]
            );
        } else {
            $orders = DB::select(
                "SELECT o.id, o.status, o.payment_type, o.payment_status,
                        o.delivery_type, o.total_price, o.created_at,
                        u.name as customer_name, u.email as customer_email,
                        p.pharmacy_name,
                        GROUP_CONCAT(m.name SEPARATOR ', ') as medicine_names
                 FROM orders o
                 JOIN users u ON o.user_id = u.id
                 JOIN pharmacies p ON o.pharmacy_id = p.id
                 LEFT JOIN order_items oi ON o.id = oi.order_id
                 LEFT JOIN medicines m ON oi.medicine_id = m.id
                 WHERE u.name LIKE ? OR p.pharmacy_name LIKE ?
                 GROUP BY o.id, o.status, o.payment_type, o.payment_status,
                          o.delivery_type, o.total_price, o.created_at,
                          u.name, u.email, p.pharmacy_name
                 ORDER BY o.created_at DESC
                 LIMIT ? OFFSET ?",
                [$like, $like, $perPage, $offset]
            );

            $total = DB::selectOne(
                'SELECT COUNT(DISTINCT o.id) as count
                 FROM orders o
                 JOIN users u ON o.user_id = u.id
                 JOIN pharmacies p ON o.pharmacy_id = p.id
                 WHERE u.name LIKE ? OR p.pharmacy_name LIKE ?',
                [$like, $like]
            );
        }

        return response()->json([
            'success'  => true,
            'orders'   => $orders,
            'total'    => $total->count,
            'page'     => $page,
            'per_page' => $perPage,
        ]);
    }

    // DELETE /api/admin/users/{id}
    public function deleteUser(Request $request, $id)
    {
        $deny = $this->checkAdmin($request);
        if ($deny) return $deny;

        if ($request->user()->id == $id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own account'
            ], 400);
        }

        $user = DB::selectOne('SELECT id, role FROM users WHERE id = ?', [$id]);

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        DB::delete('DELETE FROM users WHERE id = ?', [$id]);

        return response()->json(['success' => true, 'message' => 'User deleted successfully']);
    }

    // DELETE /api/admin/pharmacies/{id}
    public function deletePharmacy(Request $request, $id)
    {
        $deny = $this->checkAdmin($request);
        if ($deny) return $deny;

        $pharmacy = DB::selectOne('SELECT id FROM pharmacies WHERE id = ?', [$id]);

        if (!$pharmacy) {
            return response()->json(['success' => false, 'message' => 'Pharmacy not found'], 404);
        }

        // Delete medicines first, then pharmacy
        DB::delete('DELETE FROM medicines WHERE pharmacy_id = ?', [$id]);
        DB::delete('DELETE FROM pharmacies WHERE id = ?', [$id]);

        return response()->json(['success' => true, 'message' => 'Pharmacy deleted successfully']);
    }
}