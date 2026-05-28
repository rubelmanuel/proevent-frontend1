import React, { useState, useEffect } from "react";
import { FiMonitor, FiSpeaker, FiMic, FiVideo, FiRadio, FiSun, FiCast, FiRefreshCw } from "react-icons/fi";

const API = "http://localhost:8080";

const IconMap = {
  FiMonitor, FiSpeaker, FiMic, FiVideo, FiRadio, FiSun, FiCast, FiRefreshCw
};

export default function AudiovisualMiniForm({ avData, setAvData }) {
  const [equiposDisponibles, setEquiposDisponibles] = useState([]);

  useEffect(() => {
    fetch(`${API}/equipos-audiovisuales`)
      .then(res => res.json())
      .then(data => setEquiposDisponibles(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error cargando equipos", err));
  }, []);

  const handleToggleEquipo = (idEquipo, nombre) => {
    const isAlreadySelected = avData.equipos.some(e => e.id_equipo === idEquipo);
    
    if (isAlreadySelected) {
      setAvData({
        ...avData,
        equipos: avData.equipos.filter(e => e.id_equipo !== idEquipo)
      });
    } else {
      setAvData({
        ...avData,
        equipos: [
          ...avData.equipos,
          { id_equipo: idEquipo, equipo: nombre, cantidad: 1, ubicacion: "", observaciones: avData.observaciones }
        ]
      });
    }
  };

  const handleChangeEquipo = (idEquipo, field, val) => {
    setAvData({
      ...avData,
      equipos: avData.equipos.map(e => 
        e.id_equipo === idEquipo ? { ...e, [field]: val } : e
      )
    });
  };

  const handleObservacionesChange = (val) => {
    setAvData({
      ...avData,
      observaciones: val,
      equipos: avData.equipos.map(e => ({ ...e, observaciones: val }))
    });
  };

  return (
    <div className="space-y-6 animate-fade">
      <p className="text-sm font-medium text-text-secondary">Seleccione los equipos necesarios para su evento:</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {equiposDisponibles.map((eq) => {
          const selectedEq = avData.equipos.find(e => e.id_equipo === eq.id_equipo);
          const isActive = !!selectedEq;
          const IconComp = IconMap[eq.icono] || IconMap["FiMonitor"];
          
          return (
            <div 
              key={eq.id_equipo} 
              className={`p-4 border-2 rounded-xl transition-all cursor-pointer hover-lift ${
                isActive ? 'border-accent-primary bg-accent-light shadow-md' : 'border-border-soft bg-bg-card hover:border-border-medium'
              }`}
              onClick={() => handleToggleEquipo(eq.id_equipo, eq.nombre)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors ${
                  isActive ? 'bg-accent-primary text-white' : 'bg-bg-subtle text-text-muted'
                }`}>
                  <IconComp />
                </div>
                <span className={`text-sm font-bold transition-colors ${isActive ? 'text-accent-primary' : 'text-text-main'}`}>
                  {eq.nombre}
                </span>
              </div>
              
              {isActive && (
                <div className="mt-4 pt-4 border-t border-dashed border-accent-primary/30" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-text-secondary">Cantidad:</span>
                    <input 
                      type="number" min="1" 
                      className="input-base !py-1 !px-2 !w-16"
                      value={selectedEq.cantidad}
                      onChange={(e) => handleChangeEquipo(eq.id_equipo, 'cantidad', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <input 
                    type="text" 
                    className="input-base !py-2 !text-xs"
                    placeholder="Ubicación específica..."
                    value={selectedEq.ubicacion}
                    onChange={(e) => handleChangeEquipo(eq.id_equipo, 'ubicacion', e.target.value)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-5 bg-bg-subtle rounded-xl border border-border-soft">
        <label className="block text-sm font-bold text-text-main mb-2">Observaciones Generales de Audiovisual</label>
        <textarea 
          className="input-base min-h-[100px]"
          placeholder="Ej: Necesitamos los micrófonos probados 30 minutos antes. El proyector debe estar en la mesa central."
          value={avData.observaciones}
          onChange={(e) => handleObservacionesChange(e.target.value)}
        />
      </div>
    </div>
  );
}
