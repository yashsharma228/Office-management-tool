<?php
// Include CORS configuration first
include_once '../../config/cors.php';

// Include database configuration
include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    
    $query = "SELECT id, username, email, password, full_name, role, status 
              FROM users WHERE email = ?";
    $stmt = $db->prepare($query);
    $stmt->bindParam(1, $data->email);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Check status
        if (isset($row['status'])) {
            if ($row['status'] === 'pending') {
                http_response_code(401);
                echo json_encode(["message" => "Account pending approval."]);
                exit();
            }
            
            if ($row['status'] === 'rejected') {
                http_response_code(401);
                echo json_encode(["message" => "Account has been rejected."]);
                exit();
            }
        }
        
        // ✅ Verify hashed password
        if (password_verify($data->password, $row['password'])) {
            $user_data = [
                "id" => $row['id'],
                "username" => $row['username'],
                "email" => $row['email'],
                "full_name" => $row['full_name'],
                "role" => $row['role'],
                "status" => $row['status']
            ];
            
            http_response_code(200);
            echo json_encode([
                "message" => "Login successful.",
                "user" => $user_data
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["message" => "Invalid credentials."]);
        }
    } else {
        http_response_code(401);
        echo json_encode(["message" => "User not found."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Unable to login. Data is incomplete."]);
}
?>
