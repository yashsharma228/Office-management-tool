<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

// // Set CORS headers
// header("Access-Control-Allow-Origin: http://localhost:3000");
// header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
// header("Access-Control-Allow-Headers: Content-Type, Authorization");
// header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Create uploads directory if it doesn't exist
$uploadDir = '../../uploads/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

switch ($_SERVER['REQUEST_METHOD']) {
    // GET: fetch expenses
    case 'GET':
        $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
        
        if ($user_id) {
            $query = "SELECT * FROM expenses WHERE user_id = :user_id ORDER BY created_at DESC";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":user_id", $user_id);
        } else {
            $query = "SELECT * FROM expenses ORDER BY created_at DESC";
            $stmt = $db->prepare($query);
        }
        
        if ($stmt->execute()) {
            $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $expenses]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to fetch expenses"]);
        }
        break;

    // POST: add new expense
    case 'POST':
        // Get form data
        $user_id = $_POST['user_id'] ?? null;
        $category = $_POST['category'] ?? null;
        $amount = $_POST['amount'] ?? null;
        $date = $_POST['date'] ?? null;
        $description = $_POST['description'] ?? '';
        
        if (!empty($user_id) && !empty($category) && !empty($amount) && !empty($date)) {
            // Handle file upload
            $receiptFileName = null;
            if (isset($_FILES['receipt']) && $_FILES['receipt']['error'] === UPLOAD_ERR_OK) {
                $fileTmpPath = $_FILES['receipt']['tmp_name'];
                $fileName = $_FILES['receipt']['name'];
                $fileSize = $_FILES['receipt']['size'];
                $fileType = $_FILES['receipt']['type'];
                
                // Sanitize file name
                $fileNameCmps = explode(".", $fileName);
                $fileExtension = strtolower(end($fileNameCmps));
                
                // Allow certain file formats
                $allowedfileExtensions = array('jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx');
                
                if (in_array($fileExtension, $allowedfileExtensions)) {
                    // Create unique file name
                    $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
                    $dest_path = $uploadDir . $newFileName;
                    
                    if (move_uploaded_file($fileTmpPath, $dest_path)) {
                        $receiptFileName = $newFileName;
                    }
                }
            }
            
            $query = "INSERT INTO expenses (user_id, category, amount, date, description, receipt, status) 
                      VALUES (:user_id, :category, :amount, :date, :description, :receipt, 'Pending')";
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(":user_id", $user_id);
            $stmt->bindParam(":category", $category);
            $stmt->bindParam(":amount", $amount);
            $stmt->bindParam(":date", $date);
            $stmt->bindParam(":description", $description);
            $stmt->bindParam(":receipt", $receiptFileName);
            
            if ($stmt->execute()) {
                echo json_encode([
                    "success" => true, 
                    "message" => "Expense added successfully", 
                    "expense_id" => $db->lastInsertId()
                ]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to add expense"]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Incomplete data"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Method not allowed"]);
}
?>