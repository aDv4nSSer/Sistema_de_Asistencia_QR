import React, { useEffect, useState } from "react";
import axios from "axios";

interface SeleccionMateriaProps {
  token: string;
  role: string;
  onSelectMateria: (materiaId: string) => void;
}

const SeleccionMateria: React.FC<SeleccionMateriaProps> = ({ token, role, onSelectMateria }) => {
  const [materias, setMaterias] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    const getMaterias = async () => {
      try {
        const url = role === "profesor" ? "/profesor/materias" : "/estudiante/materias";
        const res = await axios.get("http://localhost:8000" + url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMaterias(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    getMaterias();
  }, [role, token]);

  return (
    <div>
      <h2>Seleccione una materia</h2>
      <ul>
        {materias.map(materia => (
          <li key={materia.id}>
            <button onClick={() => onSelectMateria(materia.id)}>{materia.name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SeleccionMateria;
