import React, { useEffect, useState } from "react";
import axios from "axios";
import MenuBarHP from "../components/MenuBarHP";

const Statistics = () => {
  const [data, setData] = useState([]);
  const parentId = localStorage.getItem("parentId");

  useEffect(() => {
    if (!parentId) {
      window.location.replace("/login");
    }
  }, [parentId]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    axios
      .get("http://localhost:8000/get-tasks")
      .then((response) => {
        //console.log(response.data);
        setData(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const calculateAverageDuration = (activityName) => {
    const filteredData = data.filter(
      (activity) => activity.activity === activityName
    );

    if (filteredData.length === 0) {
      return "N/A";
    }

    const totalDuration = filteredData.reduce((sum, activity) => {
      const startTime = new Date(activity.userStartTime);
      const endTime = new Date(activity.userEndTime);
      const duration = endTime - startTime;
      return sum + duration;
    }, 0);

    const averageDuration = totalDuration / filteredData.length;
    const averageHours = Math.floor(averageDuration / 3600000);
    const averageMinutes = Math.floor((averageDuration % 3600000) / 60000);

    return `${averageHours}h ${averageMinutes}m`;
  };

  const filteredData = data.filter(
    (activity, index, self) =>
      activity.status === 2 &&
      index === self.findIndex((a) => a.activity === activity.activity)
  );

  return (
    <form>
      <MenuBarHP />
      {/* Add the MenuBarHP component here */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "50px",
          boxSizing: "border-box",
          backgroundColor: "#f8f9fa",
        }}
      >
        <div
          style={{
            width: "100%",
            margin: "auto",
            backgroundColor: "#fff",
            boxShadow: "0px 14px 80px rgba(34, 35, 58, 0.2)",
            padding: "100px 100px 155px 100px",
            borderRadius: "15px",
            transition: "all 0.3s",
            textAlign: "left",
          }}
        >
          <h1 style={{ textAlign: "center", fontSize: "30px", color: "black" }}>
            STATISTIKA
          </h1>
          <div
            style={{
              marginTop: "30px",
              overflowX: "auto",
              maxHeight: "300px", // Add max height to enable scrolling
              maxWidth: "900px",
            }}
          >
            <table
              style={{
                borderWidth: "4px", // Specify the border width
                borderCollapse: "collapse",
                width: "100%",
                backgroundColor: "#fff",
                fontSize: "20px", // Adjust the font size
                color: "#000", // Set the text color to black
              }}
            >
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: "#E6E6FA",
                }}
              >
                <tr>
                  <th
                    style={{
                      padding: "10px",
                      color: "black",
                      borderBottom: "2px solid #000", // Add a thicker bottom border
                      textAlign: "center",
                      borderWidth: "4px",
                    }}
                  >
                    Aktivnosti
                  </th>

                  <th
                    style={{
                      padding: "10px",
                      color: "black",
                      borderBottom: "2px solid #000", // Add a thicker bottom border
                      textAlign: "center",
                      borderWidth: "4px",
                    }}
                  >
                    Mjesto
                  </th>
                  <th
                    style={{
                      padding: "20px",
                      color: "black",
                      borderBottom: "2px solid #000", // Add a thicker bottom border
                      textAlign: "center",
                      borderWidth: "4px",
                    }}
                  >
                    Prosječno trajanje
                  </th>
                </tr>
              </thead>
              <tbody
                style={{
                  borderWidth: "4px", // Specify the border width
                }}
              >
                {filteredData.map((activity, index) => (
                  <tr key={index}>
                    <td
                      style={{
                        padding: "20px",
                        borderBottom: "1px solid #ccc",
                        borderWidth: "4px",
                      }}
                    >
                      {activity.activity}
                    </td>

                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "2px solid #ccc",
                        borderWidth: "4px",
                      }}
                    >
                      {activity.location}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #ccc",
                        borderWidth: "4px",
                      }}
                    >
                      {calculateAverageDuration(activity.activity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Statistics;
