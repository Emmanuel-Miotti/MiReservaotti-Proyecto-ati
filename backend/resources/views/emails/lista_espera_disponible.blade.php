<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Disponibilidad en tu Lista de Espera</title>
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
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(90deg, rgba(34,193,195,1) 0%, rgba(253,187,45,1) 100%);
            padding: 20px;
            text-align: center;
            color: white;
            border-radius: 8px 8px 0 0;
        }
        .content {
            padding: 20px;
            text-align: left;
            color: #333333;
        }
        .content h1 {
            color: #22c1c3;
        }
        .footer {
            text-align: center;
            padding: 10px 20px;
            background-color: #eeeeee;
            border-radius: 0 0 8px 8px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            background-color: #22c1c3;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
            text-align: center;
        }
        ul {
            padding-left: 20px;
        }
        ul li {
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>MiReservaOtti</h1>
        </div>
        <div class="content">
            <h1>¡Un lugar se ha liberado!</h1>
            <p>Hola {{ $cliente->name }},</p>
            <p>Nos complace informarte que se ha liberado un lugar en el horario que seleccionaste en tu lista de espera.</p>
            <h2>Detalles del horario liberado:</h2>
            <ul>
                <li><strong>Fecha:</strong> {{ $fechaCancelada }}</li>
                <li><strong>Hora:</strong> {{ $horaCancelada }}</li>
            </ul>
            <h2>Detalles de tu inscripción:</h2>
            <ul>
                <li><strong>Fecha:</strong> desde {{ $fecha_inicio }} hasta {{ $fecha_fin }}</li>
                <li><strong>Hora:</strong> desde {{ $hora_inicio }} hasta {{ $hora_fin }}</li>
            </ul>
            <a href="http://mireservaotti.com" class="button">Realizar Reserva Ahora</a>
        </div>
        <div class="footer">
            <p>© 2024 MiReservaOtti, Todos los derechos reservados</p>
        </div>
    </div>
</body>
</html>
