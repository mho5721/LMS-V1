import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAxios from "../../utils/useAxios";
import BaseHeader from "../partials/BaseHeader";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

function CourseEditCurriculum() {
  const { course_id } = useParams();
  const [materials, setMaterials] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [materialTitle, setMaterialTitle] = useState("");

  const api = useAxios; // <--- missing call if useAxios is a hook!

  const fetchMaterials = async () => {
    try {
      const response = await api.get(`/course/${course_id}/materials/`);
      setMaterials(response.data);
    } catch (error) {
      console.error("Error fetching materials", error);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [course_id]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !materialTitle.trim()) return;

    const formData = new FormData();
    formData.append("course", course_id);
    formData.append("title", materialTitle.trim());
    formData.append("file", selectedFile);
    console.log("Uploading for course_id =", course_id);

    try {
      setUploading(true);
      await api.post(`/course/materials/upload/`, formData, {

        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSelectedFile(null);
      setMaterialTitle("");
      fetchMaterials(); // Refresh the list
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <BaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="col-lg-9 col-md-8 col-12">
              <section className="pb-8 mt-5">
                <div className="card mb-3">
                  <div className="card-header border-bottom px-4 py-3">
                    <h4 className="mb-0">Edit Curriculum / Materials</h4>
                  </div>

                  <div className="card-body">

                    {/* Upload Section */}
                    <div className="mb-4">
                      <h5>Upload New Material</h5>

                      {/* Material Title */}
                      <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Enter Material Title (e.g., Lecture 1 Notes)"
                        value={materialTitle}
                        onChange={(e) => setMaterialTitle(e.target.value)}
                      />

                      {/* File Upload */}
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="form-control"
                      />

                      <button
                        className="btn btn-primary mt-2"
                        type="button"
                        onClick={handleUpload}
                        disabled={uploading}
                      >
                        {uploading ? "Uploading..." : "Upload Material"}
                      </button>
                    </div>

                    {/* Uploaded Materials List */}
                    <div>
                      <h5>Uploaded Materials</h5>
                      {materials.length > 0 ? (
                        <ul className="list-group">
                          {materials.map((material) => (
                            <li
                              key={material.id}
                              className="list-group-item d-flex justify-content-between align-items-center"
                            >
                              <a
                                href={material.file}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {material.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No materials uploaded yet.</p>
                      )}
                    </div>

                  </div>
                </div>
              </section>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

export default CourseEditCurriculum;
