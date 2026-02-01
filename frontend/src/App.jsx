// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";

// Public pages
import WellbeingTechniques from "./pages/WellbeingTechniques";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import AcceptInvite from "./components/AcceptInvite";

// Layout / auth guard
import ProtectedRoute from "./components/ProtectedRoute";
import LayoutComponent from "./components/LayoutModel/LayoutComponent";
import CandidateLayout from "./components/LayoutModel/CandidateLayout";

// Dashboard & pages
import Dashboard from "./pages/dashboard/Dashboard";
import Profile from "./components/Profile/Profile";
import Employees from "./pages/Employees";
import Scheduling from "./pages/Scheduling";
import SendAssessment from "./pages/Assessement/AssessementPage";
import MyAssessments from "./pages/MyAssessments";
import EmployeeSurveys from "./pages/EmployeeSurveys";
import EmailTemplates from "./pages/emailtemplates";

// Assessment runners
import BigFiveTest from "./pages/Assessement/BigFiveTest";
import KarasekTest from "./pages/Assessement/KarasekTest";
import MaslachTest from "./pages/Assessement/MaslachTest";
import DiscTest from "./pages/Assessement/DiscTest";
import JssTest from "./pages/Assessement/JssTest";
import BrsTest from "./pages/Assessement/BrsTest";

// New Assessments
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
import ProductivityTools from "./components/ProductivitytoolsComponents/ProductivityTools";
import EisenhowerMatrix from "./components/ProductivitytoolsComponents/EisenhowerMatrix";
import PomodoroTimer from "./components/ProductivitytoolsComponents/Promodorotechnik";
import TakeAssessment from "./pages/Assessement/TakeAssessment";

// Temporary stubs
const Analytics = () => <h1>Mental Health Analytics Page</h1>;
const Interventions = () => <h1>Early Interventions Page</h1>;
const Reports = () => <h1>Reports & Insights Page</h1>;

function App() {
  return (
    <Router>
      <Routes>
        {/* ------- Public Routes ------- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />

        {/* -------- Candidate Flow -------- */}
        {/* All assessments must be listed here to use CandidateLayout */}
        <Route element={<CandidateLayout />}>
          {/* Entry point that redirects based on token */}
          <Route path="/take-assessment/:token" element={<TakeAssessment />} />

          {/* Individual Test Routes */}
          <Route path="/candidate/big-five" element={<BigFiveTest />} />
          <Route path="/candidate/disc" element={<DiscTest />} />
          <Route path="/candidate/karasek" element={<KarasekTest />} />
          <Route path="/candidate/maslach" element={<MaslachTest />} />
          <Route path="/candidate/jss" element={<JssTest />} />
          <Route path="/candidate/brs" element={<BrsTest />} />
          <Route path="/candidate/cdrisc" element={<CDRISCTest />} />
          <Route path="/candidate/wses" element={<WSESTest />} />
          <Route path="/candidate/gcos" element={<GCOSTest />} />
          <Route path="/candidate/ribs" element={<RIBSTest />} />
          <Route path="/candidate/caq" element={<CAQTest />} />
          <Route path="/candidate/ise" element={<ISETest />} />
        </Route>

        {/* ------- Protected Routes with Layout ------- */}
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
          path="/productivity-tools"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <ProductivityTools />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />
        <Route
          path="/productivity/eisenhower"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <EisenhowerMatrix />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />
        <Route
          path="/productivity/pomodoro"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <PomodoroTimer />
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
          path="/surveys"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <EmployeeSurveys />
              </LayoutComponent>
            </ProtectedRoute>
          }
        />
        <Route
          path="/email-templates"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <EmailTemplates />
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

        {/* ------- Assessment runners (Employee View) ------- */}
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

        {/* New Assessments (Employee View) */}
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