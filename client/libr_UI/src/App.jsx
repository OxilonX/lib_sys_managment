import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
//pages Imports
import AuthPage from "./pages/AuthPage";
import ExplorePage from "./pages/explorePage";
import DashboardPage from "./pages/DashboardPage";
import Mybooks from "./pages/MybooksPage";
import ProfilePage from "./pages/ProfilePage";
//comps imports
import BooksManagement from "./components/BooksManagement";
import AddBookForm from "./components/AddBookForm";
import UsersList from "./components/UsersList";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />

        <Route path="/" element={<Layout />}>
          <Route path="explore" element={<ExplorePage />} />
          <Route path="explore/mybooks" element={<Mybooks />} />

          <Route path="dashboard" element={<DashboardPage />}>
            <Route index element={<BooksManagement />} />
            <Route path="booksmanagments" element={<BooksManagement />} />
            <Route path="addbook" element={<AddBookForm />} />
            <Route path="userslist" element={<UsersList />} />
          </Route>

          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
