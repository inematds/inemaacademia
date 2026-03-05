import { getAllSubjects } from "@/db/queries/content";
import { SubjectsAdmin } from "./subjects-admin";

export const metadata = {
  title: "Gerenciar Materias | INEMA Academia",
};

export default async function AdminSubjectsPage() {
  const subjectsList = await getAllSubjects();

  return <SubjectsAdmin initialSubjects={subjectsList} />;
}
