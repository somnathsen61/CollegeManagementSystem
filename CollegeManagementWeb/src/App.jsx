import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout"; // Import the Layout
import Profile from "./pages/Profile";
import Grades from "./pages/Grades";
import MyClasses from "./pages/MyClasses";
import GradeEntry from "./pages/GradeEntry";
import AdminDashboard from "./pages/AdminDashboard";
import AllocateSubject from "./pages/AllocateSubject";
import GenerateMarksheets from "./pages/GenerateMarksheets";
import RegisterUser from "./pages/RegisterUser"; // Add this import

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Route: Login has no sidebar */}
                <Route path="/" element={<Login />} />

                {/* Protected Routes: All these pages get the Sidebar */}
                <Route element={<Layout />}>
                    <Route path="/dashboard" element={<Dashboard />} />

                    {/* We will build these pages later */}
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/grades" element={<Grades />} />
                    {/*<Route path="/profile" element={<h1 className="text-2xl">My Profile Page</h1>} />*/}
                    <Route path="/students" element={<h1 className="text-2xl">Manage Students Page</h1>} />
                    <Route path="/my-classes" element={<MyClasses />} />
                    <Route path="/grade-entry/:allocationId" element={<GradeEntry />} />
                    <Route path="/dashboard" element={<AdminDashboard />} />
                    <Route path="/register-user" element={<RegisterUser />} />
                    <Route path="/allocate-subject" element={<AllocateSubject />} />
                    <Route path="/generate-marksheets" element={<GenerateMarksheets />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;