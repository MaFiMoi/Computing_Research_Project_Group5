
<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();
include "db_connect.php";

if (isset($_POST['login'])) {
  $user = $_POST['username'];
  $pass = md5($_POST['password']); // Mã hoá đơn giản

  $sql = "SELECT * FROM admins WHERE username='$user' AND password='$pass'";
  $result = $conn->query($sql);

  if ($result->num_rows > 0) {
    $_SESSION['admin'] = $user;
    header("Location: dashboard.php");
    exit;
  } else {
    $error = "Sai tài khoản hoặc mật khẩu!";
  }
}
?>

<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login | ScamPhoneChecker</title>
  <link rel="stylesheet" href="styler.css">
</head>
<body class="login-page">
  <div class="login-container">
    <h2>Admin Login</h2>
    <?php if (!empty($error)) echo "<p class='error'>$error</p>"; ?>
    <form method="POST">
      <input type="text" name="username" placeholder="Tên đăng nhập" required>
      <input type="password" name="password" placeholder="Mật khẩu" required>
      <button type="submit" name="login">Đăng nhập</button>
    </form>
  </div>
</body>
</html>
