import { PropsWithChildren } from "react";
import { useAppSelector } from "../../store/store";
import { Navigate } from "react-router-dom";

export default function PrivateRoute(props: PropsWithChildren) {
  const auth = useAppSelector((state) => state.app.auth);

  if (!auth) {
    return <Navigate to="/register" replace />;
  }

  return props.children;
}
