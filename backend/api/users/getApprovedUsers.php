<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

// ✅ Only approved users with role = 'user'
$query = "SELECT id, username, email, contact_number, full_name 
          FROM users 
          WHERE status = 'approved' AND role = 'user' 
          ORDER BY created_at DESC";

$stmt = $db->prepare($query);
$stmt->execute();

if ($stmt->rowCount() > 0) {
    $users_arr = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);
        $user_item = array(
            "id" => $id,
            "username" => $username,
            "email" => $email,
            "full_name" => $full_name,
            "contact_number" => $contact_number // ✅ Add contact number to response
        );
        array_push($users_arr, $user_item);
    }
    http_response_code(200);
    echo json_encode($users_arr);
} else {
    http_response_code(404);
    echo json_encode(array("message" => "No approved users found."));
}
?>