import React, { useState } from "react";
import { FiAlertTriangle, FiArrowLeft, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import InformacionGeneral from "./InformacionGeneral";
import ModalidadLugar from "./ModalidadLugar";
import ServiciosCatering from "./ServiciosCatering";
import PresupuestoPOA from "./PresupuestoPOA";

const API = "http://localhost:8080";

export default function NuevaSolicitudEvento({ activeSection, setActiveSection, usuario }) {
  const [data, setData] = useState({
    titulo: "",
    departamento: "",
    id_dependencia: "",
    tipo: "",
    otroTipo: "",
    inicio: "",
    fin: "",
    horaInicio: "",
    horaFin: "",
    modalidad: "Presencial",
    campus: "",
    id_recinto: "",
    asistentes: "",
    items: [],
    catering: [],
    presupuesto: "",
    moneda: "DOP",
    observaciones: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const validarSeccion = (seccion) => {
    if (seccion === "Información General") {
      if (!data.titulo.trim()) return "El título del evento es obligatorio.";
      if (!data.id_dependencia) return "Debes seleccionar una dependencia.";
      if (!data.tipo) return "Debes seleccionar el tipo de evento.";
      if (data.tipo === "Otro" && !data.otroTipo.trim()) return "Especifica el tipo de evento.";
      if (!data.inicio) return "La fecha de inicio es obligatoria.";
      if (!data.horaInicio) return "La hora de inicio es obligatoria.";
      if (!data.fin) return "La fecha de finalización es obligatoria.";
      if (!data.horaFin) return "La hora de cierre es obligatoria.";
      if (data.fin < data.inicio) return "La fecha de fin no puede ser antes de la fecha de inicio.";
    }
    if (seccion === "Modalidad y Lugar") {
      if (!data.modalidad) return "Debes seleccionar una modalidad.";
      if (!data.id_recinto) return "Debes seleccionar un recinto.";
      if (!data.asistentes || Number(data.asistentes) < 1) return "La cantidad de asistentes debe ser al menos 1.";
    }
    if (seccion === "Presupuesto y POA") {
      if (!data.presupuesto || Number(data.presupuesto) <= 0) return "El presupuesto estimado debe ser mayor a 0.";
    }
    return null;
  };

  const secciones = [
    "Información General",
    "Modalidad y Lugar",
    "Servicios alimenticios y Detalles coorporativos",
    "Presupuesto y POA"
  ];

  const seccionActualIndex = secciones.indexOf(activeSection);

  const handleSiguiente = () => {
    const err = validarSeccion(activeSection);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    if (seccionActualIndex < secciones.length - 1) {
      setActiveSection(secciones[seccionActualIndex + 1]);
    }
  };

  const handleAnterior = () => {
    setError("");
    if (seccionActualIndex > 0) {
      setActiveSection(secciones[seccionActualIndex - 1]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const errFinal = validarSeccion("Presupuesto y POA");
    if (errFinal) {
      setError(errFinal);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nombre: data.tipo === "Otro" ? `${data.otroTipo} - ${data.titulo}` : data.titulo,
        modalidad: data.modalidad,
        fecha_inicio: data.inicio,
        fecha_fin: data.fin,
        hora_inicio: data.horaInicio,
        hora_fin: data.horaFin,
        cantidad_asistentes: Number(data.asistentes),
        tipo_evento: data.tipo === "Otro" ? data.otroTipo : data.tipo,
        monto_poa: Number(data.presupuesto),
        moneda: data.moneda,
        id_usuario: usuario?.id_usuario || null,
        id_dependencia: data.id_dependencia || null,
        id_recinto: data.id_recinto || null,
        detalles_corporativos: data.items,
        alimentos: data.catering,
        observaciones: data.observaciones
      };

      const res = await fetch(`${API}/eventos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.mensaje || "Error al enviar la solicitud.");
      } else {
        setExito(`Solicitud enviada con exito. ID del evento: #EVT-${result.id_evento}`);
        setData({
          titulo: "", departamento: "", id_dependencia: "", tipo: "", otroTipo: "",
          inicio: "", fin: "", horaInicio: "", horaFin: "",
          modalidad: "Presencial", campus: "", id_recinto: "", asistentes: "",
          items: [], catering: [], presupuesto: "", moneda: "DOP", observaciones: ""
        });
        setActiveSection("Información General");
      }
    } catch (err) {
      setError("No se pudo conectar al servidor. Verifica que el backend esté activo.");
    } finally {
      setLoading(false);
    }
  };

  const handleBorrador = () => {
    alert("Borrador guardado localmente. (Funcionalidad completa próximamente)");
  };

  const esPrimeraSeccion = seccionActualIndex === 0;
  const esUltimaSeccion = seccionActualIndex === secciones.length - 1;

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>Nueva Solicitud de Evento</h2>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {secciones.map((s, i) => (
          <div key={s} style={{
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: i === seccionActualIndex ? "bold" : "normal",
            background: i < seccionActualIndex ? "#22c55e" : i === seccionActualIndex ? "#1e40af" : "#e2e8f0",
            color: i <= seccionActualIndex ? "white" : "#64748b"
          }}>
            {i + 1}. {s.split(" ")[0]}
          </div>
        ))}
      </div>

      {exito && (
        <div style={{ background: "#dcfce7", border: "1px solid #16a34a", color: "#15803d", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontWeight: "500", display: "flex", alignItems: "center", gap: "10px" }}>
          <FiCheckCircle aria-hidden="true" />
          {exito}
        </div>
      )}

      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #dc2626", color: "#dc2626", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
          <FiAlertTriangle aria-hidden="true" />
          {error}
        </div>
      )}

      {activeSection === "Información General" && (
        <InformacionGeneral data={data} setData={setData} />
      )}
      {activeSection === "Modalidad y Lugar" && (
        <ModalidadLugar data={data} setData={setData} />
      )}
      {activeSection === "Servicios alimenticios y Detalles coorporativos" && (
        <ServiciosCatering data={data} setData={setData} />
      )}
      {activeSection === "Presupuesto y POA" && (
        <PresupuestoPOA data={data} setData={setData} />
      )}

      <div className="actions" style={{ display: "flex", gap: "10px", marginTop: "24px", flexWrap: "wrap" }}>
        {!esPrimeraSeccion && (
          <button type="button" onClick={handleAnterior}
            style={{ padding: "10px 20px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontWeight: "500", display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <FiArrowLeft aria-hidden="true" />
            Anterior
          </button>
        )}

        <button type="button" onClick={handleBorrador}
          style={{ padding: "10px 20px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer" }}>
          Guardar Borrador
        </button>

        {!esUltimaSeccion ? (
          <button type="button" onClick={handleSiguiente}
            style={{ padding: "10px 20px", borderRadius: "6px", border: "none", background: "#1e40af", color: "white", cursor: "pointer", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "8px" }}>
            Siguiente
            <FiArrowRight aria-hidden="true" />
          </button>
        ) : (
          <button type="submit" disabled={loading}
            style={{ padding: "10px 24px", borderRadius: "6px", border: "none", background: loading ? "#94a3b8" : "#16a34a", color: "white", cursor: loading ? "not-allowed" : "pointer", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "8px" }}>
            {!loading && <FiCheckCircle aria-hidden="true" />}
            {loading ? "Enviando..." : "Enviar Solicitud"}
          </button>
        )}
      </div>
    </form>
  );
}
