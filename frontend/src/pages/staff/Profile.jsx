import "../../styles/admin.css";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const navigate = useNavigate(); 

    return (
        <main className="profile-container">
            <h1 className="text-[#313639] text-4xl mb-2 tracking-wide">
                Profile 
            </h1>
        </main>
    );
};

export default Profile;
