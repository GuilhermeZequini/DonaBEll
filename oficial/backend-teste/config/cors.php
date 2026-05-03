<?php

// Produção + origens locais (padrão) ou CORS_ALLOWED_ORIGINS no .env para somar/extra.
$localDefaults = 'http://localhost:4200,http://127.0.0.1:4200,http://localhost:8000,http://127.0.0.1:8000';
$bundles = [
    'https://donabel.site,https://www.donabel.site',
    (string) env('CORS_ALLOWED_ORIGINS', $localDefaults),
];

$originSet = [];
foreach ($bundles as $chunk) {
    foreach (explode(',', $chunk) as $o) {
        $o = trim($o);
        if ($o !== '') {
            $originSet[$o] = true;
        }
    }
}

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_keys($originSet),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
