<?php
include_once '../../config/cors.php';
header('Content-Type: application/json');

require_once('../../config/database.php');

try {
    $db = new Database();
    $conn = $db->getConnection();

    $id = $_GET['id'] ?? null;
    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'User ID missing']);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM users WHERE id = :id");
    $stmt->bindParam(':id', $id);
    $stmt->execute();

    echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
