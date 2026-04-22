<?php
require_once __DIR__ . '/session.php';

function csrf_token(): string {
    start_session();
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function csrf_verify(string $token): bool {
    start_session();
    $expected = $_SESSION['csrf_token'] ?? '';
    return $expected !== '' && hash_equals($expected, $token);
}

function csrf_input(): string {
    return '<input type="hidden" name="csrf_token" value="' . htmlspecialchars(csrf_token()) . '">';
}
