<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Bienvenido a MiReservaOtti</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            background-color: #ffffff;
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(90deg, rgba(34,193,195,1) 0%, rgba(253,187,45,1) 100%);
            padding: 10px 20px;
            text-align: center;
            color: white;
        }
        .content {
            padding: 20px;
            text-align: center;
            color: #333333;
        }
        .footer {
            text-align: center;
            padding: 10px 20px;
            background-color: #eeeeee;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            background-color: #22c1c3;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>MiReservaOtti</h1>
        </div>
        <div class="content">
            <h2>¡Hola, {{ $name }} !</h2>
            <p>¡Gracias por registrarte en nuestra plataformaBienvendio!</p>
            <a href="http://mireservaotti.com" class="button">Visitar MiReservaOtti</a>
        </div>
        <div class="footer">
            <p>© 2024 MiReservaOtti, Todos los derechos reservados</p>
        </div>
    </div>
</body>
</html>
