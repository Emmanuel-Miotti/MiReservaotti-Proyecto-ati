import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet, useNavigate } from "react-router-dom";
import AuthUser from "../pageauth/AuthUser";
import { Container } from "react-bootstrap";

const LayoutAdmin = () => {
    const { getRol } = AuthUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (getRol() !== "Empresa") {
            navigate("/");
        }
    });
    return (
        <Container>
            <Navbar />
            <Outlet />
            <Footer />
        </Container>
    );
};

export default LayoutAdmin;
