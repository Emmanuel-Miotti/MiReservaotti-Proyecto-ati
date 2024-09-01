import React, { useState, useEffect } from "react";
import { Table, Container, Button } from "react-bootstrap";
import axios from "axios";
import AuthUser from "../pageauth/AuthUser";
import NavBar from "../components/Navbar.jsx";
import { useNavigate } from 'react-router-dom';
import Config from "../Config";

const ListaCompras = () => {
  const { getUser } = AuthUser();
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompras();
  }, []);

  const fetchCompras = async () => {
    try {
      const userId = getUser().id;
      const response = await axios.get(`${Config.url()}/cliente/${userId}/compras`);

      if (response.data && Array.isArray(response.data.compras)) {
        setCompras(response.data.compras);
      } else {
        console.error("La respuesta de la API no es un arreglo:", response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener las compras:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (!Array.isArray(compras)) {
    return <p>No se pudieron cargar las compras.</p>;
  }

  return (
    <>
      <NavBar />
      <Container className="mt-2">
        <h1 className="mt-3">Mis Compras</h1>
        <Table striped bordered hover responsive className="mt-3">
          <thead>
            <tr>

              <th>Productos</th>
              <th>Total</th>
 <th>Fecha</th>

<th>Empresa</th>
<th></th>
            </tr>
          </thead>
          <tbody>
          {compras.length > 0 ? (
            compras.map((compra) => (
              <tr key={compra.id}>

              <td>
                  <ul>
                    {compra.productos.map((producto) => (
                      <li key={producto.id}>
                        {producto.nombre} - Cantidad: {producto.pivot.cantidad} - Precio: ${producto.pivot.precio}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>${compra.total}</td>
                <td>{new Date(compra.created_at).toLocaleDateString()}</td>
                
                
                <td>{compra.empresa ? compra.empresa.name : "N/A"}</td>
                {/* <td>{compra.empresa ? <a href={compra.empresa.url}>Ver empresa</a> : "N/A"}</td> */}
                <td>              <Button onClick={() => navigate(`/${compra.empresa.url}`)} type="submit" className="btn btn-primary">
                Ver empresa
              </Button></td>
                
                
                
                
              </tr>
            ))
          ) : (
            <p>No has realizado compras</p>
            /* <p>Cargando...</p> */
        )}
          </tbody>
        </Table>
      </Container>
    </>
  );
};

export default ListaCompras;
