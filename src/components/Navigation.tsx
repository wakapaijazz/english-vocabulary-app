export type PageKey = "home" | "quiz" | "review" | "mistakes" | "dictionary" | "statistics" | "settings";
interface NavigationProps { activePage: PageKey; onNavigate: (page: PageKey) => void; mobile?: boolean; }
const items: Array<{ key: PageKey; label: string; icon: string }> = [
  { key: "home", label: "ホーム", icon: "⌂" }, { key: "quiz", label: "クイズ", icon: "✦" }, { key: "review", label: "復習", icon: "↻" }, { key: "mistakes", label: "苦手", icon: "!" }, { key: "dictionary", label: "辞書", icon: "⌕" }, { key: "statistics", label: "記録", icon: "▥" }, { key: "settings", label: "設定", icon: "⚙" },
];

export function Navigation({ activePage, onNavigate, mobile = false }: NavigationProps) {
  const mobileNavStyle = mobile ? { display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "2px", width: "100%", margin: 0, padding: "7px 4px 6px" } as const : undefined;
  const mobileItemStyle = mobile ? { display: "flex", minWidth: 0, padding: "5px 2px" } as const : undefined;
  return <nav className="navigation" aria-label="メインナビゲーション" style={mobileNavStyle}>{items.map((item) => <button key={item.key} className={activePage === item.key ? "nav-item active" : "nav-item"} onClick={() => onNavigate(item.key)} style={mobileItemStyle}><span className="nav-icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span></button>)}</nav>;
}
