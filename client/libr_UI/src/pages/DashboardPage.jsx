import Container from "@mui/material/Container";
import "../styles/dashboardpg.css";
//Components imports
import AddBookForm from "../components/AddBookForm";
import BooksManagement from "../components/BooksManagement";

export default function DashboardPage() {
  return (
    <section className="dashboard-page">
      <Container maxWidth="lg">
        <div className="dashboard-section-grid">
          <AddBookForm />
          <div id="books-list">
            <BooksManagement />
          </div>
        </div>
      </Container>
    </section>
  );
}
