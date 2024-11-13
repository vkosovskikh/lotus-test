import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch } from "../../store/store";
import { appActions, meAction } from "../../store/appSlice";
import { Spinner } from "react-bootstrap";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const params = useParams();

  async function checkToken() {
    if (params.token) {
      try {
        const res = await dispatch(meAction({ token: params.token })).unwrap();

        dispatch(
          appActions.setAuth({
            login: res.user.login,
            role: res.user.role,
            token: params.token,
          })
        );
        return navigate("/", { replace: true });
      } catch (e) {}
    }

    alert("Неверный токен");
    dispatch(appActions.clearAuth());
    navigate("/register", { replace: true });
  }

  useEffect(() => {
    checkToken();
  }, []);

  return <Spinner />;
}
