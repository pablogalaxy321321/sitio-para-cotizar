import { useState } from "react";

const ControlPanel = ({ flangeParams, onParamsChange }) => {
  const [showModal, setShowModal] = useState(false);

  const handleInputChange = (field, value) => {
    const newParams = { ...flangeParams, [field]: value };

    // Validate inner vs outer diameter
    if (field === "innerDiameter" && value >= newParams.outerDiameter - 20) {
      newParams.innerDiameter = newParams.outerDiameter - 20;
    }
    if (field === "outerDiameter" && newParams.innerDiameter >= value - 20) {
      newParams.innerDiameter = value - 20;
    }

    onParamsChange(newParams);
  };

  const calculateWeight = () => {
    const { innerDiameter, outerDiameter, thickness, material } = flangeParams;
    const materialDensity = {
      1: 7.85,
      2: 8.0,
      3: 7.9,
    }[material];

    const outerVolume = Math.PI * (outerDiameter / 20) ** 2 * (thickness / 10);
    const innerVolume = Math.PI * (innerDiameter / 20) ** 2 * (thickness / 10);
    const totalVolume = outerVolume - innerVolume;
    return (totalVolume * materialDensity) / 1000;
  };

  const materialOptions = {
    1: "Acero al Carbono (ASTM A105)",
    2: "Acero Inoxidable (316L)",
    3: "Acero Aleado (ASTM A182)",
  };

  return (
    <div className="w-full lg:w-1/3 h-1/2 lg:h-full lg:bg-black lg:p-8 overflow-y-auto">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-4">
          <svg
            className="h-8 w-8 text-orange-400 mr-3"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 16c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"
              fill="currentColor"
            />
          </svg>
          <h1 className="text-2xl font-bold text-white">
            Inteli<span className="text-orange-400">Mark</span>
          </h1>
        </div>
        <h2 className="text-xl font-semibold text-gray-200">
          Diseño de Flanges a Medida
        </h2>
        <p className="text-gray-400 mt-2 mb-6 text-sm">
          Interactúa con el modelo 3D o usa los controles para configurar tu
          pieza. Nuestro Asistente IA Técnico usará estos datos para generar tu
          cotización al instante.
        </p>

        {/* Controls */}
        <div className="space-y-5">
          <div>
            <label
              htmlFor="inner-diameter"
              className="block text-sm font-medium text-gray-300"
            >
              Diámetro Interior (mm)
            </label>
            <input
              type="number"
              id="inner-diameter"
              value={flangeParams.innerDiameter}
              onChange={(e) =>
                handleInputChange("innerDiameter", parseFloat(e.target.value))
              }
              className="form-input mt-1 block w-full rounded-md shadow-sm p-2"
              autoComplete="off"
            />
          </div>

          <div>
            <label
              htmlFor="outer-diameter"
              className="block text-sm font-medium text-gray-300"
            >
              Diámetro Exterior (mm)
            </label>
            <input
              type="number"
              id="outer-diameter"
              value={flangeParams.outerDiameter}
              onChange={(e) =>
                handleInputChange("outerDiameter", parseFloat(e.target.value))
              }
              className="form-input mt-1 block w-full rounded-md shadow-sm p-2"
              autoComplete="off"
            />
          </div>

          <div>
            <label
              htmlFor="thickness"
              className="block text-sm font-medium text-gray-300"
            >
              Espesor (mm)
            </label>
            <input
              type="number"
              id="thickness"
              value={flangeParams.thickness}
              onChange={(e) =>
                handleInputChange("thickness", parseFloat(e.target.value))
              }
              className="form-input mt-1 block w-full rounded-md shadow-sm p-2"
              autoComplete="off"
            />
          </div>

          <div>
            <label
              htmlFor="bolt-count"
              className="block text-sm font-medium text-gray-300"
            >
              Número de Pernos:{" "}
              <span className="font-bold text-orange-400">
                {flangeParams.boltCount}
              </span>
            </label>
            <input
              type="range"
              id="bolt-count"
              min="4"
              max="16"
              step="4"
              value={flangeParams.boltCount}
              onChange={(e) =>
                handleInputChange("boltCount", parseInt(e.target.value))
              }
              className="mt-2 w-full"
            />
          </div>

          <div>
            <label
              htmlFor="material"
              className="block text-sm font-medium text-gray-300"
            >
              Material
            </label>
            <select
              id="material"
              value={flangeParams.material}
              onChange={(e) => handleInputChange("material", e.target.value)}
              className="form-input mt-1 block w-full rounded-md shadow-sm p-2"
            >
              {Object.entries(materialOptions).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <h3 className="text-lg font-semibold">Resumen de Parámetros</h3>
          <div className="mt-2 text-sm text-gray-400 space-y-1">
            <p>
              <strong>Diámetro:</strong> {flangeParams.innerDiameter}mm /{" "}
              {flangeParams.outerDiameter}mm
            </p>
            <p>
              <strong>Espesor:</strong> {flangeParams.thickness}mm
            </p>
            <p>
              <strong>Pernos:</strong> {flangeParams.boltCount}
            </p>
            <p>
              <strong>Material:</strong>{" "}
              {materialOptions[flangeParams.material]}
            </p>
            <p className="mt-2 text-lg font-bold text-white">
              <strong>Peso Estimado:</strong> {calculateWeight().toFixed(2)} kg
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="mt-6 w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.518.759a11.03 11.03 0 004.28 4.28l.759-1.518a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C6.477 18 2 13.523 2 8V3z"></path>
            </svg>
            Iniciar Chat con IA para Cotizar
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 modal-bg flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              ¡Parámetros Recibidos!
            </h3>
            <p className="text-gray-300 mb-6">
              Estamos iniciando la conexión con nuestro Asistente IA Técnico. En
              un momento, comenzará la llamada para entregarle su cotización.
            </p>
            <div className="animate-pulse text-orange-400 font-semibold mb-6">
              Conectando...
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
