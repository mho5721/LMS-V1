import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import BaseHeader from "../partials/BaseHeader";

import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import Toast from "../plugin/Toast";

function InstructorCreateStudyGroup() {
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({
        course: "",
        name: ""
    });
    const navigate = useNavigate();

    useEffect(() => {
        useAxios.get(`/instructor/course-list/${UserData()?.user_id}/`).then((res) => {
            setCourses(res.data.map((c) => ({ id: c.course.id, title: c.course.title })));
        });
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = new FormData();
        payload.append("course", formData.course);
        payload.append("name", formData.name);
        payload.append("created_by", UserData()?.user_id);

        try {
            const res = await useAxios.post(`/study-groups/`, payload);
            Toast().fire({ icon: "success", title: "Group created successfully" });
            navigate(`/instructor/study-groups/${res.data.id}/`);
        } catch (err) {
            Toast().fire({ icon: "error", title: "Failed to create group" });
            console.error(err);
        }
    };

    return (
        <>
            <BaseHeader />
            <section className="pt-5 pb-5">
                <div className="container">
                    <Header />
                    <div className="row mt-0 mt-md-4">
                        <Sidebar />
                        <div className="col-lg-9 col-md-8 col-12">
                            <h4 className="mb-4">
                                <i className="fas fa-plus"></i> Create New Study Group
                            </h4>

                            <div className="card">
                                <div className="card-body">
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label">Group Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                className="form-control"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="e.g. Project Mentorship Group"
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Course</label>
                                            <select
                                                name="course"
                                                className="form-select"
                                                value={formData.course}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">-- Select Course --</option>
                                                {courses.map((c) => (
                                                    <option key={c.id} value={c.id}>{c.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <button type="submit" className="btn btn-success">
                                            Create Group <i className="fas fa-check-circle"></i>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default InstructorCreateStudyGroup;
