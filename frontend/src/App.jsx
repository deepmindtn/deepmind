// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";
import WellbeingTechniques from "./pages/WellbeingTechniques";
// Public pages
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import AcceptInvite from "./components/AcceptInvite";

// Layout / auth guard
import ProtectedRoute from "./components/ProtectedRoute";
import LayoutComponent from "./components/LayoutModel/LayoutComponent";

// Dashboard & pages
import Dashboard from "./pages/dashboard/Dashboard";
import Profile from "./components/Profile/Profile";
import Employees from "./pages/Employees";
import Scheduling from "./pages/Scheduling";
import SendAssessment from "./pages/Assessement/AssessementPage";
import MyAssessments from "./pages/MyAssessments";

// Assessment runners (opened via ?assignment=ID)
import BigFiveTest from "./pages/Assessement/BigFiveTest";
import KarasekTest from "./pages/Assessement/KarasekTest";
import MaslachTest from "./pages/Assessement/MaslachTest";
import DiscTest from "./pages/Assessement/DiscTest";
import JssTest from "./pages/Assessement/JssTest";
import BrsTest from "./pages/Assessement/BrsTest";

// 🧩 New Assessments

import ReportPage from "./pages/ReportPage";
import CDRISCTest from "./pages/Assessement/CdriskTest";
import WSESTest from "./pages/Assessement/WsesTest";
import GCOSTest from "./pages/Assessement/GcosTest";
import RIBSTest from "./pages/Assessement/RibsTest";
import CAQTest from "./pages/Assessement/CaqTest";
import ISETest from "./pages/Assessement/IseTest";
import RecruitmentMatch from "./pages/RecruitmentMatch";
import AssessmentDescription from "./components/AssessmentDescription";
import Departments from "./pages/Departments";

// Temporary stubs
const Analytics = () => <h1>Mental Health Analytics Page</h1>;
const Interventions = () => <h1>Early Interventions Page</h1>;
const Reports = () => <h1>Reports & Insights Page</h1>;

function App() {
  return (
    <Router>
      <Routes>
        {/* ------- Public ------- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />

        {/* ------- Protected with layout ------- */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <Dashboard />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruitment"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <RecruitmentMatch />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />

        <Route
          path="/assesement-description"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <AssessmentDescription />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />

        <Route
          path="/departments"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <Departments />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <Profile />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />

        <Route
          path="/report/:id"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <ReportPage />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <Employees />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <Analytics />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />

        <Route
          path="/assessments"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <SendAssessment />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />

        {/* 👇 Employee’s personal list */}
        <Route
          path="/my-assessments"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <MyAssessments />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />

        <Route
          path="/wellbeing-techniques"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <WellbeingTechniques />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />

        <Route
          path="/interventions"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <Interventions />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />

        <Route
          path="/scheduling"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <Scheduling />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <Reports />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />

        {/* ------- Assessment runners (also protected) ------- */}
        <Route
          path="/big-five"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <BigFiveTest />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />

        <Route
          path="/disc"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <DiscTest />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />

        <Route
          path="/brs"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <BrsTest />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />

        <Route
          path="/jss"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <JssTest />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />

        <Route
          path="/karasek"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <KarasekTest />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />

        <Route
          path="/maslach"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <MaslachTest />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />

        {/* ------- 🔥 New Resilience, Motivation & Innovation Assessments ------- */}
        <Route
          path="/cdrisc"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <CDRISCTest />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />

        <Route
          path="/wses"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <WSESTest />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />

        <Route
          path="/gcos"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <GCOSTest />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ribs"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <RIBSTest />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />

        <Route
          path="/caq"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <CAQTest />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ise"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <ISETest />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
