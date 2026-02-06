<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->user_id)) {
    $query = "DELETE FROM users WHERE id = ? AND status = 'pending'";
    $stmt = $db->prepare($query);
    $stmt->bindParam(1, $data->user_id);
    
    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(array("message" => "User rejected and removed successfully."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to reject user."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to reject user. User ID is required."));
}
?>