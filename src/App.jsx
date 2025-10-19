import React, { useState } from "react";

// 1. Asegúrate de que estas rutas sean correctas
import HomePage from "./components/HomePage.jsx";
import FlangeConfigurator from "./components/ThreeViewer_fixed.jsx";

function App() {
  // 2. Este "estado" controla qué página se ve.
  // Al poner 'home', le decimos que empiece en la nueva página de inicio.
  const [currentPage, setCurrentPage] = useState("home");

  const navigateTo = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="App">
      {/* 3. Este es el "controlador de tráfico" */}
      {currentPage === "home" ? (
        // Si el estado es 'home', muestra la página de inicio
        <HomePage onNavigate={navigateTo} />
      ) : (
        // Si el estado es cualquier otra cosa (como 'configurator'), muestra los flanges
        <FlangeConfigurator />
      )}
    </div>
  );
}

export default App;
