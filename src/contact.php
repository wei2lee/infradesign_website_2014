<?php
	require_once("inc/class.phpmailer.php");
	
	$name = $_POST["name"];
	$company = $_POST["company"];
	$contact = $_POST["contact"];
	$email = $_POST["email"];
	$date = $_POST["date"];
	$budget = $_POST["budget"];
	$message = $_POST["message"];
	
	$sender = ($email != "" ? $email : "info@infradesign.com.my");
	$subject = "Contact Info";
	$body  = "<b>CONTACT INFO</b><br/><br/>";
	$body .= "<b>Name:</b> {$name}<br/><br/>";
	$body .= "<b>Company:</b> {$company}<br/><br/>";
	$body .= "<b>Contact:</b> {$contact}<br/><br/>";
	$body .= "<b>Email:</b> <a href='mailto:{$email}'>{$email}</a><br/><br/>";
	$body .= "<b>Start date:</b> {$date}<br/><br/>";
	$body .= "<b>Budget:</b> {$budget}<br/><br/>";
	$body .= "<b>Message:</b> {$message}<br/>";
	
	$mailer = new PHPMailer();
	$mailer->IsSMTP();
	$mailer->SMTPDebug = 2;
	$mailer->SMTPAuth = true;
	$mailer->Host = "mail.infradesign.com.my";
	$mailer->Port = 25;
	$mailer->Username = "site@infradesign.com.my";
	$mailer->Password = "m6z--K5[bU?W";
	$mailer->CharSet = "UTF-8";
	$mailer->SetFrom($sender, $name);
	$mailer->AddReplyTo($sender, $name);
	$mailer->AddAddress("christina@infradesign.com.my", "Christina Leong");
	$mailer->AddAddress("sebastian@infradesign.com.my", "Sebastian Chong");
	$mailer->Subject = $subject;
	$mailer->MsgHTML($body);
	
	if($mailer->Send())
		print "result=true";
	else
		print "result=false";
?>
