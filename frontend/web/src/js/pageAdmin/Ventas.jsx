import React, { useState, useEffect } from "react";
import { Table, Container } from "react-bootstrap";
import axios from "axios";
import { useParams } from "react-router-dom";
import NavBar from "../components/Navbar.jsx";
import AuthUser from "../pageauth/AuthUser";
import Config from "../Config";

const ListaVentas = () => {
  const { empresaId } = useParams();
  const [ventas, setVentas] = useState([]);
  const [empresa, setEmpresa] = useState({});
  const [loading, setLoading] = useState(true);
  const { getUser } = AuthUser();

  useEffect(() => {
    fetchVentas();
  }, []);

  const fetchVentas = async () => {
    try {
      const response = await axios.get(`${Config.url()}/empresa/${getUser().id}/ventas`);
      setEmpresa(response.data.empresa);
      setVentas(response.data.ventas);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener las ventas:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (!Array.isArray(ventas)) {
    return <p>No se pudieron cargar las ventas.</p>;
  }

  return (
    <>
      <NavBar />
      <Container className="mt-2">
        <h1 className="mt-3 text-center">Tus ventas</h1>

        <Table striped bordered hover responsive className="mt-3">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Total</th>
                <th>Fecha</th>
                <th>Detalles</th>
              </tr>
            </thead>

        {ventas.length === 0 ? (
          <p>Todavia no se han realizado ventas</p>
        ) : (
            <tbody>
              {ventas.map((venta) => (
                <React.Fragment key={venta.id}>
                  <tr>
                    <td>{venta.cliente ? venta.cliente.name : "N/A"}</td>
                    <td>${venta.total}</td>
                    <td>{new Date(venta.created_at).toLocaleDateString()}</td>
                    <td>
                      <ul>
                        {venta.productos.map((producto) => (
                          <li key={producto.id}>
                            {producto.nombre} - Cantidad: {producto.pivot.cantidad} - Precio: ${producto.pivot.precio}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          
        )}

        </Table>
      </Container>
    </>
  );
};

export default ListaVentas;
