import { Navigate } from "react-router-dom";

interface Props {
    children: JSX.Element;
}

const ProtectedRoute = ({ children }: Props) => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
