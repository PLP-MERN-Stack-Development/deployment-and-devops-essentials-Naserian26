import { Outlet } from 'react-router-dom';
// Correct import
import useAuth from "../../hooks/useAuth";

import { Navigate } from 'react-router-dom';

const ChatLayout = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="h-full">
      <Outlet />
    </div>
  );
};

export default ChatLayout;