import { useState, useEffect } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";

import { CartContext, ProfileContext } from "./views/plugin/Context";
import apiInstance from "./utils/axios";

import MainWrapper from "./layouts/MainWrapper";
import PrivateRoute from "./layouts/PrivateRoute";

import Register from "../src/views/auth/Register";
import Login from "../src/views/auth/Login";
import Logout from "./views/auth/Logout";
import ForgotPassword from "./views/auth/ForgotPassword";
import CreateNewPassword from "./views/auth/CreateNewPassword";

import CourseDetail from "./views/base/CourseDetail";

import StudentDashboard from "./views/student/Dashboard";
import StudentCourses from "./views/student/Courses";
import StudentCourseDetail from "./views/student/CourseDetail";
import StudentProfile from "./views/student/Profile";
import useAxios from "./utils/useAxios";
import UserData from "./views/plugin/UserData";
import StudentChangePassword from "./views/student/ChangePassword";
import Dashboard from "./views/instructor/Dashboard";
import Courses from "./views/instructor/Courses";
import Students from "./views/instructor/Students";
import TeacherNotification from "./views/instructor/TeacherNotification";
import QA from "./views/instructor/QA";
import ChangePassword from "./views/instructor/ChangePassword";
import Profile from "./views/instructor/Profile";
import CourseCreate from "./views/instructor/CourseCreate";
import CourseEdit from "./views/instructor/CourseEdit";
import CourseEditCurriculum from "./views/instructor/CourseEditCurriculum";

import Redirector from "./views/auth/Redirector";
import ProtectedRoute from "./views/partials/ProtectedRoute";

import StudyGroups from "./views/student/StudyGroups";
import StudyGroupDetail from "./views/student/StudyGroupDetail";
import CreateStudyGroup from "./views/student/CreateStudyGroup";

import InstructorStudyGroups from "./views/instructor/InstructorStudyGroups";
import InstructorStudyGroupDetail from "./views/instructor/InstructorStudyGroupDetail";
import InstructorCreateStudyGroup from "./views/instructor/InstructorCreateStudyGroup";

function App() {
    const [profile, setProfile] = useState([]);

useEffect(() => {

  useAxios.get(`user/profile/${UserData()?.user_id}/`).then((res) => {
    setProfile(res.data);
  });
}, []);

    return (
            <ProfileContext.Provider value={[profile, setProfile]}>
                <BrowserRouter>
                    <MainWrapper>
                        <Routes>
                            <Route path="/register/" element={<Register />} />
                            <Route path="/login/" element={<Login />} />
                            <Route path="/logout/" element={<Logout />} />
                            <Route path="/forgot-password/" element={<ForgotPassword />} />
                            <Route path="/create-new-password/" element={<CreateNewPassword />} />

                            {/* Base Routes */}
                            <Route path="/" element={<Redirector />} />
                            <Route path="/course-detail/:slug/" element={<CourseDetail />} />

                            {/* Student Routes */}
                            <Route
                            path="/student/dashboard/"
                            element={
                                <ProtectedRoute allowedRole="student">
                                <StudentDashboard />
                                </ProtectedRoute>
                            }
                            />
                            <Route
                            path="/student/courses/"
                            element={
                                <ProtectedRoute allowedRole="student">
                                <StudentCourses />
                                </ProtectedRoute>
                            }
                            />
                            <Route
                            path="/student/courses/:enrollment_id/"
                            element={
                                <ProtectedRoute allowedRole="student">
                                <StudentCourseDetail />
                                </ProtectedRoute>
                            }
                            />
                            <Route
                            path="/student/profile/"
                            element={
                                <ProtectedRoute allowedRole="student">
                                <StudentProfile />
                                </ProtectedRoute>
                            }
                            />
                            <Route
                            path="/student/change-password/"
                            element={
                                <ProtectedRoute allowedRole="student">
                                <StudentChangePassword />
                                </ProtectedRoute>
                            }
                            />
                            <Route
                            path="/student/study-groups/"
                            element={
                                <ProtectedRoute allowedRole="student">
                                <StudyGroups />
                                </ProtectedRoute>
                            }
                            />
                            <Route
                            path="/student/study-groups/create/"
                            element={
                                <ProtectedRoute allowedRole="student">
                                <CreateStudyGroup />
                                </ProtectedRoute>
                            }
                            />
                            <Route
                            path="/student/study-groups/:id/"
                            element={
                                <ProtectedRoute allowedRole="student">
                                <StudyGroupDetail />
                                </ProtectedRoute>
                            }
                            />



                            {/* Instructor Routes */}
                            <Route
                            path="/instructor/dashboard/"
                            element={
                                <ProtectedRoute allowedRole="instructor">
                                <Dashboard />
                                </ProtectedRoute>
                            }
                            />
                            <Route
                            path="/instructor/courses/"
                            element={
                                <ProtectedRoute allowedRole="instructor">
                                <Courses />
                                </ProtectedRoute>
                            }
                            />
                            <Route
                            path="/instructor/students/"
                            element={
                                <ProtectedRoute allowedRole="instructor">
                                <Students />
                                </ProtectedRoute>
                            }
                            />
                            <Route
                            path="/instructor/notifications/"
                            element={
                                <ProtectedRoute allowedRole="instructor">
                                <TeacherNotification />
                                </ProtectedRoute>
                            }
                            />
                            <Route
                            path="/instructor/question-answer/"
                            element={
                                <ProtectedRoute allowedRole="instructor">
                                <QA />
                                </ProtectedRoute>
                            }
                            />
                            <Route
                            path="/instructor/change-password/"
                            element={
                                <ProtectedRoute allowedRole="instructor">
                                <ChangePassword />
                                </ProtectedRoute>
                            }
                            />
                            <Route
                            path="/instructor/profile/"
                            element={
                                <ProtectedRoute allowedRole="instructor">
                                <Profile />
                                </ProtectedRoute>
                            }
                            />
                            <Route
                            path="/instructor/create-course/"
                            element={
                                <ProtectedRoute allowedRole="instructor">
                                <CourseCreate />
                                </ProtectedRoute>
                            }
                            />
                            <Route
                            path="/instructor/edit-course/:course_id/"
                            element={
                                <ProtectedRoute allowedRole="instructor">
                                <CourseEdit />
                                </ProtectedRoute>
                            }
                            />
                            <Route
                            path="/instructor/edit-course/:course_id/curriculum/"
                            element={
                                <ProtectedRoute allowedRole="instructor">
                                <CourseEditCurriculum />
                                </ProtectedRoute>
                            }
                            />
                            <Route
                            path="/instructor/study-groups/"
                            element={
                                <ProtectedRoute allowedRole="instructor">
                                <InstructorStudyGroups />
                                </ProtectedRoute>
                            }
                            />
                            <Route
                            path="/instructor/study-groups/:id/"
                            element={
                                <ProtectedRoute allowedRole="instructor">
                                <InstructorStudyGroupDetail />
                                </ProtectedRoute>
                            }
                            />                        
                            <Route
                            path="/instructor/study-groups/create/"
                            element={
                                <ProtectedRoute allowedRole="instructor">
                                <InstructorCreateStudyGroup />
                                </ProtectedRoute>
                            }
                            />
                        </Routes>
                    </MainWrapper>
                </BrowserRouter>
            </ProfileContext.Provider>
    );
}

export default App;
