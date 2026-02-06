<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->user_id)) {
    $query = "UPDATE users SET status = 'approved' WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->bindParam(1, $data->user_id);
    
    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(array("message" => "User approved successfully."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to approve user."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to approve user. User ID is required."));
}
?>