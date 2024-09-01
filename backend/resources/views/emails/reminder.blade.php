<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Recordatorio de Reserva - MiReservaOtti</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            color: #333;
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
            <h2>Hola, {{ $cliente->nombre }}</h2>
            <p id="reservaMensaje">Te recordamos que tienes una reserva programada para hoy </p>
            <p>¡Gracias por confiar en nosotros!</p>
            <a href="http://mireservaotti.com" class="button">Ir a MiReservaOtti</a>
        </div>
        <div class="footer">
            <p>© 2024 MiReservaOtti, Todos los derechos reservados</p>
        </div>
    </div>

    <script>
        // Función para calcular la fecha actual más 4 horas
        function calcularFechaReserva() {
            const fechaActual = new Date();
            fechaActual.setHours(fechaActual.getHours() + 4);

            const opciones = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
            return fechaActual.toLocaleString('es-ES', opciones).replace(',', '');
        }

        // Insertar la fecha calculada en el mensaje
        document.getElementById('reservaMensaje').innerHTML += `<strong>${calcularFechaReserva()}</strong>.`;
    </script>
</body>
</html>
