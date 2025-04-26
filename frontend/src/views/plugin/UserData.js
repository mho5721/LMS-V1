import jwt_decode from "jwt-decode";
import Cookie from "js-cookie";

const UserData = () => {
  try {
    const token = Cookie.get("access_token");
    if (!token) return null;

    const decoded = jwt_decode(token);
    return decoded;
  } catch (error) {
    console.error("UserData decoding failed:", error);
    return null;
  }
};

export default UserData;
