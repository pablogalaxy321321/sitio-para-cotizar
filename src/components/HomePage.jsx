import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./HomePage.css"; // Importaremos los estilos específicos aquí

// Registramos el plugin de ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// ============================================
// CONFIGURACIÓN DE VIDEO
// ============================================
// Cambia USE_LOCAL_VIDEO a 'false' para usar Cloudinary en producción
const USE_LOCAL_VIDEO = true;

const VIDEO_SOURCES = {
  local: "/videos/maqueta_virtual_piping_cabecera.mp4",
  cloudinary:
    "https://res.cloudinary.com/ddle2pz8m/video/upload/q_auto,f_auto/v1760757594/maqueta_virtual_piping_cabecera_cljbya.mp4",
};

const VIDEO_SRC = USE_LOCAL_VIDEO
  ? VIDEO_SOURCES.local
  : VIDEO_SOURCES.cloudinary;
// ============================================

// El prop 'onNavigate' será una función para cambiar de página
const HomePage = ({ onNavigate }) => {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const heroSectionRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    console.log("🚀 Inicializando HomePage");
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const video = videoRef.current;

    if (!canvas || !context || !video) {
      console.error("❌ Faltan referencias:", {
        canvas: !!canvas,
        context: !!context,
        video: !!video,
      });
      return;
    }

    console.log("✓ Referencias inicializadas correctamente");

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    let frameId = null;

    const drawFrame = () => {
      if (
        canvas &&
        canvas.width > 0 &&
        canvas.height > 0 &&
        video.readyState >= 2
      ) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      frameId = requestAnimationFrame(drawFrame);
    };

    // Evento cuando la metadata está lista (duración, dimensiones)
    video.addEventListener("loadedmetadata", () => {
      console.log("✓ Metadata cargada - Duración:", video.duration, "segundos");
      setVideoLoaded(true);

      // Iniciar el dibujado del video en el canvas
      frameId = requestAnimationFrame(drawFrame);

      // Dar tiempo para que React actualice el DOM antes de configurar ScrollTrigger
      setTimeout(() => {
        console.log("⚡ Configurando animación de scroll");

        // Configurar ScrollTrigger para el video
        ScrollTrigger.create({
          trigger: heroSectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          pin: true,
          onUpdate: (self) => {
            // Sincronizar el video con el scroll
            if (video.duration && video.readyState >= 2) {
              const targetTime = self.progress * video.duration;
              video.currentTime = targetTime;
              console.log(
                `📍 Scroll: ${(self.progress * 100).toFixed(
                  1
                )}% | Video: ${video.currentTime.toFixed(
                  2
                )}s / ${video.duration.toFixed(2)}s`
              );
            }
          },
          onEnter: () => console.log("🎬 Entrando a la sección del video"),
          onLeave: () => console.log("👋 Saliendo de la sección del video"),
        });

        // Animación del texto
        gsap.to(".hero-text-container h1, .hero-text-container p", {
          opacity: 1,
          transform: "translateY(0)",
          stagger: 0.2,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: heroSectionRef.current,
            start: "top center",
          },
        });

        console.log("✅ ScrollTriggers configurados correctamente");
      }, 100);
    });

    // Evento cuando hay suficientes datos para el frame actual
    video.addEventListener("loadeddata", () => {
      console.log("✓ Video data disponible");
    });

    // Manejo de errores
    video.addEventListener("error", (e) => {
      console.error("❌ Error al cargar el video:", e);
      setVideoLoaded(false);
    });

    // NO llamar video.load() - dejar que el navegador lo maneje automáticamente
    console.log("🎬 Esperando carga automática del video...");

    // Cleanup function para evitar memory leaks
    return () => {
      console.log("🧹 Limpiando recursos del video");
      window.removeEventListener("resize", setCanvasSize);
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []); // El array vacío asegura que este efecto se ejecute solo una vez

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 p-4 md:px-8 transition-all duration-300">
        <nav className="container mx-auto flex justify-between items-center">
          <a href="#" className="text-2xl font-black text-white">
            LOGO EMPRESA
          </a>
          <div className="hidden md:flex space-x-8 items-center">
            <a
              href="#servicios"
              className="text-gray-300 hover:text-cyan-400 transition-colors"
            >
              Servicios
            </a>
            <a
              href="#proyectos"
              className="text-gray-300 hover:text-cyan-400 transition-colors"
            >
              Proyectos
            </a>
            {/* Este botón ahora navegará a tu configurador */}
            <button
              onClick={() => onNavigate("configurator")}
              className="bg-cyan-500 text-black font-bold py-2 px-5 rounded-md hover:bg-cyan-400 transition-all duration-300 hover:scale-105"
            >
              Configurador 3D
            </button>
          </div>
          <button className="md:hidden text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </nav>
      </header>

      <main>
        <section ref={heroSectionRef} className="relative h-[300vh]">
          <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
            {!videoLoaded && (
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                  <p className="text-white text-lg">Cargando experiencia...</p>
                </div>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 h-full w-full"
            ></canvas>
            <video
              ref={videoRef}
              className="hidden"
              preload="auto"
              muted
              playsInline
              crossOrigin={USE_LOCAL_VIDEO ? undefined : "anonymous"}
            >
              <source src={VIDEO_SRC} type="video/mp4" />
            </video>
            <div className="hero-text-container absolute z-10 text-center text-white p-4">
              <h1 className="text-4xl md:text-7xl font-black text-glow">
                INGENIERÍA DE PRECISIÓN
              </h1>
              <p className="mt-4 max-w-2xl text-lg md:text-xl text-gray-300">
                Soluciones de piping industrial para los desafíos más complejos
                de la minería en Chile.
              </p>
            </div>
          </div>
        </section>

        <div
          id="main-content"
          className="container mx-auto px-4 md:px-8 relative z-20 -mt-2"
        >
          <section id="servicios" className="py-20 md:py-32">
            <div className="text-center mb-16">
              <h2 className="text-sm font-bold uppercase text-cyan-400 tracking-widest">
                Nuestra Expertise
              </h2>
              <p className="text-4xl md:text-5xl font-black mt-2 text-white">
                Servicios Integrales de Piping
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-[#111111] border border-gray-800 p-8 rounded-xl hover:border-cyan-500 transition-all duration-300 hover:scale-105">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Diseño y Modelado 3D
                </h3>
                <p className="text-gray-400">
                  Utilizamos software CAD de última generación para crear
                  modelos 3D precisos.
                </p>
              </div>
              {/* Card 2 */}
              <div className="bg-[#111111] border border-gray-800 p-8 rounded-xl hover:border-cyan-500 transition-all duration-300 hover:scale-105">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Fabricación y Montaje
                </h3>
                <p className="text-gray-400">
                  Fabricación de spools y flanges, asegurando un montaje preciso
                  y eficiente en faena.
                </p>
              </div>
              {/* Card 3 */}
              <div className="bg-[#111111] border border-gray-800 p-8 rounded-xl hover:border-cyan-500 transition-all duration-300 hover:scale-105">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Control de Calidad
                </h3>
                <p className="text-gray-400">
                  Rigurosos protocolos de control para garantizar la seguridad y
                  durabilidad.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-[#0a0a0a] border-t border-gray-900">
        <div className="container mx-auto px-8 py-12 text-center text-gray-500">
          <p>
            &copy; 2025 [Nombre de tu Empresa]. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </>
  );
};

export default HomePage;
