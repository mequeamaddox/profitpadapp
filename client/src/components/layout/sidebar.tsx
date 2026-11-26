import NavPanel from "./nav-panel";

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 md:flex md:flex-col">
      <NavPanel />
    </aside>
  );
}
