<?php
include_once "../../config/cors.php";
include_once "../../config/database.php";
header("Content-Type: application/json; charset=UTF-8");
error_reporting(E_ALL);
ini_set('display_errors', 1);

$database = new Database();
$conn = $database->getConnection();

// Get request method
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    // ADD NOTE
    if ($method === "POST" && $action === "add") {
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->userId) || !isset($data->title) || !isset($data->content)) {
            echo json_encode(["error" => "userId, title and content are required"]);
            exit;
        }

        $query = "INSERT INTO notes (user_id, title, content, created_at) 
                  VALUES (:userId, :title, :content, NOW())";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":userId", $data->userId, PDO::PARAM_INT);
        $stmt->bindParam(":title", $data->title, PDO::PARAM_STR);
        $stmt->bindParam(":content", $data->content, PDO::PARAM_STR);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "id" => $conn->lastInsertId()]);
        } else {
            echo json_encode(["error" => "Failed to add note"]);
        }
    }

    // GET NOTES
    elseif ($method === "GET" && $action === "get") {
        if (!isset($_GET['userId'])) {
            echo json_encode(["error" => "userId is required"]);
            exit;
        }

        $userId = intval($_GET['userId']);
        $stmt = $conn->prepare("SELECT id, title, content, created_at 
                                FROM notes WHERE user_id = :userId 
                                ORDER BY created_at DESC");
        $stmt->bindParam(":userId", $userId, PDO::PARAM_INT);
        $stmt->execute();
        $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($notes);
    }

    // UPDATE NOTE
    elseif ($method === "PUT" && $action === "update") {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['id']) || !isset($data['title']) || !isset($data['content'])) {
            echo json_encode(["error" => "Missing id, title or content"]);
            exit;
        }

        $stmt = $conn->prepare("UPDATE notes 
                                SET title = :title, content = :content 
                                WHERE id = :id");
        $stmt->bindParam(':title', $data['title'], PDO::PARAM_STR);
        $stmt->bindParam(':content', $data['content'], PDO::PARAM_STR);
        $stmt->bindParam(':id', $data['id'], PDO::PARAM_INT);

        if ($stmt->execute()) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "error" => $stmt->errorInfo()[2]]);
        }
    }

    // DELETE NOTE
    elseif ($method === "DELETE" && $action === "delete") {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['id'])) {
            echo json_encode(["error" => "Missing id"]);
            exit;
        }

        $stmt = $conn->prepare("DELETE FROM notes WHERE id = ?");
        if ($stmt->execute([$data['id']])) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "error" => $stmt->errorInfo()[2]]);
        }
    }

    // INVALID REQUEST
    else {
        echo json_encode(["error" => "Invalid request"]);
    }

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
