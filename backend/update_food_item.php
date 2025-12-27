<?php
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $data['id'];
    
    // Check what fields are provided
    // If only toggling visibility
    if (count($data) == 2 && isset($data['hidden'])) {
        $hidden = $data['hidden'] ? 1 : 0;
        $stmt = $conn->prepare("UPDATE food_items SET hidden = ? WHERE id = ?");
        $stmt->bind_param("is", $hidden, $id);
    } else {
        // Full update
        $name = $data['name'];
        $price = $data['price'];
        $category = $data['category'];
        $hidden = isset($data['hidden']) ? ($data['hidden'] ? 1 : 0) : 0;
        $stock = $data['stock'] ?? 0; // Add stock variable
        
        // Check if image update is needed or not
        if (isset($data['image'])) {
            $image = $data['image'];
            $stmt = $conn->prepare("UPDATE food_items SET name=?, price=?, category=?, hidden=?, stock=?, image=? WHERE id=?");
            $stmt->bind_param("sdsiiss", $name, $price, $category, $hidden, $stock, $image, $id);
        } else {
            $stmt = $conn->prepare("UPDATE food_items SET name=?, price=?, category=?, hidden=?, stock=? WHERE id=?");
            $stmt->bind_param("sdsiii", $name, $price, $category, $hidden, $stock, $id);
        }
    }

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Food item updated"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error updating: " . $conn->error]);
    }
}
?>
