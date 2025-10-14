import React from 'react';

const placeholderProjects = [
  {
    id: 1,
    title: 'Portfolio Website',
    description: 'A personal portfolio built with React and Vite',
    url: '#'
  },
  {
    id: 2,
    title: 'Recipe Store',
    description: 'A demo recipe store with admin dashboard and JSON storage',
    url: '#'
  },
  {
    id: 3,
    title: 'Blog Platform',
    description: 'A minimal blog engine used for writing technical posts',
    url: '#'
  }
];

export default function ProjectsPage() {
  return (
    <div className="projects-page" style={{ padding: 20 }}>
      <h1>Projects</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {placeholderProjects.map(p => (
          <article key={p.id} style={{ background: '#fff', padding: 12, borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}>
            <h3 style={{ marginTop: 0 }}>{p.title}</h3>
            <p style={{ color: '#444' }}>{p.description}</p>
            <a href={p.url}>View</a>
          </article>
        ))}
      </div>
    </div>
  );
}
