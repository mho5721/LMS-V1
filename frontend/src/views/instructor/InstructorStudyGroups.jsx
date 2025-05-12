import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";

import BaseHeader from "../partials/BaseHeader";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";

function InstructorStudyGroups() {
    const [groups, setGroups] = useState([]);

    const fetchGroups = () => {
        useAxios.get(`/study-groups/`).then((res) => {
            const ownedGroups = res.data.filter((g) => g.created_by === UserData()?.user_id);
            setGroups(ownedGroups);
        });
    };

    useEffect(() => {
        fetchGroups();
    }, []);

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
                                <i className="fas fa-users"></i> My Study Groups
                            </h4>

                            <div className="card mb-4">
                                <div className="card-header">
                                    <h5 className="mb-0">Created Study Groups</h5>
                                </div>
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Group Name</th>
                                                    <th>Course</th>
                                                    <th>Created</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {groups.length > 0 ? (
                                                    groups.map((group) => (
                                                        <tr key={group.id}>
                                                            <td>{group.name}</td>
                                                            <td>{group.course_title || group.course}</td>
                                                            <td>{moment(group.date_created).format("DD MMM, YYYY")}</td>
                                                            <td>
                                                                <Link to={`/instructor/study-groups/${group.id}/`} className="btn btn-primary btn-sm">
                                                                    View <i className="fas fa-arrow-right ms-1"></i>
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4">No groups found.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default InstructorStudyGroups;
