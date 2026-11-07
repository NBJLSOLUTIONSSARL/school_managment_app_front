const paths = {
  user: <><path d="M20 21v-2a7 7 0 0 0-14 0v2" /><circle cx="13" cy="7" r="4" /></>,
  profile: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="9" r="3" /><path d="M6 19v-1a6 6 0 0 1 12 0v1" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 20 20 0 0 1-8.7-3.1 20 20 0 0 1-6-6A20 20 0 0 1 2 4.1 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 1.9Z" />,
  globe: <><circle cx="12" cy="12" r="10" /><ellipse cx="12" cy="12" rx="4" ry="10" /><path d="M2 12h20M4 6h16M4 18h16" /></>,
  shield: <><path d="m12 2 9 4v6c0 5-4 8-9 10-5-2-9-5-9-10V6l9-4Z" /><path d="m8 12 3 3 5-6" /></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></>,
  refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M6 6a8 8 0 0 1 13 2l1 4M4 12l1 4a8 8 0 0 0 13 2" /></>,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  logout: <><path d="M9 21H4V3h5M14 7l5 5-5 5M8 12h11" /></>,
  cap: <><path d="m2 8 10-5 10 5-10 5Z" /><path d="M6 10v7l6 3 6-3v-7M2 8v9" /></>,
  edit: <><path d="M3 17.29V21h3.712L17.12 13.06l-4.06-4.07L3 17.29Z" /><path d="M13.987 7.615l6.592 6.592a1 1 0 0 1 0 1.414l-4.064 4.064a1 1 0 0 1-1.414 0l-6.592-6.594a1 1 0 0 1 1.414-1.414l4.064 4.063a1 1 0 0 1 0 1.415l-1.113 1.112a1 1 0 0 1-1.413 0l-1.112-1.111a1 1 0 0 1 1.413-1.414l1.112 1.111Z" /></>,
}

export default function ProfileIcon({ name, className = '' }) {
  return <svg className={`profile-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
