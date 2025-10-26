<?php
session_start();
if (!isset($_SESSION['admin'])) {
  header("Location: login.php");
  exit;
}
?>

<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard | ScamPhoneChecker</title>
  <link rel="stylesheet" href="styler.css">
</head>
<body>

  <aside class="sidebar">
    <h2>Admin Panel</h2>
    <ul>
      <li><a href="logout.php">🚪 Log Out</a></li>
      <li><a href="dashboard.html">📊 Dashboard</a></li>
      <li><a href="#">📞 Phone Manager</a></li>
      <li><a href="#">📑 Reports</a></li>
      <li><a href="#">👤 User</a></li>
      <li><a href="#">⚙️ Settings</a></li>
      <li><a href="SCAM/index.html">🏠 Main Page</a></li>
    </ul>
  </aside>

  <main class="content">
    <h1>Control Pannel</h1>
    <div class="cards">
      <div class="card">
        <h3>Total Reports</h3>
        <p id="totalReports">0</p>
      </div>
      <div class="card">
        <h3>scam Date</h3>
        <p id="todayScams">0</p>
      </div>
    </div>

    <h2>Reports Date</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Phone Number</th>
          <th>Types of scam</th>
          <th>Report Date</th>
        </tr>
      </thead>
      <tbody id="reportTable"></tbody>
    </table>
  </main>

  <script src="script.js"></script>
</body>
</html>
