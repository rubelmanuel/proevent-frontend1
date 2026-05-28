import React, { useState, useEffect } from "react";
import { FiAlertTriangle, FiArrowLeft, FiArrowRight, FiCheckCircle, FiMonitor, FiCalendar } from "react-icons/fi";
import { toast } from "react-hot-toast";
import InformacionGeneral from "./InformacionGeneral";
import ModalidadLugar from "./ModalidadLugar";
import ServiciosCatering from "./ServiciosCatering";
import PresupuestoPOA from "./PresupuestoPOA";
import AudiovisualMiniForm from "./AudiovisualMiniForm";

const API = "http://localhost:8080";

export default function NuevaSolicitudEvento({ activeSection, setActiveSection, usuario, editingEvent, setEditingEvent }) {
  const [data, setData] = useState({
    titulo: "", departamento: "", id_dependencia: "", tipo: "", otroTipo: "",
    inicio: "", fin: "", horaInicio: "", horaFin: "", modalidad: "Presencial",
    campus: "", id_recinto: "", asistentes: "", items: [], catering: [],
    presupuesto: "", moneda: "DOP", observaciones: ""
  });

  useEffect(() => {
    if (editingEvent) {
      setData({
        id_evento: editingEvent.id_evento,
        titulo: editingEvent.nombre || "",
        id_dependencia: editingEvent.id_dependencia || "",
        tipo: editingEvent.tipo_evento || "",
        otroTipo: "",
        inicio: editingEvent.fecha_inicio ? editingEvent.fecha_inicio.substring(0, 10) : "",
        fin: editingEvent.fecha_fin ? editingEvent.fecha_fin.substring(0, 10) : "",
        horaInicio: editingEvent.hora_inicio || "",
        horaFin: editingEvent.hora_fin || "",
        modalidad: editingEvent.modalidad || "Presencial",
        id_recinto: editingEvent.id_recinto || "",
        asistentes: editingEvent.cantidad_asistentes || "",
        items: editingEvent.detalles_corporativos ? editingEvent.detalles_corporativos.split(', ') : [],
        catering: editingEvent.alimentos ? editingEvent.alimentos.split(', ') : [],
        presupuesto: editingEvent.monto_poa || "",
        moneda: editingEvent.moneda || "DOP",
        observaciones: editingEvent.observaciones || ""
      });
    }
  }, [editingEvent]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [needsAV, setNeedsAV] = useState(null);
  const [avData, setAvData] = useState({ equipos: [], observaciones: "" });
  const [poaFiscal, setPoaFiscal] = useState(null);

  useEffect(() => {
    const fetchPoa = async () => {
      try {
        const res = await fetch(`${API}/poa`);
        const dataJson = await res.json();
        if (dataJson.poas && dataJson.poas.length > 0) {
          setPoaFiscal(dataJson.poas[0]);
        }
      } catch (e) {
        console.error("Error fetching POA for validation:", e);
      }
    };
    fetchPoa();
  }, []);

  const validarSeccion = (seccion) => {
    if (seccion === "Información General") {
      if (!data.titulo.trim()) return "El título del evento es obligatorio.";
      if (!data.id_dependencia) return "Debes seleccionar una dependencia.";
      if (!data.tipo) return "Debes seleccionar el tipo de evento.";
      if (!data.inicio) return "La fecha de inicio es obligatoria.";
      if (!data.horaInicio) return "La hora de inicio es obligatoria.";
      if (!data.fin) return "La fecha de finalización es obligatoria.";
      if (!data.horaFin) return "La hora de cierre es obligatoria.";
      if (data.fin < data.inicio) return "La fecha de fin no puede ser antes de la fecha de inicio.";

      const hI = parseInt(data.horaInicio.split(':')[0], 10);
      const mI = parseInt(data.horaInicio.split(':')[1], 10);
      const hF = parseInt(data.horaFin.split(':')[0], 10);
      const mF = parseInt(data.horaFin.split(':')[1], 10);

      if (data.inicio === data.fin) {
        if (hI > hF || (hI === hF && mI >= mF)) {
          return "La hora de finalización debe ser posterior a la de inicio en el mismo día.";
        }
      }

      if (poaFiscal) {
        const pInicio = poaFiscal.fecha_inicio.substring(0, 10);
        const pFin = poaFiscal.fecha_fin.substring(0, 10);
        
        if (data.inicio < pInicio || data.inicio > pFin || data.fin < pInicio || data.fin > pFin) {
          return `La fecha seleccionada está fuera del año fiscal activo (${pInicio} al ${pFin}).`;
        }
        
        const hoy = new Date().toISOString().substring(0, 10);
        if (data.inicio < hoy) {
            return "No se permite registrar eventos en fechas pasadas.";
        }
      }
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

  const baseSecciones = [
    "Información General",
    "Modalidad y Lugar",
    "Servicios alimenticios y Detalles coorporativos",
    "Presupuesto y POA"
  ];

  const secciones = usuario?.rol === "Solicitante" 
    ? [...baseSecciones, "Audiovisual"] 
    : baseSecciones;

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
    if (e) e.preventDefault();
    setError("");

    if (usuario?.rol === "Solicitante") {
      if (activeSection === "Audiovisual") {
        if (needsAV === null) {
          setError("Por favor, selecciona si deseas gestionar equipos audiovisuales.");
          return;
        }
        if (needsAV === true && avData.equipos.length === 0) {
          setError("Selecciona al menos un equipo o marca que no necesitas.");
          return;
        }
      }
    }
    ejecutarEnvioFinal();
  };

  const ejecutarEnvioFinal = async () => {
    setLoading(true);
    try {
      const payload = {
        nombre: data.titulo,
        modalidad: data.modalidad,
        fecha_inicio: data.inicio,
        fecha_fin: data.fin,
        hora_inicio: data.horaInicio,
        hora_fin: data.horaFin,
        cantidad_asistentes: Number(data.asistentes),
        tipo_evento: data.tipo,
        monto_poa: Number(data.presupuesto),
        moneda: data.moneda,
        id_usuario: usuario?.id_usuario || null,
        id_dependencia: data.id_dependencia || null,
        id_recinto: data.id_recinto || null,
        detalles_corporativos: data.items,
        alimentos: data.catering,
        observaciones: data.observaciones
      };

      const method = data.id_evento ? "PUT" : "POST";
      const url = data.id_evento ? `${API}/eventos/${data.id_evento}` : `${API}/eventos`;

      const res = await fetch(url, {
        method: method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${usuario?.token || ""}`, "x-usuario-id": usuario?.id_usuario || ""
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.mensaje || result.error || "Error al enviar la solicitud.");
        toast.error(result.mensaje || result.error || "Error al enviar la solicitud.");
      } else {
        const id_evento = result.id_evento || data.id_evento;
        
        if (needsAV === true && avData.equipos.length > 0) {
          try {
            const avRes = await fetch(`${API}/audiovisual`, {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${usuario?.token || ""}`, "x-usuario-id": usuario?.id_usuario || ""
              },
              body: JSON.stringify({
                id_evento: id_evento,
                servicios: avData.equipos
              })
            });
            if (!avRes.ok) {
              const avResult = await avRes.json();
              setError(`Evento creado (#EVT-${id_evento}), pero la solicitud audiovisual falló: ${avResult.mensaje}`);
              toast.error("La solicitud audiovisual falló.");
              setLoading(false);
              return;
            }
          } catch (avErr) {
            setError(`Evento creado (#EVT-${id_evento}), pero hubo un problema de conexión para la solicitud audiovisual.`);
            toast.error("Error de conexión al enviar la solicitud audiovisual.");
            setLoading(false);
            return;
          }
        }

        const exitoMsg = `Solicitud ${data.id_evento ? "actualizada" : "enviada"} con éxito. ID del evento: #EVT-${id_evento || data.id_evento}${needsAV ? " (Incluye requerimientos de audiovisual)" : ""}`;
        setExito(exitoMsg);
        toast.success(exitoMsg, { duration: 5000 });
        
        setData({
          titulo: "", departamento: "", id_dependencia: "", tipo: "", otroTipo: "",
          inicio: "", fin: "", horaInicio: "", horaFin: "",
          modalidad: "Presencial", campus: "", id_recinto: "", asistentes: "",
          items: [], catering: [], presupuesto: "", moneda: "DOP", observaciones: ""
        });
        setNeedsAV(null);
        setAvData({ equipos: [], observaciones: "" });
        if (setEditingEvent) setEditingEvent(null);
        setActiveSection(secciones[0]);
      }
    } catch (err) {
      setError("No se pudo conectar al servidor. Verifica que el backend esté activo.");
      toast.error("No se pudo conectar al servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleBorrador = () => {
    toast.success("Borrador guardado localmente. (Funcionalidad completa próximamente)", { duration: 4000 });
  };

  const esPrimeraSeccion = seccionActualIndex === 0;
  const esUltimaSeccion = seccionActualIndex === secciones.length - 1;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 animate-in">
      {/* ── HEADER ── */}
      <div className="bg-gradient-to-r from-primary to-primaryDark text-white rounded-xl p-6 flex items-center gap-4 shadow-lg" style={{ background: 'linear-gradient(135deg, var(--accent-primary) 0%, #1e3a8a 100%)' }}>
        <FiCalendar className="text-4xl" />
        <div>
          <h1 className="text-2xl font-extrabold">{data.id_evento ? 'Editar Solicitud' : 'Nueva Solicitud de Evento'}</h1>
          <p className="text-sm opacity-90 mt-1">Completa los pasos para registrar tu actividad.</p>
        </div>
      </div>

      <div className="card p-6">
        {/* PROGRESS TABS */}
        <div className="flex flex-wrap gap-2 mb-8">
          {secciones.map((s, i) => {
            const isActive = i === seccionActualIndex;
            const isPast = i < seccionActualIndex;
            return (
              <div key={s} className={`px-4 py-2 rounded-full text-xs font-bold transition-colors shadow-sm ${
                isPast ? 'bg-success text-white' : 
                isActive ? 'bg-accent-primary text-white' : 
                'bg-bg-subtle text-text-muted border border-border-soft'
              }`}>
                {i + 1}. {s.split(" ")[0]}
              </div>
            );
          })}
        </div>

        {exito && (
          <div className="flex items-center p-4 mb-6 rounded-md shadow-sm bg-success-bg text-success border border-success-border">
            <FiCheckCircle className="mr-2 flex-shrink-0 text-lg" />
            <span className="font-medium text-sm">{exito}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center p-4 mb-6 rounded-md shadow-sm bg-danger-bg text-danger border border-danger-border">
            <FiAlertTriangle className="mr-2 flex-shrink-0 text-lg" />
            <span className="font-medium text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
          
          {activeSection === "Audiovisual" && (
            <div className="animate-fade">
              {needsAV === null ? (
                <div className="p-8 text-center bg-bg-subtle rounded-xl border border-border-soft flex flex-col items-center">
                  <FiMonitor className="text-6xl text-text-faint mb-4" />
                  <h3 className="text-xl font-bold text-text-main mb-2">¿Desea gestionar equipos audiovisuales?</h3>
                  <p className="text-text-secondary text-sm mb-6 max-w-md">Esto incluye proyectores, micrófonos, sonido, cámaras, pantallas y otros equipos de soporte técnico.</p>
                  
                  <div className="flex gap-4 justify-center">
                    <button 
                      type="button" 
                      onClick={() => setNeedsAV(true)}
                      className="btn btn-primary px-6"
                    >
                      Sí, necesito equipos
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setNeedsAV(false)}
                      className="btn btn-secondary px-6"
                    >
                      No, solo el evento
                    </button>
                  </div>
                </div>
              ) : needsAV === true ? (
                <div className="space-y-4">
                  <button type="button" onClick={() => setNeedsAV(null)} className="btn btn-ghost text-sm p-0 mb-2">
                    <FiArrowLeft /> Cambiar respuesta
                  </button>
                  <AudiovisualMiniForm avData={avData} setAvData={setAvData} />
                </div>
              ) : (
                <div className="p-8 text-center bg-success-bg rounded-xl border border-success-border">
                  <FiCheckCircle className="text-5xl text-success mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-text-main mb-2">No se requieren servicios audiovisuales</h3>
                  <p className="text-sm text-success font-medium">Puede proceder a finalizar el registro de su evento.</p>
                  <button 
                    type="button" 
                    onClick={() => setNeedsAV(null)}
                    className="mt-6 text-sm text-success hover:text-[#065F46] underline font-semibold transition-colors"
                  >
                    Cambiar respuesta si se equivocó
                  </button>
                </div>
              )}
            </div>
          )}

          <hr className="border-border-soft my-8" />

          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div>
              {!esPrimeraSeccion && (
                <button type="button" onClick={handleAnterior} className="btn btn-secondary mr-3">
                  <FiArrowLeft /> Atrás
                </button>
              )}
              <button type="button" onClick={handleBorrador} className="btn btn-secondary">
                Guardar Borrador
              </button>
            </div>

            <div>
              {!esUltimaSeccion ? (
                <button type="button" onClick={handleSiguiente} className="btn btn-primary px-8">
                  Siguiente <FiArrowRight />
                </button>
              ) : (
                <button type="submit" disabled={loading} className="btn btn-primary px-8">
                  {!loading && <FiCheckCircle />}
                  {loading ? "Enviando..." : "Finalizar y Enviar Solicitud"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

