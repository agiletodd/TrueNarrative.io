// utils/formatUser.js
export function formatUser(user) {
  return {
    id: user.id,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    role: user.role,
  };
}
