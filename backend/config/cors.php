<?php
// Allow ALL origins
header("Access-Control-Allow-Origin: *");

// Allow common methods
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");

// Allow custom headers
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
