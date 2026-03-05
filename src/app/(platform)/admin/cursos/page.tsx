import { getAllCourses, getAllSubjects } from "@/db/queries/content";
import { CoursesAdmin } from "./courses-admin";

export const metadata = {
  title: "Gerenciar Cursos | INEMA Academia",
};

export default async function AdminCoursesPage() {
  const [coursesList, subjectsList] = await Promise.all([
    getAllCourses(),
    getAllSubjects(),
  ]);

  return (
    <CoursesAdmin initialCourses={coursesList} subjects={subjectsList} />
  );
}
