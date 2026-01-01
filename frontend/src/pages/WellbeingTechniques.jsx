import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
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
    <div className="wellbeing-page">
      {!mode && <WellBeingChoice onSelect={setMode} />}

      {mode && (
        <>
          <button className="back-btn" onClick={handleBack}>
            <ArrowLeft className="back-icon" />
            Back
          </button>

          {mode === "mindfulness" && <Mindfulness />}
          {mode === "physical" && <Physical />}
          {mode === "emotional" && <Emotional />}
          {mode === "daily" && <DailyChallenges />}
        </>
      )}
    </div>
  );
};

export default WellBeingPage;
