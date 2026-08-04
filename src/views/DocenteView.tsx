import { HeaderBar } from "../components/ui";
import { LessonForm, LessonList, MonitoringPanel } from "../components/docente";
import { useAppContext } from "../context/AppContext";

interface Props {
  onLogout: () => void;
}

export default function DocenteView({ onLogout }: Props) {
  const { currentUser } = useAppContext();

  const teacherName = currentUser
    ? (currentUser.toLowerCase().startsWith("prof") ? currentUser : `Prof. ${currentUser}`)
    : "Docente";

  return (
    <div className="flex-1 flex flex-col bg-slate-50/50">
      <HeaderBar
        title="Panel del Docente"
        subtitle={`${teacherName} | UNAJMA - I.E. M.V.A.`}
        onLogout={onLogout}
      />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
        <section className="lg:col-span-7 space-y-8">
          <LessonForm />
        </section>

        <section className="lg:col-span-5 space-y-8 lg:sticky lg:top-8 self-start">
          <LessonList />
          <MonitoringPanel />
        </section>
      </main>
    </div>
  );
}
