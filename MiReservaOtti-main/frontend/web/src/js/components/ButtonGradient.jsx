import React from "react";
import { useNavigate } from "react-router-dom";

const ButtonGradient = ({ title, href }) => {
    const navigate = useNavigate();

    const buttonStyle = {
        // padding: "10px 10px",
        fontSize: "18px",
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        border: "none",
        borderRadius: "25px",
        background: "linear-gradient(45deg, #11998e, #38ef7d)",
        boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
        cursor: "pointer",
        transition: "transform 0.2s",
    };

    const handleMouseOver = (e) => {
        e.target.style.transform = "translateY(-2px)";
    };

    const handleMouseOut = (e) => {
        e.target.style.transform = "translateY(0)";
    };

    const handleMouseDown = (e) => {
        e.target.style.transform = "translateY(2px)";
    };

    const handleMouseUp = (e) => {
        e.target.style.transform = "translateY(0)";
    };

    const handleClick = () => {
        navigate(href);
    };

    return (
        <button
            style={buttonStyle}
            onClick={handleClick}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            {title}
        </button>
    );
};

export default ButtonGradient;
