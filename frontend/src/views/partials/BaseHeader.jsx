import { useEffect, useContext, useState } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { ProfileContext } from "../plugin/Context";

function BaseHeader() {
    const navigate = useNavigate();
    const [isLoggedIn, user] = useAuthStore((state) => [state.isLoggedIn, state.user]);
    const [profile] = useContext(ProfileContext);

    const isInstructor = profile?.is_instructor;
    const isStudent = !isInstructor; // Anyone NOT instructor is considered student

    return (
        <div>
            <nav className="navbar navbar-expand-lg bg-body-tertiary" data-bs-theme="dark">
                <div className="container">
                    <NavLink className="navbar-brand" to="/">
                        EduCollab LMS
                    </NavLink>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon" />
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">

                            {/* Dashboard */}

                            <li className="nav-item">
                            <NavLink
                                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                                to={isInstructor ? "/instructor/dashboard/" : "/student/dashboard/"}
                            >
                                <i className="fas fa-home"></i> Dashboard
                            </NavLink>
                            </li>


                            {/* Courses */}
                            <li className="nav-item">
                                <NavLink
                                    className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                                    to={isInstructor ? "/instructor/courses/" : "/student/courses/"}
                                >
                                    <i className="fas fa-book"></i> Courses
                                </NavLink>
                            </li>

                            {/* Study Groups */}
                            <li className="nav-item">
                                <NavLink
                                    className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                                    to="/study-groups/"
                                >
                                    <i className="fas fa-users"></i> Study Groups
                                </NavLink>
                            </li>

                            {/* Role Specific - My Progress or Analytics */}
                            {isStudent && (
                                <li className="nav-item">
                                    <NavLink
                                        className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                                        to="/student/progress/"
                                    >
                                        <i className="fas fa-chart-line"></i> My Progress
                                    </NavLink>
                                </li>
                            )}
                            {isInstructor && (
                                <li className="nav-item">
                                    <NavLink
                                        className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                                        to="/instructor/analytics/"
                                    >
                                        <i className="fas fa-chart-pie"></i> Analytics
                                    </NavLink>
                                </li>
                            )}
                        </ul>

                        {/* Right side: Login/Register or Logout */}
                        {isLoggedIn() ? (
                            <>
                                <Link to="/logout/" className="btn btn-primary ms-2">
                                    Logout <i className="fas fa-sign-out-alt"></i>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/login/" className="btn btn-primary ms-2">
                                    Login <i className="fas fa-sign-in-alt"></i>
                                </Link>
                                <Link to="/register/" className="btn btn-primary ms-2">
                                    Register <i className="fas fa-user-plus"></i>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default BaseHeader;
