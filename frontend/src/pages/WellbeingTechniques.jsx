import React, { useState } from "react";
import "./WellbeingPage.css"; 

import WellBeingChoice from "../components/WellBeingComponents/WellBeingChoice";
import Mindfulness from "../components/WellBeingComponents/Mindfulness";
import Physical from "../components/WellBeingComponents/Physical";
import Emotional from "../components/WellBeingComponents/Emotional";
import DailyChallenges from "../components/WellBeingComponents/DailyChallenges";

const WellBeingPage = () => {
  const [mode, setMode] = useState("");

  const handleBack = () => setMode("");

  return (
    <div className="wellbeing-page-container">
      {/* 1. Selection Screen */}
      {!mode && <WellBeingChoice onSelect={setMode} />}

      {/* 2. Detail Screens */}
      {mode && (
        <div className="detail-view-wrapper">
          {/* We pass handleBack so the button INSIDE Mindfulness works */}
          {mode === "mindfulness" && <Mindfulness onBack={handleBack} />}
          
          {/* Repeat for other components as you build them */}
          {mode === "physical" && <Physical onBack={handleBack} />}
          {mode === "emotional" && <Emotional onBack={handleBack} />}
          {mode === "daily" && <DailyChallenges onBack={handleBack} />}
        </div>
      )}
    </div>
  );
};

export default WellBeingPage;