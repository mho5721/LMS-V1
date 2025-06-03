import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import BaseHeader from "../partials/BaseHeader";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import Toast from "../plugin/Toast";
import moment from "moment";

function CourseDetail() {
    const [course, setCourse] = useState([]);
    const [variantItem, setVariantItem] = useState(null);
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [markAsCompletedStatus, setMarkAsCompletedStatus] = useState({});
    const [createNote, setCreateNote] = useState({ title: "", note: "" });
    const [selectedNote, setSelectedNote] = useState(null);
    const [createMessage, setCreateMessage] = useState({
        title: "",
        message: "",
    });
    const [questions, setQuestions] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [createReview, setCreateReview] = useState({ rating: 1, review: "" });
    const [studentReview, setStudentReview] = useState([]);

    const param = useParams();
    const lastElementRef = useRef();
    // Play Lecture Modal
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = (variant_item) => {
        setShow(true);
        setVariantItem(variant_item);
    };

    const [noteShow, setNoteShow] = useState(false);
    const handleNoteClose = () => setNoteShow(false);
    const handleNoteShow = (note) => {
        setNoteShow(true);
        setSelectedNote(note);
    };

    const [ConversationShow, setConversationShow] = useState(false);
    const handleConversationClose = () => setConversationShow(false);
    const handleConversationShow = (converation) => {
        setConversationShow(true);
        setSelectedConversation(converation);
    };

    const [addQuestionShow, setAddQuestionShow] = useState(false);
    const handleQuestionClose = () => setAddQuestionShow(false);
    const handleQuestionShow = () => setAddQuestionShow(true);

    const [availableGroups, setAvailableGroups] = useState([]);

    const fetchAvailableGroups = () => {
    useAxios
        .get(`/student/study-groups/available/${UserData()?.user_id}/?course_id=${course.course?.id}`)
        .then((res) => setAvailableGroups(res.data));
    };

    const handleJoinGroup = (groupId) => {
    const formData = new FormData();
    formData.append("user_id", UserData()?.user_id);
    formData.append("group_id", groupId);

    useAxios.post(`/student/study-groups/join/`, formData).then(() => {
        fetchAvailableGroups();
        Toast().fire({ icon: "success", title: "Joined group successfully" });
    });
    };


    const fetchCourseDetail = async () => {
        useAxios.get(`student/course-detail/${UserData()?.user_id}/${param.enrollment_id}/`).then((res) => {
            setCourse(res.data);
            setQuestions(res.data.question_answer);
            setStudentReview(res.data.review);
            const percentageCompleted = (res.data.completed_lesson?.length / res.data.lectures?.length) * 100;
            setCompletionPercentage(percentageCompleted?.toFixed(0));
        });
    };

    const [materials, setMaterials] = useState([]);


    const fetchCourseMaterials = async () => {
    const courseId = course.course?.course_id;
    if (!courseId) return;

    try {
        const res = await useAxios.get(`/course/${courseId}/materials/`);
        setMaterials(res.data);
        console.log("Material IDs:", res.data.map((m) => m.id));
        
    } catch (error) {
        console.error("Failed to load course materials", error);
    }
    };


    useEffect(() => {
        fetchCourseDetail();
    }, []);
    useEffect(() => {
        if (course.course?.id) {
            fetchAvailableGroups();
            fetchCourseMaterials();  
        }
      }, [course]);

    // console.log(studentReview);
    const handleMarkLessonAsCompleted = (variantItemId) => {
        const key = `lecture_${variantItemId}`;
        setMarkAsCompletedStatus({
            ...markAsCompletedStatus,
            [key]: "Updating",
        });

        const formdata = new FormData();
        formdata.append("user_id", UserData()?.user_id || 0);
        formdata.append("course_id", course.course?.id);
        formdata.append("variant_item_id", variantItemId);

        useAxios.post(`student/course-completed/`, formdata).then((res) => {
            fetchCourseDetail();
            setMarkAsCompletedStatus({
                ...markAsCompletedStatus,
                [key]: "Updated",
            });
        });
    };

    const handleNoteChange = (event) => {
        setCreateNote({
            ...createNote,
            [event.target.name]: event.target.value,
        });
    };

    const handleSubmitCreateNote = async (e) => {
        e.preventDefault();
        const formdata = new FormData();

        formdata.append("user_id", UserData()?.user_id);
        formdata.append("enrollment_id", param.enrollment_id);
        formdata.append("title", createNote.title);
        formdata.append("note", createNote.note);

        try {
            await useAxios.post(`student/course-note/${UserData()?.user_id}/${param.enrollment_id}/`, formdata).then((res) => {
                fetchCourseDetail();
                handleNoteClose();
                Toast().fire({
                    icon: "success",
                    title: "Note created",
                });
            });
        } catch (error) {
            console.log(error);
        }
    };

    const handleSubmitEditNote = (e, noteId) => {
        e.preventDefault();
        const formdata = new FormData();

        formdata.append("user_id", UserData()?.user_id);
        formdata.append("enrollment_id", param.enrollment_id);
        formdata.append("title", createNote.title || selectedNote?.title);
        formdata.append("note", createNote.note || selectedNote?.note);

        useAxios.patch(`student/course-note-detail/${UserData()?.user_id}/${param.enrollment_id}/${noteId}/`, formdata).then((res) => {
            fetchCourseDetail();
            Toast().fire({
                icon: "success",
                title: "Note updated",
            });
        });
    };

    const handleDeleteNote = (noteId) => {
        useAxios.delete(`student/course-note-detail/${UserData()?.user_id}/${param.enrollment_id}/${noteId}/`).then((res) => {
            fetchCourseDetail();
            Toast().fire({
                icon: "success",
                title: "Note deleted",
            });
        });
    };

    const handleMessageChange = (event) => {
        setCreateMessage({
            ...createMessage,
            [event.target.name]: event.target.value,
        });
    };

    const handleSaveQuestion = async (e) => {
        e.preventDefault();
        const formdata = new FormData();

        formdata.append("course_id", course.course?.id);
        formdata.append("user_id", UserData()?.user_id);
        formdata.append("title", createMessage.title);
        formdata.append("message", createMessage.message);

        await useAxios.post(`student/question-answer-list-create/${course.course?.id}/`, formdata).then((res) => {
            fetchCourseDetail();
            handleQuestionClose();
            Toast().fire({
                icon: "success",
                title: "Question sent",
            });
        });
    };

    const sendNewMessage = async (e) => {
        e.preventDefault();
        const formdata = new FormData();
        formdata.append("course_id", course.course?.id);
        formdata.append("user_id", UserData()?.user_id);
        formdata.append("message", createMessage.message);
        formdata.append("qa_id", selectedConversation?.qa_id);

        useAxios.post(`student/question-answer-message-create/`, formdata).then((res) => {
            setSelectedConversation(res.data.question);
        });
    };

    useEffect(() => {
        if (lastElementRef.current) {
            lastElementRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [selectedConversation]);

    const handleSearchQuestion = (event) => {
        const query = event.target.value.toLowerCase();
        if (query === "") {
            fetchCourseDetail();
        } else {
            const filtered = questions?.filter((question) => {
                return question.title.toLowerCase().includes(query);
            });
            setQuestions(filtered);
        }
    };

    const handleReviewChange = (event) => {
        setCreateReview({
            ...createReview,
            [event.target.name]: event.target.value,
        });
    };

    const handleCreateReviewSubmit = (e) => {
        e.preventDefault();

        const formdata = new FormData();
        formdata.append("course_id", course.course?.id);
        formdata.append("user_id", UserData()?.user_id);
        formdata.append("rating", createReview?.rating);
        formdata.append("review", createReview?.review);

        useAxios.post(`student/rate-course/`, formdata).then((res) => {
            console.log(res.data);
            fetchCourseDetail();
            Toast().fire({
                icon: "success",
                title: "Review created",
            });
        });
    };

    const handleUpdateReviewSubmit = (e) => {
        e.preventDefault();

        const formdata = new FormData();
        formdata.append("course", course.course?.id);
        formdata.append("user", UserData()?.user_id);
        formdata.append("rating", createReview?.rating || studentReview?.rating);
        formdata.append("review", createReview?.review || studentReview?.review);

        useAxios.patch(`student/review-detail/${UserData()?.user_id}/${studentReview?.id}/`, formdata).then((res) => {
            console.log(res.data);
            fetchCourseDetail();
            Toast().fire({
                icon: "success",
                title: "Review updated",
            });
        });
    };


    return (
        <>
            <BaseHeader />

            <section className="pt-5 pb-5">
                <div className="container">
                    {/* Header Here */}
                    <Header />
                    <div className="row mt-0 mt-md-4">
                        {/* Sidebar Here */}
                        <Sidebar />
                        <div className="col-lg-9 col-md-8 col-12">
                            {/* <section className="bg-blue py-7">
                <div className="container">
                  <ReactPlayer url='https://www.youtube.com/watch?v=LXb3EKWsInQ' width={"100%"} height={600} />
                </div>
              </section> */}
                            <section className="mt-4">
                                <div className="container">
                                    <div className="row">
                                        {/* Main content START */}
                                        <div className="col-12">
                                            <div className="card shadow rounded-2 p-0 mt-n5">
                                                {/* Tabs START */}
                                                <div className="card-header border-bottom px-4 pt-3 pb-0">
                                                    <ul className="nav nav-bottom-line py-0" id="course-pills-tab" role="tablist">
                                                        {/* Tab item */}
                                                        <li className="nav-item me-2 me-sm-4" role="presentation">
                                                            <button className="nav-link mb-2 mb-md-0 active" id="course-pills-tab-1" data-bs-toggle="pill" data-bs-target="#course-pills-1" type="button" role="tab" aria-controls="course-pills-1" aria-selected="true">
                                                                Course Lectures
                                                            </button>
                                                        </li>
                                                        {/* Tab item */}
                                                        <li className="nav-item me-2 me-sm-4" role="presentation">
                                                            <button className="nav-link mb-2 mb-md-0" id="course-pills-tab-2" data-bs-toggle="pill" data-bs-target="#course-pills-2" type="button" role="tab" aria-controls="course-pills-2" aria-selected="false">
                                                                Notes
                                                            </button>
                                                        </li>
                                                        {/* Tab item */}
                                                        <li className="nav-item me-2 me-sm-4" role="presentation">
                                                            <button className="nav-link mb-2 mb-md-0" id="course-pills-tab-3" data-bs-toggle="pill" data-bs-target="#course-pills-3" type="button" role="tab" aria-controls="course-pills-3" aria-selected="false">
                                                                Discussion
                                                            </button>
                                                        </li>

                                                        <li className="nav-item me-2 me-sm-4" role="presentation">
                                                            <button className="nav-link mb-2 mb-md-0" id="course-pills-tab-4" data-bs-toggle="pill" data-bs-target="#course-pills-4" type="button" role="tab" aria-controls="course-pills-4" aria-selected="false">
                                                                Study Groups
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                                {/* Tabs END */}
                                                {/* Tab contents START */}
                                                <div className="card-body p-sm-4">
                                                    <div className="tab-content" id="course-pills-tabContent">
                                                        {/* Content START */}
                                                        <div className="tab-pane fade show active" id="course-pills-1" role="tabpanel" aria-labelledby="course-pills-tab-1">
                                                        {/* Accordion START */}
                                                        <div className="accordion accordion-icon accordion-border" id="accordionExample2">
                                                        <div className="progress mb-3">
                                                            {/* Progress bar logic if needed */}
                                                        </div>

                                                        <div className="accordion-item mb-3 p-3 bg-light">
                                                            <h6 className="accordion-header font-base" id="heading-materials">
                                                            <button
                                                                className="accordion-button p-3 w-100 bg-light btn border fw-bold rounded d-sm-flex d-inline-block collapsed"
                                                                type="button"
                                                                data-bs-toggle="collapse"
                                                                data-bs-target="#collapse-materials"
                                                                aria-expanded="true"
                                                                aria-controls="collapse-materials"
                                                            >
                                                                Course Materials
                                                                <span className="small ms-0 ms-sm-2">({materials.length} Item{materials.length !== 1 && "s"})</span>
                                                            </button>
                                                            </h6>

                                                            <div
                                                            id="collapse-materials"
                                                            className="accordion-collapse collapse show"
                                                            aria-labelledby="heading-materials"
                                                            data-bs-parent="#accordionExample2"
                                                            >
                                                            <div className="accordion-body mt-3">
                                                                {materials.length > 0 ? (
                                                                materials.map((material) => (
                                                                    <div key={material.id} className="mb-3 p-3 border rounded">
                                                                    <h6>{material.title}</h6>

                                                                    {/* File preview */}
                                                                    {material.file.endsWith(".mp4") ? (
                                                                    <video width="100%" controls>
                                                                        <source src={material.file} type="video/mp4" />
                                                                        Your browser does not support the video tag.
                                                                    </video>
                                                                    ) : material.file.match(/\.(jpe?g|png|gif)$/i) ? (
                                                                    <img
                                                                        src={material.file}
                                                                        alt={material.title}
                                                                        className="img-fluid mb-2"
                                                                        style={{ maxHeight: "200px", objectFit: "contain" }}
                                                                    />
                                                                    ) : (
                                                                    <p className="text-muted mb-2">
                                                                        No preview available for this file type.
                                                                    </p>
                                                                    )}



                                                                    {/* View button */}
                                                                    <a
                                                                        href={material.file}
                                                                        className="btn btn-sm btn-primary mt-2"
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        View
                                                                    </a>
                                                                    </div>
                                                                ))
                                                                ) : (
                                                                <p className="text-muted">No course materials available.</p>
                                                                )}
                                                            </div>
                                                            </div>
                                                        </div>
                                                        </div>
                                                        {/* Accordion END */}

                                                        </div>

                                                        <div className="tab-pane fade" id="course-pills-2" role="tabpanel" aria-labelledby="course-pills-tab-2">
                                                            <div className="card">
                                                                <div className="card-header border-bottom p-0 pb-3">
                                                                    <div className="d-sm-flex justify-content-between align-items-center">
                                                                        <h4 className="mb-0 p-3">All Notes</h4>
                                                                        {/* Add Note Modal */}
                                                                        <button type="button" className="btn btn-primary me-3" data-bs-toggle="modal" data-bs-target="#exampleModal">
                                                                            Add Note <i className="fas fa-pen"></i>
                                                                        </button>
                                                                        <div className="modal fade" id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
                                                                            <div className="modal-dialog modal-dialog-centered">
                                                                                <div className="modal-content">
                                                                                    <div className="modal-header">
                                                                                        <h5 className="modal-title" id="exampleModalLabel">
                                                                                            Add New Note <i className="fas fa-pen"></i>
                                                                                        </h5>
                                                                                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                                                                                    </div>
                                                                                    <div className="modal-body">
                                                                                        <form onSubmit={handleSubmitCreateNote}>
                                                                                            <div className="mb-3">
                                                                                                <label htmlFor="exampleInputEmail1" className="form-label">
                                                                                                    Note Title
                                                                                                </label>
                                                                                                <input type="text" className="form-control" name="title" onChange={handleNoteChange} />
                                                                                            </div>
                                                                                            <div className="mb-3">
                                                                                                <label htmlFor="exampleInputPassword1" className="form-label">
                                                                                                    Note Content
                                                                                                </label>
                                                                                                <textarea className="form-control" id="" cols="30" rows="10" name="note" onChange={handleNoteChange}></textarea>
                                                                                            </div>
                                                                                            <button type="button" className="btn btn-secondary me-2" data-bs-dismiss="modal">
                                                                                                <i className="fas fa-arrow-left"></i> Close
                                                                                            </button>
                                                                                            <button type="submit" className="btn btn-primary">
                                                                                                Save Note <i className="fas fa-check-circle"></i>
                                                                                            </button>
                                                                                        </form>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="card-body p-0 pt-3">
                                                                    {/* Note item start */}
                                                                    {course?.note?.map((n, index) => (
                                                                        <div className="row g-4 p-3" key={n.id || index}>
                                                                            <div className="col-sm-11 col-xl-11 shadow p-3 m-3 rounded">
                                                                                <h5> {n.title}</h5>
                                                                                <p>{n.note}</p>
                                                                                {/* Buttons */}
                                                                                <div className="hstack gap-3 flex-wrap">
                                                                                    <a onClick={() => handleNoteShow(n)} className="btn btn-success mb-0">
                                                                                        <i className="bi bi-pencil-square me-2" /> Edit
                                                                                    </a>
                                                                                    <a onClick={() => handleDeleteNote(n.id)} className="btn btn-danger mb-0">
                                                                                        <i className="bi bi-trash me-2" /> Delete
                                                                                    </a>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}

                                                                    {course?.note?.length < 1 && <p className="mt-3 p-3">No notes</p>}
                                                                    <hr />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="tab-pane fade" id="course-pills-3" role="tabpanel" aria-labelledby="course-pills-tab-3">
                                                            <div className="card">
                                                                {/* Card header */}
                                                                <div className="card-header border-bottom p-0 pb-3">
                                                                    {/* Title */}
                                                                    <h4 className="mb-3 p-3">Discussion</h4>
                                                                    <form className="row g-4 p-3">
                                                                        {/* Search */}
                                                                        <div className="col-sm-6 col-lg-9">
                                                                            <div className="position-relative">
                                                                                <input className="form-control pe-5 bg-transparent" type="search" placeholder="Search" aria-label="Search" onChange={handleSearchQuestion} />
                                                                                <button className="bg-transparent p-2 position-absolute top-50 end-0 translate-middle-y border-0 text-primary-hover text-reset" type="submit">
                                                                                    <i className="fas fa-search fs-6 " />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-sm-6 col-lg-3">
                                                                            <a onClick={handleQuestionShow} className="btn btn-primary mb-0 w-100" data-bs-toggle="modal" data-bs-target="#modalCreatePost">
                                                                                Ask Question
                                                                            </a>
                                                                        </div>
                                                                    </form>
                                                                </div>
                                                                {/* Card body */}
                                                                <div className="card-body p-0 pt-3">
                                                                    <div className="vstack gap-3 p-3">
                                                                        {/* Question item START */}
                                                                        {questions?.map((q, index) => (
                                                                            <div className="shadow rounded-3 p-3" key={q.qa_id || index}>
                                                                                <div className="d-sm-flex justify-content-sm-between mb-3">
                                                                                    <div className="d-flex align-items-center">
                                                                                        <div className="avatar avatar-sm flex-shrink-0"></div>
                                                                                        <div className="ms-2">
                                                                                            <h6 className="mb-0">
                                                                                                <a href="#" className="text-decoration-none text-dark">
                                                                                                    {q.profile.full_name}
                                                                                                </a>
                                                                                            </h6>
                                                                                            <small>{moment(q.date).format("DD MMM, YYYY")}</small>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <h5>{q.title}</h5>
                                                                                <button className="btn btn-primary btn-sm mb-3 mt-3" onClick={() => handleConversationShow(q)}>
                                                                                    Join Conversation <i className="fas fa-arrow-right"></i>
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="tab-pane fade" id="course-pills-4" role="tabpanel" aria-labelledby="course-pills-tab-4">
                                                            <div className="card">
                                                                <div className="card-header border-bottom p-0 pb-3">
                                                                <h4 className="mb-3 p-3">Available Study Groups</h4>
                                                                </div>
                                                                <div className="card-body">
                                                                {availableGroups.length > 0 ? (
                                                                    availableGroups.map((group) => (
                                                                    <div className="card p-3 mb-3" key={group.id}>
                                                                        <h5>{group.name}</h5>
                                                                        <p className="text-muted">
                                                                        Created on {moment(group.date_created).format("DD MMM, YYYY")}
                                                                        </p>
                                                                        <button className="btn btn-primary" onClick={() => handleJoinGroup(group.id)}>
                                                                        Join Group
                                                                        </button>
                                                                    </div>
                                                                    ))
                                                                ) : (
                                                                    <p className="p-3">You have joined all study groups for this course.</p>
                                                                )}
                                                                </div>
                                                            </div>
                                                            </div>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </section>

            {/* Lecture Modal */}
            <Modal show={show} size="lg" onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Lesson: {variantItem?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ReactPlayer url={variantItem?.file} controls width={"100%"} height={"100%"} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Note Edit Modal */}
            <Modal show={noteShow} size="lg" onHide={handleNoteClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Note: {selectedNote?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={(e) => handleSubmitEditNote(e, selectedNote?.id)}>
                        <div className="mb-3">
                            <label htmlFor="exampleInputEmail1" className="form-label">
                                Note Title
                            </label>
                            <input defaultValue={selectedNote?.title} name="title" onChange={handleNoteChange} type="text" className="form-control" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="exampleInputPassword1" className="form-label">
                                Note Content
                            </label>
                            <textarea defaultValue={selectedNote?.note} name="note" onChange={handleNoteChange} className="form-control" cols="30" rows="10"></textarea>
                        </div>
                        <button type="button" className="btn btn-secondary me-2" onClick={handleNoteClose}>
                            <i className="fas fa-arrow-left"></i> Close
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Save Note <i className="fas fa-check-circle"></i>
                        </button>
                    </form>
                </Modal.Body>
            </Modal>

            {/* Conversation Modal */}
            <Modal show={ConversationShow} size="lg" onHide={handleConversationClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Lesson: {selectedConversation?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="border p-2 p-sm-4 rounded-3">
                        <ul className="list-unstyled mb-0" style={{ overflowY: "scroll", height: "500px" }}>
                            {selectedConversation?.messages?.map((m, index) => (
                                <li className="comment-item mb-3" key={m.id || index}>
                                    <div className="d-flex">
                                        <div className="ms-2">
                                            {/* Comment by */}
                                            <div className="bg-light p-3 rounded w-100">
                                                <div className="d-flex w-100 justify-content-center">
                                                    <div className="me-2 ">
                                                        <h6 className="mb-1 lead fw-bold">
                                                            <a href="#!" className="text-decoration-none text-dark">
                                                                {" "}
                                                                {m.profile.full_name}{" "}
                                                            </a>
                                                            <br />
                                                            <span style={{ fontSize: "12px", color: "gray" }}>{moment(m.date).format("DD MMM, YYYY")}</span>
                                                        </h6>
                                                        <p className="mb-0 mt-3  ">{m.message}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}

                            <div ref={lastElementRef}></div>
                        </ul>

                        <form class="w-100 d-flex" onSubmit={sendNewMessage}>
                            <textarea name="message" class="one form-control pe-4 bg-light w-75" id="autoheighttextarea" rows="2" onChange={handleMessageChange} placeholder="What's your question?"></textarea>
                            <button class="btn btn-primary ms-2 mb-0 w-25" type="submit">
                                Post <i className="fas fa-paper-plane"></i>
                            </button>
                        </form>

                        {/* <form class="w-100">
              <input
                name="title"
                type="text"
                className="form-control mb-2"
                placeholder="Question Title"
              />
              <textarea
                name="message"
                class="one form-control pe-4 mb-2 bg-light"
                id="autoheighttextarea"
                rows="5"
                placeholder="What's your question?"
              ></textarea>
              <button class="btn btn-primary mb-0 w-25" type="button">
                Post <i className="fas fa-paper-plane"></i>
              </button>
            </form> */}
                    </div>
                </Modal.Body>
            </Modal>

            {/* Ask Question Modal */}
            {/* Note Edit Modal */}
            <Modal show={addQuestionShow} size="lg" onHide={handleQuestionClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Ask Question</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleSaveQuestion}>
                        <div className="mb-3">
                            <label htmlFor="exampleInputEmail1" className="form-label">
                                Question Title
                            </label>
                            <input value={createMessage.title} name="title" onChange={handleMessageChange} type="text" className="form-control" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="exampleInputPassword1" className="form-label">
                                Question Message
                            </label>
                            <textarea value={createMessage.message} name="message" onChange={handleMessageChange} className="form-control" cols="30" rows="10"></textarea>
                        </div>
                        <button type="button" className="btn btn-secondary me-2" onClick={handleQuestionClose}>
                            <i className="fas fa-arrow-left"></i> Close
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Send Message <i className="fas fa-check-circle"></i>
                        </button>
                    </form>
                </Modal.Body>
            </Modal>


        </>
    );
}

export default CourseDetail;
