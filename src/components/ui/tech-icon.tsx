import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface TechIconProps {
  slug: string;
  name?: string;
  className?: string;
  size?: number;
  color?: string;
}

const TechIcon: React.FC<TechIconProps> = ({ 
  slug, 
  name, 
  className = "", 
  size = 32,
  color
}) => {
  const [hasError, setHasError] = useState(false);

  // Clean the slug: lowercase, trim, remove non-alphanumeric (keep hyphens)
  const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
  
  // Comprehensive alias map for common AI-returned slugs → Simple Icons slugs
  const slugMap: { [key: string]: string } = {
    // Languages
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'python': 'python',
    'rust': 'rust',
    'golang': 'go',
    'go': 'go',
    'cpp': 'cplusplus',
    'csharp': 'csharp',
    'java': 'java',
    'kotlin': 'kotlin',
    'swift': 'swift',
    'ruby': 'ruby',
    'php': 'php',
    'scala': 'scala',
    'elixir': 'elixir',
    'dart': 'dart',
    // Web
    'html': 'html5',
    'html5': 'html5',
    'css': 'css3',
    'css3': 'css3',
    'sass': 'sass',
    // Frameworks
    'react': 'react',
    'reactnative': 'react',
    'nextjs': 'nextdotjs',
    'next': 'nextdotjs',
    'nuxt': 'nuxtdotjs',
    'vue': 'vuedotjs',
    'vuejs': 'vuedotjs',
    'angular': 'angular',
    'svelte': 'svelte',
    'remix': 'remix',
    'astro': 'astro',
    'tailwind': 'tailwindcss',
    'tailwindcss': 'tailwindcss',
    'bootstrap': 'bootstrap',
    'materialui': 'mui',
    'mui': 'mui',
    'fastapi': 'fastapi',
    'flask': 'flask',
    'django': 'django',
    'express': 'express',
    'expressjs': 'express',
    'nestjs': 'nestjs',
    'spring': 'spring',
    'laravel': 'laravel',
    'rails': 'rubyonrails',
    'rubyonrails': 'rubyonrails',
    'nodejs': 'nodedotjs',
    'node': 'nodedotjs',
    'bun': 'bun',
    'deno': 'deno',
    'graphql': 'graphql',
    'prisma': 'prisma',
    'pytorch': 'pytorch',
    'tensorflow': 'tensorflow',
    // SQL Databases — "sql" generic maps to postgresql
    'sql': 'postgresql',
    'postgresql': 'postgresql',
    'postgres': 'postgresql',
    'mysql': 'mysql',
    'sqlite': 'sqlite',
    'mariadb': 'mariadb',
    'cockroachdb': 'cockroachlabs',
    'cockroach': 'cockroachlabs',
    'planetscale': 'planetscale',
    'mssql': 'microsoftsqlserver',
    'microsoftsqlserver': 'microsoftsqlserver',
    'oracle': 'oracle',
    // NoSQL Databases
    'mongodb': 'mongodb',
    'mongo': 'mongodb',
    'redis': 'redis',
    'dynamodb': 'amazondynamodb',
    'amazondynamodb': 'amazondynamodb',
    'cassandra': 'apachecassandra',
    'apachecassandra': 'apachecassandra',
    'firebase': 'firebase',
    'firestore': 'firebase',
    'couchdb': 'apachecouchdb',
    'elasticsearch': 'elasticsearch',
    'elastic': 'elasticsearch',
    'influxdb': 'influxdb',
    'neo4j': 'neo4j',
    'pocketbase': 'pocketbase',
    // Cloud / Infra
    'aws': 'amazonaws',
    'amazon': 'amazonaws',
    'gcp': 'googlecloud',
    'googlecloud': 'googlecloud',
    'azure': 'microsoftazure',
    'vercel': 'vercel',
    'netlify': 'netlify',
    'heroku': 'heroku',
    'railway': 'railway',
    'render': 'render',
    'fly': 'flyio',
    'flyio': 'flyio',
    'digitalocean': 'digitalocean',
    'cloudflare': 'cloudflare',
    'supabase': 'supabase',
    'neon': 'neon',
    'upstash': 'upstash',
    // DevOps
    'docker': 'docker',
    'kubernetes': 'kubernetes',
    'k8s': 'kubernetes',
    'terraform': 'terraform',
    'ansible': 'ansible',
    'jenkins': 'jenkins',
    'nginx': 'nginx',
    'linux': 'linux',
    'ubuntu': 'ubuntu',
    // Auth / Services
    'clerk': 'clerk',
    'auth0': 'auth0',
    'stripe': 'stripe',
    'twilio': 'twilio',
    'algolia': 'algolia',
    'sentry': 'sentry',
    'grafana': 'grafana',
    'prometheus': 'prometheus',
    'github': 'github',
    'gitlab': 'gitlab',
    'bitbucket': 'bitbucket',
    'jira': 'jira',
    'notion': 'notion',
    'figma': 'figma',
    'postman': 'postman',
  };

  const finalSlug = slugMap[cleanSlug] || cleanSlug;
  const iconUrl = `https://cdn.simpleicons.org/${finalSlug}/${color || 'FFFFFF'}`;
  const displayName = name || slug;

  // If icon failed to load, show a styled initial placeholder
  if (hasError) {
    return (
      <motion.div 
        whileHover={{ scale: 1.1 }}
        className={`relative flex items-center justify-center rounded-lg bg-primary/10 border border-primary/20 ${className}`}
        style={{ width: size + 16, height: size + 16 }}
        title={displayName}
      >
        <span className="text-primary font-black uppercase" style={{ fontSize: Math.max(10, size * 0.45) }}>
          {displayName.charAt(0)}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div 
      whileHover={{ scale: 1.1, rotate: 5 }}
      className={`relative flex items-center justify-center p-1 rounded-lg bg-surface-container/50 border border-white/5 shadow-inner transition-all ${className}`}
      style={{ width: size + 16, height: size + 16 }}
      title={displayName}
    >
      <img
        src={iconUrl}
        alt={displayName}
        width={size}
        height={size}
        className="relative z-10 transition-opacity duration-300"
        onLoad={(e) => (e.currentTarget.style.opacity = '1')}
        onError={() => setHasError(true)}
        style={{ opacity: 0 }}
      />
    </motion.div>
  );
};

export default TechIcon;
