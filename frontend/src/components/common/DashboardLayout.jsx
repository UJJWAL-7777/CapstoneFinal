import Sidebar from "./Sidebar.jsx";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <div className="flex-1 p-8 max-w-[1200px] overflow-x-hidden max-md:p-5">
        {children}
      </div>
    </div>
  );
}
