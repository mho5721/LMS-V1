import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";

import BaseHeader from "../partials/BaseHeader";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import Toast from "../plugin/Toast";

function InstructorStudyGroupDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [members, setMembers] = useState([]);
    const messagesEndRef = useRef(null);

    const fetchGroup = async () => {
        const res = await useAxios.get(`/study-groups/${id}/`);
        setGroup(res.data);
    };

    const fetchMessages = async () => {
        const res = await useAxios.get(`/study-group-messages/?group=${id}`);
        setMessages(res.data);
    };

    const fetchMembers = async () => {
        const res = await useAxios.get(`/study-group-members/?group=${id}`);
        setMembers(res.data);
    };

    const checkMembership = async () => {
        const res = await useAxios.get(`/study-group-members/?group=${id}`);
        const memberIds = res.data.map((m) => m.user);
        if (!memberIds.includes(UserData()?.user_id)) {
            Toast().fire({ icon: "error", title: "You are not a member of this group" });
            navigate("/instructor/study-groups/");
        }
    };

    const handleRemoveMember = (memberId) => {
        const formData = new FormData();
        formData.append("user_id", memberId);
        formData.append("group_id", id);
        formData.append("requester_id", UserData()?.user_id);

        useAxios.post(`/student/study-groups/remove-member/`, formData).then(() => {
            if (memberId === UserData()?.user_id) {
                Toast().fire({ icon: "info", title: "You left the group" });
                navigate("/instructor/study-groups/");
            } else {
                Toast().fire({ icon: "success", title: "Member removed" });
                fetchMembers();
            }
        });
    };

    useEffect(() => {
        fetchGroup();
        fetchMessages();
        fetchMembers();
        checkMembership();
    }, [id]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

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
                                <i className="fas fa-comments"></i> {group?.name} Messages
                            </h4>

                            <div className="card mb-4">
                                <div className="card-header">Members</div>
                                <div className="card-body">
                                    <ul className="list-group">
                                        {members.map((m) => (
                                            <li key={m.id} className="list-group-item d-flex justify-content-between align-items-center">
                                                {m.user_name || `User #${m.user}`}
                                                {m.user_is_instructor && (
                                                    <span className="badge bg-info text-dark ms-2">Instructor</span>
                                                )}
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleRemoveMember(m.user)}
                                                >
                                                    Remove
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-body" style={{ height: "500px", overflowY: "auto" }}>
                                    <ul className="list-unstyled">
                                        {messages.map((msg) => (
                                            <li key={msg.id} className="mb-3">
                                                <div className="bg-light p-3 rounded">
                                                    <strong>{msg.sender_name || "User"}</strong>
                                                    <p className="mb-1">{msg.message}</p>
                                                    <small className="text-muted">{moment(msg.sent_at).format("DD MMM, YYYY HH:mm")}</small>
                                                </div>
                                            </li>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </ul>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default InstructorStudyGroupDetail;
