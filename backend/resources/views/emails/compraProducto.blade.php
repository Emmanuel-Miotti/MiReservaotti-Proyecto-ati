<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Confirmación de Compra - MiReservaOtti</title>
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
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #dddddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #22c1c3;
            color: white;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>MiReservaOtti</h1>
        </div>
        <div class="content">
            <h2>Hola, {{ $name }}</h2>
            <p>Su compra se ha realizado con éxito. Aquí están los detalles:</p>
            <table>
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio Unitario</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($compra->productos as $producto)
                    <tr>
                        <td>{{ $producto->nombre }}</td>
                        <td>{{ $producto->pivot->cantidad }}</td>
                        <td>${{ number_format($producto->pivot->precio, 2) }}</td>
                        <td>${{ number_format($producto->pivot->cantidad * $producto->pivot->precio, 2) }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
            <p><strong>Total pagado:</strong> ${{ number_format($total, 2) }}</p>
            <p>¡Gracias por comprar en nuestra plataforma!</p>
            <a href="http://mireservaotti.com" class="button">Visitar MiReservaOtti</a>
        </div>
        <div class="footer">
            <p>© 2024 MiReservaOtti, Todos los derechos reservados</p>
        </div>
    </div>
</body>
</html>
