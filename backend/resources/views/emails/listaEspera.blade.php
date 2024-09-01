<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lugar disponible</title>
</head>
<body>
    <h1>¡Un lugar se ha liberado!</h1>
    <p>Hola {{ $inscripcion->cliente->name }},</p>
    <p>Un lugar se ha liberado en la fecha y hora que solicitaste. Puedes proceder a realizar tu reserva.</p>
    <p>Fecha: {{ $inscripcion->fecha_inicio }} - {{ $inscripcion->fecha_fin }}</p>
    <p>Hora: {{ $inscripcion->hora_inicio }} - {{ $inscripcion->hora_fin }}</p>
    <p>¡No te pierdas esta oportunidad!</p>
</body>
</html>
