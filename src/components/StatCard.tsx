interface StatCardProps { label:string; value:string|number; caption?:string; tone?:"teal"|"orange"|"purple"|"ink"; }
export function StatCard({label,value,caption,tone="teal"}:StatCardProps){ return <div className={`stat-card stat-${tone}`}><span>{label}</span><strong>{value}</strong>{caption&&<small>{caption}</small>}</div>; }
