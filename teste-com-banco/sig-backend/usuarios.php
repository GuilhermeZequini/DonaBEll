<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$servidor = "localhost";
$usuario = "root";
$senha = "root";
$banco = "sig"; // coloque o nome do seu banco

$conn = new mysqli($servidor, $usuario, $senha, $banco);

if ($conn->connect_error) {
    die(json_encode(["erro" => "Falha na conexão: " . $conn->connect_error]));
}

$sql = "SELECT id, nome, email FROM usuarios";
$result = $conn->query($sql);

$usuarios = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $usuarios[] = $row;
    }
}

echo json_encode($usuarios);

$conn->close();
?>
