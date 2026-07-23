import { Sparkles, Users, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { ROLES } from "../constants";

export default function WelcomeView() {
  const { setSelectedRole } = useAppContext();
  const navigate = useNavigate();

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl px-6 py-12">

        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          I.E. Manuel Vivanco Altamirano
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#3c3c3c] mb-12">
          Learn English
        </h1>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">

          <button
            id="btn-role-student"
            onClick={() => {
              setSelectedRole(ROLES.STUDENT);
              navigate("/login");
            }}
            className="w-full sm:w-64 py-5 px-8 text-xl font-black rounded-2xl btn-3d-green tracking-wide cursor-pointer flex flex-col items-center gap-2"
          >
            <Users className="w-8 h-8 text-white" />
            I AM STUDENT
          </button>

          <button
            id="btn-role-teacher"
            onClick={() => {
              setSelectedRole(ROLES.TEACHER);
              navigate("/login");
            }}
            className="w-full sm:w-64 py-5 px-8 text-xl font-black rounded-2xl btn-3d-blue tracking-wide cursor-pointer flex flex-col items-center gap-2"
          >
            <GraduationCap className="w-8 h-8 text-white" />
            I AM TEACHER
          </button>

        </div>

        <div className="mt-16 text-xs font-bold text-gray-400 uppercase tracking-widest">
          UNIVERSIDAD NACIONAL JOSE MARIA ARGUEDAS - UNAJMA
        </div>

      </div>
    </main>
  );
}
