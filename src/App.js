

import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { UserProvider } from './frontend/contexts/UserContext';
import NavigationBar from './frontend/components/NavigationBar'; // Import the NavigationBar component
import Profile from './frontend/pages/StudentProfilePage/StudentProfile';
import HomePage from './frontend/pages/HomePagePage/HomePage';
import GenDirectory from './frontend/pages/GenDirectoryPage/GenDirectory';
import StudentProfileEditor from './frontend/pages/OLDStudentProfileEditorPage/StudentProfileEditor';
import SignUp from './frontend/pages/SignUpPage/SignUp';
import OtherStudentProfile from './frontend/pages/OtherStudentProfilePage/OtherStudentProfile';
import SiloDescription from './frontend/pages/SiloDescriptionPage/siloDescription';
import Feed from './frontend/pages/FeedPage/Feed';
import ProtectedRoute from './frontend/components/ProtectedRoute';
import Login from './frontend/pages/LoginPage/Login';
import GoLive from './frontend/pages/GoLivePage/GoLiveLandingPage'
import GameofLife from './frontend/components/GameOfLife';
import Groups from './frontend/pages/GroupsPage/Groups';
import PublicProfile from './frontend/pages/PublicPortfolioPage/PublicProfile';
import Welcome from './frontend/pages/FirstPage/Welcome';
import WaitingPage from './frontend/pages/WaitingPage/WaitingPage';
import JobsPage from './frontend/pages/JobsPage/JobsPage';
import './App.css'; 

import AddBlocPortfolio from './frontend/components/AddBlocPortfolio';

function App() {
  const appStyle = {
    backgroundColor: '#1e1e1e',
    minHeight: '100vh', // Minimum height to 100% of the viewport height
    minWidth: '100%',
  };

  return (
    <Router>
      <UserProvider>
        <div style={appStyle}>
          <NavigationWithConditionalRender />
          <Routes>
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/wait" element={<WaitingPage />} /> 
            <Route path="/siloDescription" element={<SiloDescription />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Welcome />} />
            <Route path="/SignUp" element={<SignUp />} />
            <Route path="/GoLive" element={<GoLive />} />
            <Route path="/studentProfile" element={<ProtectedRoute component={Profile} />} />
            <Route path="/studentProfileEditor" element={<StudentProfileEditor />} />
            <Route path="/addBlockProject" element={<AddBlocPortfolio />} />
            <Route path="/GenDirectory" element={<ProtectedRoute component={GenDirectory} />} />
            <Route path="/profile/:id" element={<ProtectedRoute component={OtherStudentProfile} />} />
            <Route path="/public/:username/:user_id" element={<PublicProfile />} /> 
          </Routes>
        </div>
      </UserProvider>
    </Router>
  );
}

function NavigationWithConditionalRender() {
  const location = useLocation();
  const noNavBarPaths = ['/', '/login', '/SignUp', '/public']; // Add /public to the noNavBarPaths

  // Check if the current pathname includes '/public/'
  const isPublicProfile = location.pathname.includes('/public/');

  // Conditionally render the NavigationBar component
  return (!noNavBarPaths.includes(location.pathname) && !isPublicProfile) ? <NavigationBar /> : null;
}

export default App;



