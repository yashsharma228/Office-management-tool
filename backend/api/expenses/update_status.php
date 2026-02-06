<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Set CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// POST: update expense status
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->expense_id) && !empty($data->status)) {
        $allowed_statuses = ['Pending', 'Done','Approved', 'Rejected'];
        
        if (in_array($data->status, $allowed_statuses)) {
            $query = "UPDATE expenses SET status = :status, updated_at = NOW() WHERE id = :expense_id";
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(":status", $data->status);
            $stmt->bindParam(":expense_id", $data->expense_id);
            
            if ($stmt->execute()) {
                echo json_encode([
                    "success" => true, 
                    "message" => "Expense status updated successfully"
                ]);
            } else {
                echo json_encode([
                    "success" => false, 
                    "message" => "Failed to update expense status"
                ]);
            }
        } else {
            echo json_encode([
                "success" => false, 
                "message" => "Invalid status value"
            ]);
        }
    } else {
        echo json_encode([
            "success" => false, 
            "message" => "Expense ID and status are required"
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
}
?>