import React, { useState, useEffect } from "react";
import { Container, Button, Card } from "react-bootstrap";
import { FaEdit, FaSignOutAlt, FaArrowLeft } from "react-icons/fa";
import AuthUser from "../pageauth/AuthUser";
import { useNavigate } from "react-router-dom";
import Config from "../Config";
import NavBar from "../components/Navbar.jsx";
import { getFullURL } from "../../utils/utils";

const PagePerfilEmpresa = () => {
  const { getToken, getUser } = AuthUser();
  const navigate = useNavigate();
  const user = getUser();
  const defaultPhoto = "https://via.placeholder.com/150";
  const [photo, setPhoto] = useState(user && user.profile_picture ? getFullURL(user.profile_picture) : defaultPhoto);
  const [empresa, setEmpresa] = useState({
    name: "",
    email: "",
    cellphone: "",
    address: "",
    categoria_id: null,
    departamento_id: null,
    ciudad_id: null,
    categoria: "",
    departamento: "",
    ciudad: "",
    profile_picture: defaultPhoto,
  });

  useEffect(() => {
    if (getToken()) {
      fetchEmpresa();
    }
  }, []);

  const fetchEmpresa = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Token not found");
      }

      const response = await Config.getEmpresaId2(`${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const empresaData = response.data.data;
      console.error(empresaData);
      // const categoriaResponse = await axios.get(`${Config.url()}/categorias/${empresaData.categoria_id}`);
      // const departamentoResponse = await axios.get(`${Config.url()}/departamentos/${empresaData.departamento_id}`);
      // const ciudadResponse = await axios.get(`${Config.url()}/ciudades/${empresaData.ciudad_id}`);

      setEmpresa({
        ...empresaData,
        categoria: empresaData.categoria.name,
        departamento: empresaData.departamento.name,
        ciudad: empresaData.ciudad.name,
      });

      if (empresaData.profile_picture) {
        setPhoto(getFullURL(empresaData.profile_picture));
      }
    } catch (error) {
      console.error("Error fetching empresa:", error);
      navigate("/");
    }
  };

  const editarEmpresa = () => {
    navigate(`/edit-empresa/${user.id}`);
  };

  const logoutUser = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <>
      <NavBar />
      <Container className="mt-4 d-flex justify-content-center">
        <Card className="shadow-sm" style={{ width: '100%', maxWidth: '600px' }}>
          <Card.Body className="text-center">
            <h1 className="mt-3">Perfil Empresa</h1>

            <div className="position-relative">
              <img
                src={photo}
                alt="Perfil de Empresa"
                className="img-fluid rounded-circle mb-3"
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
              />
            </div>
            
            {empresa ? (
              <>
                <h2>{empresa.name}</h2>
                {empresa.email && <p>Email: {empresa.email}</p>}
                {empresa.cellphone && <p>Teléfono: {empresa.cellphone}</p>}
                {empresa.address && <p>Dirección: {empresa.address}</p>}
                {empresa.categoria && <p>Categoría: {empresa.categoria}</p>}
                {empresa.departamento && <p>Departamento: {empresa.departamento}</p>}
                {empresa.ciudad && <p>Ciudad: {empresa.ciudad}</p>}
              </>
            ) : (
              <p>Cargando datos del perfil...</p>
            )}
          </Card.Body>
          <Card.Footer className="text-center">
            <div className="d-grid gap-2">
              <Button variant="primary" onClick={editarEmpresa}>
                <FaEdit className="me-2" /> Editar Perfil
              </Button>
              <Button variant="danger" onClick={logoutUser}>
                <FaSignOutAlt className="me-2" /> Cerrar Sesión
              </Button>
              <Button variant="secondary" onClick={() => navigate("/empresa")}>
                <FaArrowLeft className="me-2" /> Volver
              </Button>
            </div>
          </Card.Footer>
        </Card>
      </Container>
    </>
  );
};

export default PagePerfilEmpresa;
