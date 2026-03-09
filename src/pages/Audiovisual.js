import React, { useState, useEffect } from "react";
import "./../css/Audiovisual.css";
import { FiAlertTriangle, FiCheckCircle, FiMonitor, FiSpeaker, FiMic, FiVideo, FiRadio, FiSun, FiCast } from "react-icons/fi";

const API = "http://localhost:8080";

const EQUIPOS_DISPONIBLES = [
  { id: "proyector", label: "Proyector", icon: <FiMonitor /> },
  { id: "sonido", label: "Sistema de sonido", icon: <FiSpeaker /> },
  { id: "microfonia", label: "Micrófonos", icon: <FiMic /> },
  { id: "camaras", label: "Cámaras (Grabación)", icon: <FiVideo /> },
  { id: "streaming", label: "Transmisión en vivo", icon: <FiRadio /> },
  { id: "iluminacion", label: "Iluminación", icon: <FiSun /> },
  { id: "pantallas", label: "Pantallas o monitores extras", icon: <FiCast /> }
];

export default function Audiovisual({ usuario }) {
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  
  // Estado para los equipos seleccionados
  const [equiposSeleccionados, setEquiposSeleccionados] = useState({});
  const [observacionesGenerales, setObservacionesGenerales] = useState("");
  
  // Estado UI
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [errorDate, setErrorDate] = useState(null); // Para la validación de 15 días

  // 1. Cargar la lista de eventos del usuario (temporalmente cargamos todos por ser admin/teseo)
  useEffect(() => {
    fetch(`${API}/eventos`)
      .then((res) => res.json())
      .then((data) => {
        // Filtrar opcionalmente solo los del usuario activo si "usuario" estuviera disponible plenamente
        // En este prototipo mostraremos todos para propósitos de prueba de la API
        setEventos(data);
      })
      .catch((err) => console.error("Error cargando eventos:", err));
  }, []);

  // 2. Manejar selección del evento y validar los 15 días inmediatamente
  const handleSelectEvent = (e) => {
    const evId = e.target.value;
    if (!evId) {
      setEventoSeleccionado(null);
      setErrorDate(null);
      return;
    }

    const ev = eventos.find((ev) => ev.id_evento === Number(evId));
    setEventoSeleccionado(ev);
    setMensaje(""); // Limpiar mensaje de exito anterior

    if (ev) {
      // Validar Antelación de 15 días
      const fechaEv = new Date(ev.fecha_inicio);
      const hoy = new Date();
      fechaEv.setHours(0,0,0,0);
      hoy.setHours(0,0,0,0);
      
      const difTiempo = fechaEv.getTime() - hoy.getTime();
      const difDias = Math.ceil(difTiempo / (1000 * 3600 * 24));
      
      if (difDias < 15) {
        setErrorDate(`Políticas institucionales: Toda solicitud audiovisual debe realizarse con un mínimo de 15 días de antelación. Este evento está programado para dentro de ${difDias} día(s).`);
      } else {
        setErrorDate(null);
      }
    }
  };

  // 3. Manejar el Toogle de Equipos
  const handleToggleEquipo = (idEquipo) => {
    setEquiposSeleccionados((prev) => {
      const isSelected = !!prev[idEquipo];
      if (isSelected) {
        const copy = { ...prev };
        delete copy[idEquipo];
        return copy;
      } else {
        return {
          ...prev,
          [idEquipo]: { cantidad: 1, ubicacion: "" } // defaults
        };
      }
    });
  };

  // 4. Cambiar detalles del equipo
  const handleChangeEquipo = (idEquipo, field, val) => {
    setEquiposSeleccionados((prev) => ({
      ...prev,
      [idEquipo]: {
        ...prev[idEquipo],
        [field]: val
      }
    }));
  };

  // 5. Enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (errorDate) return; 
    
    const seleccionados = Object.keys(equiposSeleccionados);
    if (!eventoSeleccionado || seleccionados.length === 0) {
      setMensaje({ tipo: "error", texto: "Debes seleccionar un evento y al menos un servicio audiovisual." });
      return;
    }

    setLoading(true);
    setMensaje("");

    // Formatear payload para la nueva ruta del backend
    const serviciosPayload = seleccionados.map((key) => {
      const eqData = equiposSeleccionados[key];
      const eqMeta = EQUIPOS_DISPONIBLES.find(e => e.id === key);
      return {
        equipo: eqMeta.label,
        cantidad: eqData.cantidad,
        ubicacion: eqData.ubicacion,
        observaciones: observacionesGenerales
      };
    });

    try {
      const res = await fetch(`${API}/audiovisual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_evento: eventoSeleccionado.id_evento,
          servicios: serviciosPayload
        })
      });

      const body = await res.json();

      if (!res.ok) {
        setMensaje({ tipo: "error", texto: body.mensaje || "Error al enviar solicitud." });
      } else {
        setMensaje({ tipo: "success", texto: "Solicitud de servicios audiovisuales procesada con éxito." });
        // Reset form
        setEventoSeleccionado(null);
        setEquiposSeleccionados({});
        setObservacionesGenerales("");
        setErrorDate(null);
        document.getElementById("evento-select").value = "";
      }
    } catch (err) {
      setMensaje({ tipo: "error", texto: "No se pudo conectar al servidor." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="audiovisual-section">
      <div className="av-header">
        <h1 className="av-title">Solicitud de Servicio Audiovisual</h1>
        <p className="av-subtitle">
          Registra los requerimientos técnicos y equipos necesarios para tu evento. 
          Recuerda que estas solicitudes están sujetas a la validación estricta de 15 días de anticipación.
        </p>
      </div>

      {mensaje && (
        <div className={`av-message ${mensaje.tipo}`}>
          {mensaje.tipo === "error" ? <FiAlertTriangle /> : <FiCheckCircle />}
          {mensaje.texto}
        </div>
      )}

      <form className="av-card" onSubmit={handleSubmit}>
        
        {/* EVENTO ASOCIADO */}
        <div className="form-group">
          <label className="form-label" htmlFor="evento-select">Seleccione el Evento Asociado</label>
          <select 
            id="evento-select" 
            className="form-select" 
            onChange={handleSelectEvent}
            defaultValue=""
          >
            <option value="" disabled>-- Selecciona un evento programado --</option>
            {eventos.map(ev => (
              <option key={ev.id_evento} value={ev.id_evento}>
                #{ev.id_evento} - {ev.nombre} ({ev.fecha_inicio.substring(0,10)})
              </option>
            ))}
          </select>

          {eventoSeleccionado && !errorDate && (
            <div className="event-details-box">
              <div className="detail-item">
                <span className="detail-label">Modalidad</span>
                <span className="detail-value">{eventoSeleccionado.modalidad}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fecha del evento</span>
                <span className="detail-value">{eventoSeleccionado.fecha_inicio.substring(0, 10)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Recinto asignado</span>
                <span className="detail-value">{eventoSeleccionado.recinto || 'Por definir'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Asistentes est.</span>
                <span className="detail-value">{eventoSeleccionado.cantidad_asistentes} PAX</span>
              </div>
            </div>
          )}

          {errorDate && (
            <div className="date-alert">
              <FiAlertTriangle className="date-alert-icon" />
              <div>
                <div className="date-alert-title">Tiempo de solicitud insuficiente</div>
                <div className="date-alert-desc">{errorDate}</div>
              </div>
            </div>
          )}
        </div>

        {/* REQUERIMIENTOS AUDIOVISUALES */}
        <div className="form-group" style={{ 
          opacity: (eventoSeleccionado && !errorDate) ? 1 : 0.5, 
          pointerEvents: (eventoSeleccionado && !errorDate) ? 'auto' : 'none' 
        }}>
          <label className="form-label">Servicios y Equipos Requeridos</label>
          <div className="equipment-grid">
            {EQUIPOS_DISPONIBLES.map((eq) => {
              const isActive = !!equiposSeleccionados[eq.id];
              return (
                <div key={eq.id} className={`eq-card ${isActive ? 'selected' : ''}`}>
                  <div className="eq-header" onClick={() => handleToggleEquipo(eq.id)}>
                    <input 
                      type="checkbox" 
                      className="eq-checkbox" 
                      checked={isActive} 
                      readOnly
                    />
                    <div style={{ color: isActive ? 'var(--orange)' : 'var(--muted)', display: 'flex' }}>
                       {eq.icon}
                    </div>
                    <span className="eq-name">{eq.label}</span>
                  </div>

                  {isActive && (
                    <div className="eq-details">
                      <div className="eq-field-row">
                        <span className="eq-field-label">Cantidad</span>
                        <input 
                          type="number" 
                          min="1" max="50" 
                          className="eq-number-input"
                          value={equiposSeleccionados[eq.id].cantidad}
                          onChange={(e) => handleChangeEquipo(eq.id, 'cantidad', e.target.value)}
                        />
                      </div>
                      <div className="eq-field-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span className="eq-field-label">Área / Ubicación del montaje</span>
                        <input 
                          type="text" 
                          placeholder="Ej. Salón Principal, Tarima..." 
                          className="eq-text-input"
                          value={equiposSeleccionados[eq.id].ubicacion}
                          onChange={(e) => handleChangeEquipo(eq.id, 'ubicacion', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* OBSERVACIONES */}
        <div className="form-group" style={{ 
          opacity: (eventoSeleccionado && !errorDate) ? 1 : 0.5, 
          pointerEvents: (eventoSeleccionado && !errorDate) ? 'auto' : 'none' 
        }}>
          <label className="form-label" htmlFor="obs-generales">Observaciones o Instrucciones Especiales</label>
          <textarea 
            id="obs-generales" 
            className="form-textarea"
            placeholder="Especifique requerimientos como posición de cámaras, necesidades de iluminación particulares, etc."
            value={observacionesGenerales}
            onChange={(e) => setObservacionesGenerales(e.target.value)}
          ></textarea>
        </div>

        {/* ACCIONES */}
        <div className="av-actions">
          <button 
            type="submit" 
            className="av-submit-btn" 
            disabled={loading || !eventoSeleccionado || errorDate || Object.keys(equiposSeleccionados).length === 0}
          >
            {loading ? "Procesando..." : "Registrar Solicitud Técnica"}
          </button>
        </div>
      </form>
    </div>
  );
}
