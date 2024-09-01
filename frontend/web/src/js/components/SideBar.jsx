import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ isOpen }) => {
    const sidebarStyle = {
        width: '250px',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        backgroundColor: '#333',
        transition: 'transform 0.3s ease-in-out',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        minHeight: '100vh', // Altura completa
        // backgroundColor: '#f0f0f0', // Color de fondo para el sidebar
        padding: '20px' // Espaciado interno
    };

    const headerStyle = {
        padding: '20px',
        backgroundColor: '#222',
        color: 'white',
        textAlign: 'center',
    };

    const listStyle = {
        listStyle: 'none',
        padding: 0,
    };

    const listItemStyle = {
        padding: '10px 20px',
    };

    const linkStyle = {
        color: 'white',
        textDecoration: 'none',
    };

    const activeStyle = {
        color: '#4CAF50',
    };

    const contentStyle = {
        marginLeft: '250px', // Margen izquierdo igual al ancho del sidebar
        padding: '20px', // Espaciado interno
        flex: 1, // Ocupa el espacio restante
      };

    return (
        <div style={sidebarStyle}>
            <div style={headerStyle}>
                <h3>Logo</h3>
            </div>
            <ul style={listStyle}>
                <li style={listItemStyle}>
                    <NavLink to="/" exact style={linkStyle} activeStyle={activeStyle}>Home</NavLink>
                </li>
                <li style={listItemStyle}>
                    <NavLink to="/about" style={linkStyle} activeStyle={activeStyle}>About</NavLink>
                </li>
                <li style={listItemStyle}>
                    <NavLink to="/services" style={linkStyle} activeStyle={activeStyle}>Services</NavLink>
                </li>
                <li style={listItemStyle}>
                    <NavLink to="/contact" style={linkStyle} activeStyle={activeStyle}>Contact</NavLink>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
