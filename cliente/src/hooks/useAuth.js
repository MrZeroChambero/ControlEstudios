import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage", error);
      // Opcional: Limpiar el almacenamiento si está corrupto
      // localStorage.removeItem('user');
    }
  }, []);

  return { user };
};
