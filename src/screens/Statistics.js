import React, { useEffect, useState } from "react";
import axiosClient from "../http/axiosClient";
import MenuBarHP from "../components/MenuBarHP";
import bronzeMedal from '../assets/images/bronze.png'; // Import images
import silverMedal from '../assets/images/silver.png';
import goldMedal from '../assets/images/gold.png';
import platinumMedal from '../assets/images/platinum.png';

const Statistics = () => {
  const [completedTasks, setCompletedTasks] = useState(0);
  const parentId = localStorage.getItem("parentId");
  const googleId = localStorage.getItem("googleId");

  useEffect(() => {
    if (!parentId && !googleId) {
      window.location.replace("/login");
    }
  }, [parentId, googleId]);

  useEffect(() => {
    fetchCompletedTasks();
  }, []);

  const fetchCompletedTasks = () => {
    axiosClient
      .get("/completed-tasks", {
        params: { parentId }
      })
      .then((response) => {
        const completed = response.data.length;
        setCompletedTasks(completed);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const calculateMedals = () => {
    let bronzeMedals = 0;
    let silverMedals = 0;
    let goldMedals = 0;
    let platinumMedals = 0;

    bronzeMedals = Math.min(5, Math.floor(completedTasks / 5));

    if (completedTasks >= 25) {
      silverMedals = Math.min(5, Math.floor((completedTasks - 25) / 5));
      bronzeMedals = 5;
    }

    if (completedTasks >= 50) {
      goldMedals = Math.min(5, Math.floor((completedTasks - 50) / 5));
      silverMedals = 5;
    }

    if (completedTasks >= 75) {
      platinumMedals = Math.floor((completedTasks - 75) / 5);
      goldMedals = 5;
    }

    return {
      bronze: bronzeMedals,
      silver: silverMedals,
      gold: goldMedals,
      platinum: platinumMedals,
    };
  };

  const medals = calculateMedals();

  const renderMedals = (count, image) => {
    return Array(count).fill(null).map((_, index) => (
      <img key={index} src={image} alt="medal" style={{ width: '50px', margin: '5px' }} />
    ));
  };

  return (
    <form>
      <MenuBarHP />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "50px",
          boxSizing: "border-box",
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
            Medalje
          </h1>
          <div
            style={{
              marginTop: "30px",
              maxHeight: "auto",
              maxWidth: "900px",
              textAlign: "center",
            }}
          >
            <p><strong>Završeni zadaci:</strong> {completedTasks}</p>

            {/* Renderovanje medalja */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap', // Omogućava prelazak u novi red
                justifyContent: 'center',
                gap: '10px', // Razmak između medalja
                maxWidth: '350px', // Ograničava širinu kako bi maksimalno 5 medalja stalo u jedan red
              }}
            >
              {renderMedals(medals.bronze, bronzeMedal)}
              {renderMedals(medals.silver, silverMedal)}
              {renderMedals(medals.gold, goldMedal)}
              {renderMedals(medals.platinum, platinumMedal)}
            </div>

            {/* Ako nema medalja */}
            {medals.bronze === 0 && medals.silver === 0 && medals.gold === 0 && medals.platinum === 0 && (
              <p style={{ color: 'red' }}>Dijete nema medalja</p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};

export default Statistics;
