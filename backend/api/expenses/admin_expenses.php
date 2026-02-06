<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Set CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// GET: fetch all expenses with user information for admin
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    try {
        // Build the base query with JOIN to get user information
    $query = "SELECT e.*, u.full_name, u.email 
          FROM expenses e 
          LEFT JOIN users u ON e.user_id = u.id";
        
        $params = [];
        
        // Apply filters
        if (isset($_GET['user_id']) && $_GET['user_id'] !== 'all') {
            $query .= " AND e.user_id = :user_id";
            $params[':user_id'] = $_GET['user_id'];
        }
        
        if (isset($_GET['status']) && $_GET['status'] !== 'all') {
            $query .= " AND e.status = :status";
            $params[':status'] = $_GET['status'];
        }
        
        if (isset($_GET['start_date']) && !empty($_GET['start_date'])) {
            $query .= " AND e.date >= :start_date";
            $params[':start_date'] = $_GET['start_date'];
        }
        
        if (isset($_GET['end_date']) && !empty($_GET['end_date'])) {
            $query .= " AND e.date <= :end_date";
            $params[':end_date'] = $_GET['end_date'];
        }
        
        $query .= " ORDER BY e.created_at DESC";
        
        $stmt = $db->prepare($query);
        
        // Bind parameters
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        if ($stmt->execute()) {
            $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode([
                "success" => true, 
                "data" => $expenses,
                "message" => "Expenses fetched successfully"
            ]);
        } else {
            echo json_encode([
                "success" => false, 
                "message" => "Failed to fetch expenses"
            ]);
        }
    } catch (Exception $e) {
        echo json_encode([
            "success" => false, 
            "message" => "Error: " . $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
}
?>