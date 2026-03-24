// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";

// Public pages
import WellbeingTechniques from "./pages/hr/WellbeingTechniques";
import LandingPage from "./pages/landing/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import HowItWorks from "./pages/landing/HowItWorks";
import SignUpPage from "./pages/auth/SignUpPage";
import AcceptInvite from "./pages/auth/AcceptInvite";

// Layout / auth guard
import ProtectedRoute from "./components/ProtectedRoute";
import LayoutComponent from "./components/layouts/LayoutComponent";
import CandidateLayout from "./components/layouts/CandidateLayout";

// Dashboard & pages
import Dashboard from "./pages/hr/dashboard/Dashboard";
import Profile from "./pages/hr/Profile";
import Employees from "./pages/hr/Employees";
import Scheduling from "./pages/hr/Scheduling";
import SendAssessment from "./pages/hr/assessments/AssessementPage";
import MyAssessments from "./pages/hr/MyAssessments";
import EmployeeSurveys from "./pages/hr/EmployeeSurveys";
import EmailTemplates from "./pages/hr/emailtemplates";
import Company from "./pages/hr/company/CompanyProfile";

// Assessment runners
import BigFiveTest from "./pages/hr/assessments/BigFiveTest";
import KarasekTest from "./pages/hr/assessments/KarasekTest";
import MaslachTest from "./pages/hr/assessments/MaslachTest";
import DiscTest from "./pages/hr/assessments/DiscTest";
import JssTest from "./pages/hr/assessments/JssTest";
import BrsTest from "./pages/hr/assessments/BrsTest";

// New Assessments
import ReportPage from "./pages/hr/ReportPage";
import CDRISCTest from "./pages/hr/assessments/CdriscTest";
import WSESTest from "./pages/hr/assessments/WsesTest";
import GCOSTest from "./pages/hr/assessments/GcosTest";
import RIBSTest from "./pages/hr/assessments/RibsTest";
import CAQTest from "./pages/hr/assessments/CaqTest";
import ISETest from "./pages/hr/assessments/IseTest";
import RecruitmentMatch from "./pages/hr/RecruitmentMatch";
import AssessmentDescription from "./pages/hr/AssessmentDescription";
import Departments from "./pages/hr/Departments";
import ProductivityTools from "./components/ProductivitytoolsComponents/ProductivityTools";
import EisenhowerMatrix from "./components/ProductivitytoolsComponents/EisenhowerMatrix";
import PomodoroTimer from "./components/ProductivitytoolsComponents/Promodorotechnik";
import TakeAssessment from "./pages/hr/assessments/TakeAssessment";

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
        <Route path="/how-it-works" element={<HowItWorks />} />
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
          path="/company"
          element={
            <ProtectedRoute>
              <LayoutComponent>
                <Company />
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