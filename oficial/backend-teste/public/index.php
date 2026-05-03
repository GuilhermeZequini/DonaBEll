<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Local: public/ dentro do projeto → ../ = raiz Laravel.
// Hostinger (A): .../donabel.site/api + .../donabel.site/api-backend → ../api-backend
// Hostinger (B): .../public_html/api + .../donabel.site/api-backend → ../../api-backend
$laravelBase = null;
foreach ([__DIR__.'/../api-backend', __DIR__.'/../../api-backend'] as $candidate) {
    if (is_dir($candidate)) {
        $laravelBase = realpath($candidate) ?: $candidate;
        break;
    }
}
if ($laravelBase === null) {
    $laravelBase = realpath(__DIR__.'/..') ?: __DIR__.'/..';
}

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = $laravelBase.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require $laravelBase.'/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once $laravelBase.'/bootstrap/app.php';

$app->handleRequest(Request::capture());
