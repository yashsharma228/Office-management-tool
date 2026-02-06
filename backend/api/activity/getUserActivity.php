<?php
include_once "../../config/cors.php";
include_once "../../config/database.php";
header("Content-Type: application/json");

error_reporting(E_ALL);
ini_set('display_errors', 1);

$database = new Database();
$conn = $database->getConnection();


if (!isset($_GET['userId'])) {
    http_response_code(400);
    echo json_encode(["error" => "userId is required"]);
    exit;
}

$userId = intval($_GET['userId']);

try {
    // Fetch recent activities in last 24 hours
    $query = "SELECT id, title, type, created_at 
FROM activities 
WHERE user_id = :userId 
  AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY created_at DESC
";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(":userId", $userId, PDO::PARAM_INT);
    $stmt->execute();

    $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($activities);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
