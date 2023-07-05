import { Link } from "react-router-dom";
import "../MyStyleComponents/my-styles.css";
import {
  CreateNewFolder,
  More,
} from "@mui/icons-material";
const iconStyle = {
  backgroundColor: "#6EC7DF",
  iconFontSize: 64,
};
export const OperatorFeatures = () => {
  return (
    <div className="flex flex-col h-screen items-center justify-center bg-blue-100 bg1">
      <div className="bg-slate-100 px-20 py-5 container1">
        <p className="menu-title">Operator Dash Board</p>
        <div
          style={{ gap: "40px" }}
          className="flex-container-row cards-container"
        >
          <div className="card flex-container-column">
            <div className="card-item flex-container-column">
              <p className="title fontWeight500">View Session</p>

              <CreateNewFolder
                sx={{ fontSize: iconStyle.iconFontSize }}
                style={{ color: iconStyle.backgroundColor }}
              ></CreateNewFolder>
            </div>
            <Link to={"/sessions"}>
              <button className="bg-[#6EC7DF] hover:bg-[#2691b4] text-white rounded-lg card-item card-item-button">
                View Session
              </button>
            </Link>
          </div>
          <div className="card flex-container-column">
            <div className="card-item flex-container-column">
              <p className="title fontWeight500">More To Come</p>

              <More
                sx={{ fontSize: iconStyle.iconFontSize }}
                style={{ color: iconStyle.backgroundColor }}
              ></More>
            </div>
            <button className="bg-[#6EC7DF] hover:bg-[#2691b4] text-white rounded-lg card-item card-item-button">
              More To Come
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
