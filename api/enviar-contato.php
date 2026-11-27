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

$apiKey = getenv('RESEND_API_KEY');
$from = getenv('CONTACT_FROM_EMAIL');
$to = getenv('CONTACT_TO_EMAIL');

if (!$apiKey || !filter_var($from, FILTER_VALIDATE_EMAIL) || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
    respond(503, 'O envio por e-mail ainda não está disponível.');
}

$payload = json_encode([
    'from' => $from,
    'to' => [$to],
    'reply_to' => $email,
    'subject' => 'Contato pelo site: ' . $subject,
    'text' => "Nome: $name\nE-mail: $email\nAssunto: $subject\n\nMensagem:\n$message",
], JSON_THROW_ON_ERROR);

if (!function_exists('curl_init')) {
    respond(503, 'O envio por e-mail está temporariamente indisponível.');
}

$request = curl_init('https://api.resend.com/emails');
curl_setopt_array($request, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json',
    ],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 3,
    CURLOPT_TIMEOUT => 8,
]);

$result = curl_exec($request);
$status = curl_getinfo($request, CURLINFO_RESPONSE_CODE);
curl_close($request);

if ($result === false || $status < 200 || $status >= 300) {
    respond(502, 'Não foi possível enviar a mensagem. Tente novamente em instantes.');
}

respond(200, 'Mensagem enviada com sucesso.');
