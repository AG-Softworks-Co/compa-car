const fetchUserRole = async (userId: number, token: string) => {
  try {
    const response = await fetch(
      `https://rest-sorella-production.up.railway.app/api/users/${userId}`,
      {
        headers: {
          'x-token': token,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error al obtener el rol del usuario: ${response.status}`);
    }

    const data = await response.json();
      if (!data || !data.user || !data.user.role) {
      throw new Error("La respuesta de la API no contiene el rol del usuario");
        }
    return data.user.role;
  } catch (error) {
    console.error("Error al obtener el rol:", error);
    throw error;
  }
};

export default fetchUserRole;