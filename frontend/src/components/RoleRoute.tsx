import { Navigate, Outlet } from "react-router-dom";
import { hasAnyRole } from "../utils/auth";

interface RoleRouteProps {
  roles: string[];
}

function RoleRoute({ roles }: RoleRouteProps) {
  if (!hasAnyRole(roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default RoleRoute;
