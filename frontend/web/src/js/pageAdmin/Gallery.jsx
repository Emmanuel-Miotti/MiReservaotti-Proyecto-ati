import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form, Image } from "react-bootstrap";
import AuthUser from "../pageauth/AuthUser";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Config from "../Config";
import NavBar from "../components/Navbar.jsx";
import { getFullURL, getFullURL2 } from "../../utils/utils"; // Asegúrate de importar la función correctamente

const PageGaleria = () => {
  const { getToken, getUser } = AuthUser();
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    fetchEmpresa();
  }, []);

  const fetchEmpresa = async () => {
    try {
      const user = getUser();
      const response = await axios.get(`${Config.url()}/verempresa/${user.id}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      console.log(response.data.data)

      setEmpresa(response.data.data);
      if (response.data.data.gallery) {
        setGallery(JSON.parse(response.data.data.gallery));
      }
    } catch (error) {
      console.error("Error fetching empresa:", error);
    }
  };

  const handleFilesChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  const handleUpload = async () => {
    const data = new FormData();
    selectedFiles.forEach((file, index) => {
      data.append(`gallery[${index}]`, file);
    });

    try {
      const user = getUser();
      const response = await axios.post(`${Config.url()}/gallery/${user.id}`, data, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response)
      setGallery(JSON.parse(response.data.data.gallery));
    } catch (error) {
      console.error("Error updating gallery:", error);
    }
  };

  return (
    <>
      <NavBar />
      <Container className="mt-4">
        <Row>
          <Col>
            <h1>Galería de Imágenes</h1>
            <Form.Group>
              <Form.Label>Subir Imágenes</Form.Label>
              <Form.Control type="file" multiple onChange={handleFilesChange} />
            </Form.Group>
            <Button variant="primary" onClick={handleUpload}>
              Subir Imágenes
            </Button>
            <hr />
            <h2>Imágenes Subidas</h2>
            <Row>
              {gallery.length > 0 ? (
                gallery.map((image, index) => (
                  <Col key={index} xs={6} md={4} lg={3}>
                    <Image src={getFullURL2(image)} thumbnail />
                  </Col>
                ))
              ) : (
                <p>No hay imágenes en la galería.</p>
              )}
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default PageGaleria;
