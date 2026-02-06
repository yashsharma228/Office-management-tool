<?php
include_once '../../config/database.php';
include_once '../../config/cors.php';

header("Content-Type: application/json");

// ✅ DB connection
$database = new Database();
$db = $database->getConnection();

// ✅ Determine action
$action = isset($_GET['action']) ? $_GET['action'] : null;

try {
    switch ($action) {
        /* ---------------- CREATE TASK ---------------- */
        case "create":
            $title = $_POST['title'] ?? null;
            $description = $_POST['description'] ?? null;
            $priority = $_POST['priority'] ?? "Medium";
            $status = $_POST['status'] ?? "Not Started";
            $startDate = $_POST['startDate'] ?? null;
            $dueDate = $_POST['dueDate'] ?? null;
            $assignee_id = $_POST['assignee_id'] ?? null;
            $created_by = $_POST['created_by'] ?? null;
            $team = isset($_POST['team']) ? json_decode($_POST['team'], true) : [];

            if (!$title || !$assignee_id || !$startDate || !$dueDate) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Incomplete task data"]);
                exit;
            }

            // ✅ File Upload
            $attachmentPath = null;
            if (!empty($_FILES['attachment']['name'])) {
                $uploadDir = "../../uploads/tasks/";
                if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);

                $fileName = time() . "_" . basename($_FILES["attachment"]["name"]);
                $targetFilePath = $uploadDir . $fileName;

                if (move_uploaded_file($_FILES["attachment"]["tmp_name"], $targetFilePath)) {
                    $attachmentPath = $fileName;
                }
            }

            // ✅ Encode team members as JSON
            $team = isset($_POST['team']) ? json_decode($_POST['team'], true) : [];

            $teamJson = json_encode($team);

            $query = "INSERT INTO tasks 
                (title, description, priority, status, start_date, due_date, assignee_id, created_by, attachment, team_members, created_at) 
                VALUES (:title, :description, :priority, :status, :start_date, :due_date, :assignee_id, :created_by, :attachment, :team_members, NOW())";
            $stmt = $db->prepare($query);

            $stmt->bindParam(":title", $title);
            $stmt->bindParam(":description", $description);
            $stmt->bindParam(":priority", $priority);
            $stmt->bindParam(":status", $status);
            $stmt->bindParam(":start_date", $startDate);
            $stmt->bindParam(":due_date", $dueDate);
            $stmt->bindParam(":assignee_id", $assignee_id);
            $stmt->bindParam(":created_by", $created_by);
            $stmt->bindParam(":attachment", $attachmentPath);
            $stmt->bindParam(":team_members", $teamJson);

            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Task created successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => "Task creation failed"]);
            }
            break;

        /* ---------------- GET ALL TASKS ---------------- */
        case "getAll":
            $query = "SELECT t.*, u.full_name AS assigneeName 
                      FROM tasks t 
                      LEFT JOIN users u ON t.assignee_id = u.id 
                      ORDER BY t.created_at DESC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($tasks as &$task) {
                $task['team_members'] = $task['team_members'] ? json_decode($task['team_members'], true) : [];

                // ✅ Generate correct attachment URL
                if (!empty($task['attachment'])) {
                    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
                    $host = $_SERVER['HTTP_HOST'];
                    $baseUrl = $protocol . "://" . $host . "/backend/";

                    $task['attachment_url'] = $baseUrl . "uploads/tasks/" . $task['attachment'];
                    $task['attachment_name'] = $task['attachment'];

                    $fileExtension = pathinfo($task['attachment'], PATHINFO_EXTENSION);
                    $task['file_type'] = strtolower($fileExtension);
                }
            }

            echo json_encode(["tasks" => $tasks]);
            break;

        /* ---------------- GET TASK STATS ---------------- */
        case "getStats":
            $query = "
                SELECT 
                    COUNT(*) as totalTasks,
                    SUM(CASE WHEN status = 'Started' THEN 1 ELSE 0 END) as inProgress,
                    SUM(CASE WHEN status = 'Done' THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as overdue
                FROM tasks";
            $stmt = $db->query($query);
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($stats);
            break;

        /* ---------------- GET USER TASKS ---------------- */
        case "getUserTasks":
            $userId = isset($_GET['userId']) ? intval($_GET['userId']) : null;
            if ($userId) {
                $query = "SELECT * FROM tasks WHERE assignee_id = :userId OR JSON_CONTAINS(team_members, :userJson)";
                $stmt = $db->prepare($query);
                $userJson = json_encode($userId);
                $stmt->bindParam(":userId", $userId);
                $stmt->bindParam(":userJson", $userJson);
            } else {
                $query = "SELECT * FROM tasks";
                $stmt = $db->prepare($query);
            }
            $stmt->execute();
            $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($tasks as &$task) {
                $task['team_members'] = $task['team_members'] ? json_decode($task['team_members'], true) : [];

                // ✅ Generate correct attachment URL (same as getAll)
                if (!empty($task['attachment'])) {
                    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
                    $host = $_SERVER['HTTP_HOST'];
                    $baseUrl = $protocol . "://" . $host . "/backend/";

                    $task['attachment_url'] = $baseUrl . "uploads/tasks/" . $task['attachment'];
                    $task['attachment_name'] = $task['attachment'];

                    $fileExtension = pathinfo($task['attachment'], PATHINFO_EXTENSION);
                    $task['file_type'] = strtolower($fileExtension);
                }
            }

            echo json_encode($tasks);
            break;

        /* ---------------- UPDATE TASK ---------------- */
        case "update":
            $data = json_decode(file_get_contents("php://input"), true);
            if (!$data || !isset($data['id'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Task ID required"]);
                exit;
            }

            $task_id = $data['id'];
            $fields = [];
            $params = [":id" => $task_id];

            foreach (['title','description','status','priority','start_date','due_date'] as $field) {
                if (isset($data[$field])) {
                    $fields[] = "$field = :$field";
                    $params[":$field"] = $data[$field];
                }
            }

            if (isset($data['assignee_id'])) {
                if ($data['assignee_id'] === null || $data['assignee_id'] === '') {
                    $fields[] = "assignee_id = NULL";
                } else {
                    $fields[] = "assignee_id = :assignee_id";
                    $params[":assignee_id"] = $data['assignee_id'];
                }
            }

            if (isset($data['team_members'])) {
                $fields[] = "team_members = :team_members";
                $params[":team_members"] = json_encode($data['team_members']);
            }

            if (empty($fields)) {
                echo json_encode(["success" => false, "message" => "No fields to update"]);
                exit;
            }

            $query = "UPDATE tasks SET " . implode(", ", $fields) . " WHERE id = :id";
            $stmt = $db->prepare($query);

            if ($stmt->execute($params)) {
                echo json_encode(["success" => true, "message" => "Task updated successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => "Update failed"]);
            }
            break;

        /* ---------------- UPDATE TASK STATUS ---------------- */
        case "updateStatus":
            $data = json_decode(file_get_contents("php://input"), true);
            if (!isset($data['taskId']) || !isset($data['status'])) {
                echo json_encode(["success" => false, "message" => "Missing parameters"]);
                exit;
            }

            $taskId = intval($data['taskId']);
            $newStatus = htmlspecialchars(strip_tags($data['status']));

            $query = "UPDATE tasks SET status = :status WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":status", $newStatus);
            $stmt->bindParam(":id", $taskId);

            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Status updated"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to update status"]);
            }
            break;

        /* ---------------- INVALID ACTION ---------------- */
        default:
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid action"]);
            break;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
