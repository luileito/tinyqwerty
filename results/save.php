<?php
// This script saves logging info about keyboard usage.

define('LOGDIR', dirname(__FILE__)."/results");
define('LOGEXT', ".json");

// This function notifies the prototype interface about the saving result.
function response($err, $msg) {
  return json_encode(array(
    "err" => $err,
    "msg" => $msg
  ));
}

// This function generates a log file ID based on the phrase used as input stimuli.
// In Mackenzie's dataset, 5 is the minimum hash length that avoid collisions.
function fid($phrase, $hashlen = 5) {
  return substr(md5($phrase), 0, $hashlen);
}

// Keyboard condition is inferred from the directory where we ran each experiment.
$sys = basename(dirname($_SERVER['HTTP_REFERER']));
// User ID, input phrase and keyboard size come as URL parameters.
$uid = $_POST['uid'];
$txt = $_POST['txt'];
$siz = $_POST['siz'];
// Log event data come as JSON string.
$evt = json_decode($_POST['evt']);

// Allocate user dir, if not set yet.
$userdir = LOGDIR . '/' . sprintf("%02d", $uid);
if (!file_exists($userdir)) {
  $old_umask = umask(0);
  if (!mkdir($userdir, 0775, true)) {
    $err = 1;
    $msg = sprintf("Cannot create user dir (%s).", $userdir);
    die(response($err, $msg));
  }
  umask($old_umask);
}
// Then allocate log file.
$fprefix = $userdir . "/" . $sys . "-" . $siz . "-" . fid($txt);
$fpcount = 0;
$logfile = $fprefix . $fpcount . LOGEXT;
while (file_exists($logfile)) {
  $fpcount++;
  $logfile = $fprefix . $fpcount . LOGEXT;
}

$logdata = json_encode(array(
  "date"   => date("r"),
  "time"   => time(),
  "userid" => $uid,
  "system" => $sys,
  "kwidth" => (int) $siz,
  "phrase" => $txt,
  "events" => $evt,
));

if (file_put_contents($logfile, $logdata)) {
  $err = 0;
  $msg = "Data successfully saved.";
} else {
  $err = 1;
  $msg = "Cannot save data :(";
}

echo response($err, $msg);
?>
