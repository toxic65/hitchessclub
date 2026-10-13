<?php
require 'config.php';

function clean($v){ return htmlspecialchars(trim($v ?? ''), ENT_QUOTES, 'UTF-8'); }

$errors = [];
$ok = false;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: join.html');
    exit;
}

$type    = ($_POST['type'] ?? '') === 'contact' ? 'contact' : 'join';
$name    = clean($_POST['name'] ?? '');
$regno   = clean($_POST['regno'] ?? '');
$email   = trim($_POST['email'] ?? '');
$phone   = clean($_POST['phone'] ?? '');
$level   = clean($_POST['level'] ?? '');
$message = clean($_POST['message'] ?? '');

if (strlen($name) < 3) $errors[] = 'Enter your full name.';
if (strlen($regno) < 5) $errors[] = 'Enter your registration number.';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Enter a valid email address.';
if (!in_array($level, ['Beginner','Intermediate','Advanced'], true)) $errors[] = 'Choose your chess level.';
if (strlen($message) < 10) $errors[] = 'Your message must be at least 10 characters.';
$email = clean($email);

if (!$errors) {
    if (DB_NAME !== '') {
        try {
            $pdo = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset=utf8mb4', DB_USER, DB_PASS,
                           [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
            $st = $pdo->prepare('INSERT INTO members (type,name,regno,email,phone,level,message) VALUES (?,?,?,?,?,?,?)');
            $st->execute([$type,$name,$regno,$email,$phone,$level,$message]);
            $ok = true;
        } catch (PDOException $e) {
            $errors[] = 'We could not save your details. Please try again later.';
        }
    } else {
        $dir = __DIR__ . '/data';
        if (!is_dir($dir)) mkdir($dir, 0755, true);
        $fh = fopen($dir . '/submissions.csv', 'a');
        if ($fh) {
            fputcsv($fh, [date('Y-m-d H:i:s'),$type,$name,$regno,$email,$phone,$level,$message]);
            fclose($fh);
            $ok = true;
        } else {
            $errors[] = 'We could not save your details. Please try again later.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= $ok ? 'Thank you' : 'Please check your details' ?> | HIT Chess Club</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>
<header class="site-header"><div class="wrap">
  <a class="brand" href="index.html">&#9822; HIT <span>Chess</span> Club</a>
</div></header>
<section><div class="wrap">
<?php if ($ok): ?>
  <div class="notice ok">
    <h2>Thank you, <?= $name ?>.</h2>
    <p><?= $type === 'join' ? 'We have received your request to join the club.' : 'We have received your message.' ?>
       A committee member will reply to <strong><?= $email ?></strong> soon.</p>
    <p>Level: <?= $level ?></p>
  </div>
<?php else: ?>
  <div class="notice fail">
    <h2>We could not send your form</h2>
    <ul>
      <?php foreach ($errors as $e): ?><li><?= $e ?></li><?php endforeach; ?>
    </ul>
    <p><a href="join.html">Go back and fix these</a></p>
  </div>
<?php endif; ?>
<p style="margin-top:1.5rem"><a class="btn" href="index.html">Back to home</a></p>
</div></section>
</body>
</html>
