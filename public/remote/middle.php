<?php
define('SERVICE_KEY', 'middle');
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../lib/session.php';
require_once __DIR__ . '/../../lib/csrf.php';

require_auth();

define('SERVICE_NAME', SERVICE_MAP[SERVICE_KEY]);
$default_phone = get_session_phone();
$csrf_token    = csrf_token();

require_once __DIR__ . '/../pages/form.php';
