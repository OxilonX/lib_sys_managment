import { useUsersData } from "../contexts/userDataContext";
export default function ExplorePage() {
  const { currUser, setCurrUser } = useUsersData();
  return <section id="explore-page"></section>;
}
