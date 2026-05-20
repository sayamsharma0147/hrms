import { Navigate, Route, Routes } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import RoleRoute from './components/RoleRoute'
import AppLayout from './components/Layout/AppLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import JobList from './pages/Jobs/JobList'
import JobForm from './pages/Jobs/JobForm'
import JobDetail from './pages/Jobs/JobDetail'
import JobBoard from './pages/Public/JobBoard'
import ApplyForm from './pages/Public/ApplyForm'
import PipelineBoard from './pages/Pipeline/PipelineBoard'
import ApplicationDetail from './pages/Pipeline/ApplicationDetail'
import InterviewQueue from './pages/Interviews/InterviewQueue'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/careers" element={<JobBoard />} />
      <Route path="/careers/:id/apply" element={<ApplyForm />} />

      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/applications/:id" element={<ApplicationDetail />} />
          <Route element={<RoleRoute roles={['Admin', 'HR Manager']} />}>
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/jobs/new" element={<JobForm />} />
            <Route path="/jobs/:id/edit" element={<JobForm />} />
            <Route path="/pipeline" element={<PipelineBoard />} />
          </Route>
          <Route element={<RoleRoute roles={['Interviewer']} />}>
            <Route path="/my-interviews" element={<InterviewQueue />} />
          </Route>
        </Route>
      </Route>

      <Route path="/jobs/:id" element={<JobDetail />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
