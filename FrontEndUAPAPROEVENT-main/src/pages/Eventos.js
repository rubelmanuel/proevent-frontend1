import React, { useState } from 'react';
import '../css/Eventos.css';
import NuevaSolicitudEvento from './NuevaSolicitudEvento';

function Eventos({ usuario, editingEvent, setEditingEvent }) {
  const [activeSection, setActiveSection] = useState("Información General");

  return (
    <div className="eventos-container" style={{ padding: '0', background: 'transparent', boxShadow: 'none' }}>
      <NuevaSolicitudEvento
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        usuario={usuario}
        editingEvent={editingEvent}
        setEditingEvent={setEditingEvent}
      />
    </div>
  );
}

export default Eventos;
