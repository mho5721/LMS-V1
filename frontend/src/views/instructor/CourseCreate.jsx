import { useState, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import BaseHeader from "../partials/BaseHeader";

import { Link, useNavigate } from "react-router-dom";

import useAxios from "../../utils/useAxios";
import Swal from "sweetalert2";

function CourseCreate() {
    const [courseData, setCourseData] = useState({ title: "", description: "", level: "", language: "", price: "", category: "" });
    const [imageFile, setImageFile] = useState(null);
    const [introFile, setIntroFile] = useState(null);
    const [category, setCategory] = useState([]);
    const navigate = useNavigate();
    const api = useAxios;
    const [imagePreview, setImagePreview] = useState(null);


    useEffect(() => {
        api.get(`course/category/`).then((res) => {
            setCategory(res.data);
        });
    }, []);

    const handleCourseInputChange = (event) => {
        setCourseData({
            ...courseData,
            [event.target.name]: event.target.value,
        });
    };

        const handleImageChange = (event) => {
        const file = event.target.files[0];
        setImageFile(file);
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        }
        };


    const handleIntroVideoChange = (event) => {
        setIntroFile(event.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        Object.keys(courseData).forEach((key) => {
            formData.append(key, courseData[key]);
        });

        if (imageFile) formData.append("image", imageFile);
        if (introFile) formData.append("file", introFile);

        try {
            const response = await api.post(`teacher/course-create/`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            Swal.fire({
                icon: "success",
                title: "Course Created Successfully",
            });

            navigate(`/instructor/edit-course/${response.data.course_id}/`);
        } catch (error) {
            console.error("Course creation failed", error);
            Swal.fire({
                icon: "error",
                title: "Course creation failed",
            });
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
                        <form className="col-lg-9 col-md-8 col-12" onSubmit={handleSubmit}>

                            <section className="py-4 py-lg-6 bg-primary rounded-3">
                                <div className="container">
                                    <div className="row">
                                        <div className="offset-lg-1 col-lg-10 col-md-12 col-12">
                                            <div className="d-lg-flex align-items-center justify-content-between">
                                                <div className="mb-4 mb-lg-0">
                                                    <h1 className="text-white mb-1">Add New Course</h1>
                                                    <p className="mb-0 text-white lead">Just fill the form and create your courses.</p>
                                                </div>
                                                <div>
                                                    <Link to="/instructor/courses/" className="btn" style={{ backgroundColor: "white" }}>
                                                        <i className="fas fa-arrow-left"></i> Back to Course
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="pb-8 mt-5">
                                <div className="card mb-3">
                                    <div className="card-header border-bottom px-4 py-3">
                                        <h4 className="mb-0">Basic Information</h4>
                                    </div>
                                    <div className="card-body">
                                    <label className="form-label">Thumbnail Preview</label>
                                    <img
                                    style={{
                                        width: "100%",
                                        height: "330px",
                                        objectFit: "cover",
                                        borderRadius: "10px",
                                    }}
                                    className="mb-4"
                                    src={imagePreview || "https://www.eclosio.ong/wp-content/uploads/2018/08/default.png"}
                                    alt="thumbnail preview"
                                    />

                                    <div className="mb-3">
                                    <label className="form-label">Course Thumbnail</label>
                                    <input className="form-control" type="file" name="image" onChange={handleImageChange} />
                                    </div>


                                        <div className="mb-3">
                                            <label className="form-label">Intro Video</label>
                                            <input className="form-control" type="file" name="file" onChange={handleIntroVideoChange} />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Title</label>
                                            <input className="form-control" type="text" name="title" onChange={handleCourseInputChange} />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Courses category</label>
                                            <select className="form-select" name="category" onChange={handleCourseInputChange}>
                                                <option value="">-------------</option>
                                                {category?.map((c, index) => (
                                                    <option key={index} value={c.id}>{c.title}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mb-3">
                                            <select className="form-select" onChange={handleCourseInputChange} name="level">
                                                <option value="">Select level</option>
                                                <option value="Beginner">Beginner</option>
                                                <option value="Intemediate">Intemediate</option>
                                                <option value="Advanced">Advanced</option>
                                            </select>
                                        </div>

                                        <div className="mb-3">
                                            <select className="form-select" onChange={handleCourseInputChange} name="language">
                                                <option value="">Select Language</option>
                                                <option value="English">English</option>
                                                <option value="Spanish">Spanish</option>
                                                <option value="French">French</option>
                                            </select>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Course Description</label>
                                            <CKEditor
                                                editor={ClassicEditor}
                                                data=""
                                                onChange={(event, editor) => {
                                                    setCourseData({
                                                        ...courseData,
                                                        description: editor.getData(),
                                                    });
                                                }}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Price</label>
                                            <input className="form-control" type="number" onChange={handleCourseInputChange} name="price" placeholder="$20.99" />
                                        </div>
                                    </div>
                                </div>

                                <button className="btn btn-lg btn-success w-100 mt-2" type="submit">
                                    Create Course <i className="fas fa-check-circle"></i>
                                </button>
                            </section>

                        </form>
                    </div>
                </div>
            </section>
        </>
    );
}

export default CourseCreate;
