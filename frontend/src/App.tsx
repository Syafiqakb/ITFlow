import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import CreateTicket from "./pages/CreateTicket";
import Tickets from "./pages/Tickets";
import TicketDetail from "./pages/TicketDetail";
import UserManagement from "./pages/UserManagement";
import CategoryManagement from "./pages/CategoryManagement";
import DepartmentManagement from "./pages/DepartmentManagement";
import KnowledgeBase from "./pages/KnowledgeBase";
import KnowledgeArticleDetail from "./pages/KnowledgeArticleDetail";
import KnowledgeBaseManagement from "./pages/admin/KnowledgeBaseManagement";
import KnowledgeArticleCreate from "./pages/admin/KnowledgeArticleCreate";
import KnowledgeArticleEdit from "./pages/admin/KnowledgeArticleEdit";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/tickets/create" element={<CreateTicket />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/admin/categories" element={<CategoryManagement />} />
          <Route path="/admin/departments" element={<DepartmentManagement />} />
          <Route path="/knowledge-base" element={<KnowledgeBase />} />
          <Route path="/knowledge-base/:id" element={<KnowledgeArticleDetail />}/>
          <Route path="/admin/knowledge-base" element={<KnowledgeBaseManagement />}/>
          <Route path="/admin/knowledge-base/create" element={<KnowledgeArticleCreate />}/>
          <Route path="/admin/knowledge-base/:id/edit" element={<KnowledgeArticleEdit />}/>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
