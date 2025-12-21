import UsersList from "../components/UsersList";
import { Container } from "@mui/material";
export default function UsersPage() {
  return (
    <section id="users-list-page">
      <Container maxWidth="lg">
        <UsersList />
      </Container>
    </section>
  );
}
