<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Nursing College ERP</title>
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    </head>
    <body class="antialiased">
        <div id="app"></div>
        <script>
            // Fallback: If React doesn't mount in 3 seconds, show a message
            setTimeout(function() {
                var app = document.getElementById('app');
                if (app && app.innerHTML === '') {
                    app.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;">Loading... (If this persists, please check console for errors)</div>';
                }
            }, 3000);
        </script>
    </body>
</html>
