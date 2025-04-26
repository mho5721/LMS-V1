import { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileContext } from "../plugin/Context";

const Redirector = () => {
  const navigate = useNavigate();
  const [profile] = useContext(ProfileContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile || Object.keys(profile).length === 0) {
      // Still loading
      return;
    }

    setLoading(false);

    if (!profile?.user) {
      navigate("/login/");
    } else if (profile?.is_instructor) {
      navigate("/instructor/dashboard/");
    } else {
      navigate("/student/dashboard/");
    }
  }, [profile, navigate]);

  if (loading) return <div>Loading...</div>;
  return null;
};

export default Redirector;
