<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

header("Content-Type: application/json; charset=UTF-8");

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

// Required fields check
if (empty($data->username) || empty($data->email) || empty($data->password) || empty($data->full_name) || empty($data->contact_number)) {
    http_response_code(400);
    echo json_encode(["message" => "Unable to register user. Data is incomplete."]);
    exit();
}

// Username validation (detailed error)
if (!preg_match('/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/', $data->username)) {
    http_response_code(400);
    echo json_encode([
        "message" => "Invalid username. Username must meet all the following conditions:",
        "rules" => [
            "At least 8 characters long",
            "Include at least 1 uppercase letter (A-Z)",
            "Include at least 1 lowercase letter (a-z)",
            "Include at least 1 number (0-9)",
            "Include at least 1 special character (@$!%*?&)"
        ]
    ]);
    exit();
}

// Email validation
if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid email format."]);
    exit();
}

// Contact number validation (10 digits)
if (!preg_match('/^[0-9]{10}$/', $data->contact_number)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid contact number. Must be 10 digits."]);
    exit();
}

// Password validation
if (strlen($data->password) < 8) {
    http_response_code(400);
    echo json_encode(["message" => "Password must be at least 8 characters long."]);
    exit();
}

// Hash password
$hashedPassword = password_hash($data->password, PASSWORD_BCRYPT);

// Default role and status for all users
$role = 'user';
$status = 'pending';

// Insert new user
try {
    $query = "INSERT INTO users (username, email, password, full_name, contact_number, role, status) 
              VALUES (:username, :email, :password, :full_name, :contact_number, :role, :status)";
    $stmt = $db->prepare($query);
    $stmt->execute([
        ':username' => $data->username,
        ':email' => $data->email,
        ':password' => $hashedPassword,
        ':full_name' => $data->full_name,
        ':contact_number' => $data->contact_number,
        ':role' => $role,
        ':status' => $status
    ]);

    http_response_code(201);
    echo json_encode([
        "message" => "Registration successful! Please wait for admin approval before you can login.",
        "status" => $status,
        "role" => $role,
        "user_id" => $db->lastInsertId()
    ]);
} catch (PDOException $e) {
    // Handle duplicate entries
    if ($e->getCode() == 23000) {
        http_response_code(400);
        echo json_encode(["message" => "User with this email or username already exists."]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Unable to register user.", "error" => $e->getMessage()]);
    }
}
?>
