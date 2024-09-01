import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthUser = () => {
  const navigate = useNavigate();

  const getToken = () => {
    // const tokenString = sessionStorage.getItem("token");
    const tokenString = localStorage.getItem("token");
    // const token = JSON.parse(tokenString);
    return tokenString;
  };

  const getUser = () => {
    const userString = localStorage.getItem("usuario");
    const user = JSON.parse(userString);
    return user;
  };

  const getId = () => {
    const idString = localStorage.getItem("id");
    // const id = JSON.parse(idString);
    return idString;
  };

  // const getUsusario = () => {
  //   const user = sessionStorage.getItem("usuario");
  //   // const user = JSON.parse(userString);
  //   return user;
  // };

  const getRol = () => {
    const rolString = localStorage.getItem("rol");
    // const rol = JSON.parse(rolString);
    return rolString;
  };

  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getUser());
  const [rol, setRol] = useState(getRol());

  const saveToken = (user, token, rol) => {
    sessionStorage.setItem("user", JSON.stringify(user));
    sessionStorage.setItem("token", JSON.stringify(token));
    sessionStorage.setItem("rol", JSON.stringify(rol));

    setUser(user);
    setToken(token);
    setRol(rol);

    if (getRol() === "Empresa") {
      navigate("/Empresa");
    }
    if (getRol() === "Cliente") {
      navigate("/Cliente");
    }
  };

  const getLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return {
    setToken: saveToken,
    token,
    user,
    rol,
    getToken,
    getRol,
    getUser,
    getLogout,
    getId,
  };
};

export default AuthUser;
