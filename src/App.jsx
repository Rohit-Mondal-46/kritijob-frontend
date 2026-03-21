import React from 'react';
import { BrowserRouter as Router, Routestimonial, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RoleSelection from './pages/auth/RoleSelection';
import DashboardLayout from './components/layout/DashboardLayout';
import CompanyProfile from './pages/employer/CompanyProfile';
import PostJob from './pages/employer/PostJob';
import EditJob from './pages/employer/EditJob';
import ApplicantList from './pages/employer/ApplicantList';
import JobListing from './pages/jobs/JobListing';
import MyJobs from './pages/employer/MyJobs';
import JobDetails from './pages/jobs/JobDetails';
import CompanyListing from './pages/companies/CompanyListing';
import CompanyDetails from './pages/companies/CompanyDetails';
import CandidateProfile from './pages/candidate/CandidateProfile';
import MyApplications from './pages/candidate/MyApplications';
import SavedJobs from './pages/candidate/SavedJobs';
import ResumeManager from './pages/candidate/ResumeManager';
import Subscription from './pages/candidate/Subscription';
import About from './pages/About';
import Pricing from './pages/Pricing';
import SalaryGuide from './pages/SalaryGuide';
import PaymentCheckout from './pages/payment/PaymentCheckout';
import PaymentCallback from './pages/payment/PaymentCallback';



import FindTalent from './pages/employer/FindTalent';
import CandidateDetails from './pages/employer/CandidateDetails';
import EmployerSubscription from './pages/employer/EmployerSubscription';
import NotFound from './pages/NotFound';

import ContactUs from './pages/legal/ContactUs';
import HelpCenter from './pages/legal/HelpCenter';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';

import AdminAuthGuard from './components/auth/AdminAuthGuard';
import EmployerAuthGuard from './components/auth/EmployerAuthGuard';
import CandidateAuthGuard from './components/auth/CandidateAuthGuard';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminJobs from './pages/admin/AdminJobs';
import AdminPostJob from './pages/admin/AdminPostJob';
import AdminContent from './pages/admin/AdminContent';
import AdminReports from './pages/admin/AdminReports';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
            <div className="app">
               <Navbar />
               <Routes>

                 <Route path="/" element={<Home />} />
                 <Route path="/about" element={<About />} />
                 <Route path="/pricing" element={<Pricing />} />
                 <Route path="/salary-guide" element={<SalaryGuide />} />
                 <Route path="/jobs" element={<JobListing />} />
                 <Route path="/jobs/:id" element={<JobDetails />} />
                 <Route path="/companies" element={<CompanyListing />} />
                 <Route path="/company/:id" element={<CompanyDetails />} />
                 <Route path="/login" element={<Login />} />
                 <Route path="/register" element={<Register />} />
                 <Route path="/role-selection" element={<RoleSelection />} />
                 
                 <Route path="/contact" element={<ContactUs />} />
                 <Route path="/help-center" element={<HelpCenter />} />
                 <Route path="/privacy" element={<PrivacyPolicy />} />
                 <Route path="/terms" element={<TermsOfService />} />
                 <Route path="/payment/checkout" element={<PaymentCheckout />} />
                 <Route path="/payment/callback" element={<PaymentCallback />} />
                 <Route path="/payment/success" element={<PaymentCallback forcedStatus="success" />} />
                 <Route path="/payment/failure" element={<PaymentCallback forcedStatus="failure" />} />
                 
                 <Route path="/dashboard" element={<DashboardLayout />}>
                    {/* Employer Routes */}
                    <Route path="employer" element={<EmployerAuthGuard />}>
                        <Route path="company" element={<CompanyProfile />} />
                        <Route path="jobs" element={<MyJobs />} />
                        <Route path="post-job" element={<PostJob />} />
                        <Route path="jobs/edit/:id" element={<EditJob />} />
                        <Route path="applicants" element={<ApplicantList />} />
                        <Route path="jobs/:jobId/applicants" element={<ApplicantList />} />
                        <Route path="find-talent" element={<FindTalent />} />
                        <Route path="subscription" element={<EmployerSubscription />} />
                        <Route path="candidate/:id" element={<CandidateDetails />} />
                    </Route>
                    
                    {/* Admin Routes */}
                    <Route path="admin" element={<AdminAuthGuard />}>
                        <Route path="overview" element={<AdminOverview />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="jobs" element={<AdminJobs />} />
                        <Route path="post-job" element={<AdminPostJob />} />
                        <Route path="content" element={<AdminContent />} />
                        <Route path="reports" element={<AdminReports />} />
                    </Route>

                    {/* Candidate Routes */}
                    <Route path="candidate" element={<CandidateAuthGuard />}>
                        <Route path="profile" element={<CandidateProfile />} />
                        <Route path="savedjobs" element={<SavedJobs />} />
                        <Route path="applications" element={<MyApplications />} />
                        <Route path="resume" element={<ResumeManager />} />
                        <Route path="subscription" element={<Subscription />} />
                    </Route>
                    
                    <Route index element={<div className="container" style={{paddingTop: '30px', color: 'white', textAlign: 'center'}}><h2>Welcome to your Dashboard</h2><p style={{color: '#aaa'}}>Select an option from the sidebar to get started.</p></div>} />
                 </Route>
       

          <Route path="*" element={<NotFound />} />
        </Routes>
            </div>
          </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;