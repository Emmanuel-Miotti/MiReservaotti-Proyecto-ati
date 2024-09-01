import React from "react";
import { useNavigate } from "react-router-dom";

const ButtonGradient2 = ({ title, href }) => {
    const navigate = useNavigate();

  const buttonStyle = {
    // padding: "15px 30px",
    fontSize: "18px",
    // fontWeight: "bold",
    color: "#38ef7d",
    textAlign: "center",
    background: "transparent",
    border: "2px solid",
    // borderImage: "linear-gradient(45deg, #11998e, #38ef7d) 1",
    borderRadius: "25px",
    cursor: "pointer",
    transition: "transform 0.2s, color 0.2s",
    display: "inline-block",
  };

  const handleMouseOver = (e) => {
    e.target.style.transform = "translateY(-2px)";
    e.target.style.color = "#11998e";
  };

  const handleMouseOut = (e) => {
    e.target.style.transform = "translateY(0)";
    e.target.style.color = "#38ef7d";
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

export default ButtonGradient2;
