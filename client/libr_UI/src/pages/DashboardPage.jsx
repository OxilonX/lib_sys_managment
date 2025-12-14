import Container from "@mui/material/Container";
import "../styles/dashboardpg.css";
import AddBookForm from "../components/AddBookForm";

export default function DashboardPage() {
  return (
    <section className="dashboard-page">
      <Container maxWidth="lg">
        <div className="dashboard-section-grid">
          <AddBookForm />
          <div id="users-list"></div>
        </div>
      </Container>
    </section>
  );
}
