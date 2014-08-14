<?php
	require_once("../inc/class.phpmailer.php");
	
	$name = $_POST["name"];
	$email = $_POST["email"];
	$contact = $_POST["contact"];
	

    $sender = ($email != "" ? $email : "info@infradesign.com.my");
    $subject = "Interested Client Contact Info";
    $body  = "<b>INTERESTED CLIENT CONTACT INFO</b><br/><br/>";
    $body .= "<b>Name:</b> {$name}<br/><br/>";
    $body .= "<b>Email:</b> <a href='mailto:{$email}'>{$email}</a><br/><br/>";
    $body .= "<b>Contact:</b> {$contact}<br/>";

    $mailer = new PHPMailer();
    $mailer->IsSMTP();
    $mailer->SMTPDebug = 2;
    $mailer->SMTPAuth = true;
    $mailer->Host = "mail.infradesign.com.my";
    $mailer->Port = 25;
    $mailer->Username = "info@infradesign.com.my";
    $mailer->Password = "arinfradesign";
    $mailer->CharSet = "UTF-8";
    $mailer->SetFrom($sender, $name);
    $mailer->AddReplyTo($sender, $name);
    $mailer->AddAddress("christina@infradesign.com.my", "Christina Leong");
    $mailer->AddAddress("sebastian@infradesign.com.my", "Sebastian Chong");
    $mailer->Subject = $subject;
    $mailer->MsgHTML($body);
    $mailer->Send();
			
	if($mailer->Send())
		print "result=true";
	else
		print "result=false";
?>
