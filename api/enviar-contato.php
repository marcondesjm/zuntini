<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(int $status, string $message): never
{
    http_response_code($status);
    echo json_encode(['message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

function field(string $name): string
{
    $value = $_POST[$name] ?? '';
    return is_string($value) ? trim($value) : '';
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, 'Use o formulário para enviar uma mensagem.');
}

$name = field('nome');
$email = field('email');
$subject = field('assunto');
$message = field('mensagem');
$subjects = [
    'Direito Civil', 'Direito Empresarial', 'Direito do Trabalho',
    'Família e Sucessões', 'Direito Tributário', 'Outro assunto',
];

if (
    $name === '' || strlen($name) > 480 ||
    strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL) ||
    !in_array($subject, $subjects, true) ||
    $message === '' || strlen($message) > 20000 ||
    !preg_match('//u', $name . $message)
) {
    respond(422, 'Confira os campos do formulário e tente novamente.');
}

$host = getenv('SMTP_HOST');
$port = filter_var(getenv('SMTP_PORT') ?: '587', FILTER_VALIDATE_INT, [
    'options' => ['min_range' => 1, 'max_range' => 65535],
]);
$username = getenv('SMTP_USERNAME');
$password = getenv('SMTP_PASSWORD');
$from = getenv('CONTACT_FROM_EMAIL');
$to = getenv('CONTACT_TO_EMAIL');

if (
    !$host || !filter_var($host, FILTER_VALIDATE_DOMAIN, FILTER_FLAG_HOSTNAME) ||
    !in_array($port, [465, 587], true) ||
    !$username || $password === false || $password === '' ||
    !filter_var($from, FILTER_VALIDATE_EMAIL) || !filter_var($to, FILTER_VALIDATE_EMAIL)
) {
    respond(503, 'O envio por e-mail ainda não está disponível.');
}

$protocol = $port === 465 ? 'smtps' : 'smtp';
if (!function_exists('curl_version') || !in_array($protocol, curl_version()['protocols'], true)) {
    respond(503, 'O envio por e-mail está temporariamente indisponível.');
}

$encodedSubject = base64_encode('Contato pelo site: ' . $subject);
$body = "Nome: $name\nE-mail: $email\nAssunto: $subject\n\nMensagem:\n$message";
$body = preg_replace("/\r\n|\r|\n/", "\r\n", $body);
$headers = [
    'Date: ' . date(DATE_RFC2822),
    "From: <$from>",
    "To: <$to>",
    "Reply-To: <$email>",
    "Subject: =?UTF-8?B?$encodedSubject?=",
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
];
$payload = implode("\r\n", $headers) . "\r\n\r\n" . chunk_split(base64_encode($body));

$upload = fopen('php://memory', 'r+');
fwrite($upload, $payload);
rewind($upload);

$request = curl_init("$protocol://$host:$port");
curl_setopt_array($request, [
    CURLOPT_USERNAME => $username,
    CURLOPT_PASSWORD => $password,
    CURLOPT_USE_SSL => CURLUSESSL_ALL,
    CURLOPT_MAIL_FROM => "<$from>",
    CURLOPT_MAIL_RCPT => ["<$to>"],
    CURLOPT_UPLOAD => true,
    CURLOPT_INFILE => $upload,
    CURLOPT_INFILESIZE => strlen($payload),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 4,
    CURLOPT_TIMEOUT => 8,
]);

$result = curl_exec($request);
$status = curl_getinfo($request, CURLINFO_RESPONSE_CODE);
curl_close($request);
fclose($upload);

if ($result === false || $status < 200 || $status >= 300) {
    respond(502, 'Não foi possível enviar a mensagem. Tente novamente em instantes.');
}

respond(200, 'Mensagem enviada com sucesso.');
