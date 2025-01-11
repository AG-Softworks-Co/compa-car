import fetchUserRole from './FetchUserRole.tsx';

const UserRoleValidator = async (userId: number | null, token: string | null) => {
  try {
      if (!userId || !token) {
          throw new Error("userId y/o token son requeridos");
      }
    const role = await fetchUserRole(userId, token);
    return role;
  } catch (error) {
    console.error("Error in UserRoleValidator:", error);
    return null;
  }
};

export default UserRoleValidator;