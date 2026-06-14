import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,    setUser   ] = useState(null);
  const [token,   setToken  ] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && token) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setProfileImage(parsed.profileImage || null);
      // Fetch fresh profile image in background
      fetchProfileImage(parsed.role);
    }
    setLoading(false);
  }, []);

  const fetchProfileImage = async (role) => {
    try {
      if (role === 'student') {
        const res = await api.get('/student/profile');
        const img = res.data.profile?.profileImage || null;
        setProfileImage(img);
        // Update stored user
        const saved = localStorage.getItem('user');
        if (saved) {
          const u = JSON.parse(saved);
          u.profileImage = img;
          localStorage.setItem('user', JSON.stringify(u));
        }
      } else if (role === 'company') {
        const res = await api.get('/company/profile');
        const img = res.data.profile?.logoUrl || null;
        setProfileImage(img);
        const saved = localStorage.getItem('user');
        if (saved) {
          const u = JSON.parse(saved);
          u.profileImage = img;
          localStorage.setItem('user', JSON.stringify(u));
        }
      }
    } catch { /* silent — not critical */ }
  };

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    // Fetch profile image after login
    setTimeout(() => fetchProfileImage(userData.role), 500);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setProfileImage(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateProfileImage = (imageUrl) => {
    setProfileImage(imageUrl);
    const saved = localStorage.getItem('user');
    if (saved) {
      const u = JSON.parse(saved);
      u.profileImage = imageUrl;
      localStorage.setItem('user', JSON.stringify(u));
    }
  };

  return (
    <AuthContext.Provider value={{
      user, token, login, logout, loading,
      profileImage, updateProfileImage, fetchProfileImage
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);