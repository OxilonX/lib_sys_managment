import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
//pages Imports
import AuthPage from "./pages/AuthPage";
import ExplorePage from "./pages/explorePage";
import Trending from "./pages/TrendingPage";
import DashboardPage from "./pages/DashboardPage";
import Mybooks from "./pages/MybooksPage";
import ProfilePage from "./pages/ProfilePage";
import UsersPage from "./pages/UsersPage";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/explore" element={<Layout />}>
          <Route index element={<ExplorePage />} />
          <Route path="trending" element={<Trending />} />
          <Route path="mybooks" element={<Mybooks />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="userslist" element={<UsersPage />} />
        </Route>
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}
