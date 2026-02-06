<?php
include_once '../../config/database.php';
include_once '../../config/cors.php'; // ✅ unified CORS

header("Content-Type: application/json; charset=UTF-8");

$database = new Database();
$db = $database->getConnection();

$query = "SELECT id, username, email, full_name, status, created_at 
          FROM users 
          WHERE status = 'pending' 
          ORDER BY created_at DESC";
$stmt = $db->prepare($query);
$stmt->execute();

if ($stmt->rowCount() > 0) {
    $users_arr = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $users_arr[] = $row;
    }
    http_response_code(200);
    echo json_encode($users_arr);
} else {
    http_response_code(200);
    echo json_encode([]); // ✅ return empty array instead of 404
}
