import React, { useContext } from "react";

import GlobalContext from "../context/GlobalContext";
function CreateEventButton() {
  const { setShowEventModal } = useContext(GlobalContext);
  return (
    <button
      onClick={() => setShowEventModal(true)}
      style={{
        border: "1px solid",
        padding: "0.5rem",
        marginTop: "100px",
        borderRadius: "9999px",
        display: "flex",
        alignItems: "center",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.3)",
        backgroundColor: "white",
        ":hover": {
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.5)",
        },
      }}
    >
      <img
        src="/assets/images/plus.svg"
        alt="create_event"
        style={{ width: "1.75rem", height: "1.75rem" }}
      />
      <span style={{ paddingLeft: "0.75rem", paddingRight: "1.75rem" }}>
        Kreiraj zadatak
      </span>
    </button>
  );
}
export default CreateEventButton;
