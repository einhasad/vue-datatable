/**
 * Mock GitHub Repository Data Generator
 * Generates realistic-looking repository data for testing purposes
 */

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'Java', 'C++', 'Ruby', 'PHP', 'Swift', 'Kotlin', null]
const LICENSES = ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'ISC', null]

/**
 * Generate a random integer between min and max (inclusive)
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Pick a random item from an array
 */
function randomPick(array) {
  return array[randomInt(0, array.length - 1)]
}

/**
 * Generate a random date within the last year
 */
function randomDate() {
  const now = new Date()
  const pastYear = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
  const timestamp = pastYear.getTime() + Math.random() * (now.getTime() - pastYear.getTime())
  return new Date(timestamp).toISOString()
}

/**
 * Repository name templates for realistic names
 */
const REPO_TEMPLATES = [
  { owner: 'facebook', name: 'react' },
  { owner: 'vuejs', name: 'vue' },
  { owner: 'angular', name: 'angular' },
  { owner: 'sveltejs', name: 'svelte' },
  { owner: 'microsoft', name: 'vscode' },
  { owner: 'nodejs', name: 'node' },
  { owner: 'denoland', name: 'deno' },
  { owner: 'vercel', name: 'next.js' },
  { owner: 'nuxt', name: 'nuxt' },
  { owner: 'gatsbyjs', name: 'gatsby' },
  { owner: 'webpack', name: 'webpack' },
  { owner: 'vitejs', name: 'vite' },
  { owner: 'rollup', name: 'rollup' },
  { owner: 'esbuild', name: 'esbuild' },
  { owner: 'tailwindlabs', name: 'tailwindcss' },
  { owner: 'mui', name: 'material-ui' },
  { owner: 'chakra-ui', name: 'chakra-ui' },
  { owner: 'ant-design', name: 'ant-design' },
  { owner: 'element-plus', name: 'element-plus' },
  { owner: 'vuetifyjs', name: 'vuetify' },
  { owner: 'prettier', name: 'prettier' },
  { owner: 'eslint', name: 'eslint' },
  { owner: 'axios', name: 'axios' },
  { owner: 'lodash', name: 'lodash' },
  { owner: 'moment', name: 'moment' },
  { owner: 'date-fns', name: 'date-fns' },
  { owner: 'expressjs', name: 'express' },
  { owner: 'koajs', name: 'koa' },
  { owner: 'nestjs', name: 'nest' },
  { owner: 'strapi', name: 'strapi' },
  { owner: 'prisma', name: 'prisma' },
  { owner: 'typeorm', name: 'typeorm' },
  { owner: 'sequelize', name: 'sequelize' },
  { owner: 'mongoose', name: 'mongoose' },
  { owner: 'redis', name: 'redis' },
  { owner: 'mongodb', name: 'mongo' },
  { owner: 'postgresql', name: 'postgres' },
  { owner: 'elastic', name: 'elasticsearch' },
  { owner: 'docker', name: 'docker' },
  { owner: 'kubernetes', name: 'kubernetes' },
  { owner: 'terraform', name: 'terraform' },
  { owner: 'ansible', name: 'ansible' },
  { owner: 'pytest-dev', name: 'pytest' },
  { owner: 'jestjs', name: 'jest' },
  { owner: 'mochajs', name: 'mocha' },
  { owner: 'vitest-dev', name: 'vitest' },
  { owner: 'testing-library', name: 'react-testing-library' },
  { owner: 'cypress-io', name: 'cypress' },
  { owner: 'playwright', name: 'playwright' },
  { owner: 'puppeteer', name: 'puppeteer' },
  { owner: 'django', name: 'django' },
  { owner: 'flask', name: 'flask' },
  { owner: 'fastapi', name: 'fastapi' },
  { owner: 'rails', name: 'rails' },
  { owner: 'laravel', name: 'laravel' },
  { owner: 'symfony', name: 'symfony' },
  { owner: 'spring-projects', name: 'spring-boot' },
  { owner: 'dotnet', name: 'aspnetcore' },
  { owner: 'golang', name: 'go' },
  { owner: 'rust-lang', name: 'rust' },
  { owner: 'apple', name: 'swift' },
  { owner: 'jetbrains', name: 'kotlin' },
  { owner: 'einhasad', name: 'vue-datatable' },
  { owner: 'tanstack', name: 'table' },
  { owner: 'ag-grid', name: 'ag-grid' },
  { owner: 'handsontable', name: 'handsontable' },
  { owner: 'datatables', name: 'datatables' },
  { owner: 'primevue', name: 'primevue' },
  { owner: 'shadcn-ui', name: 'ui' },
  { owner: 'radix-ui', name: 'primitives' },
  { owner: 'headlessui', name: 'headlessui' },
  { owner: 'floating-ui', name: 'floating-ui' },
  { owner: 'react-hook-form', name: 'react-hook-form' },
  { owner: 'formik', name: 'formik' },
  { owner: 'vuelidate', name: 'vuelidate' },
  { owner: 'react-query', name: 'react-query' },
  { owner: 'swr-vercel', name: 'swr' },
  { owner: 'reduxjs', name: 'redux' },
  { owner: 'mobxjs', name: 'mobx' },
  { owner: 'vuex', name: 'vuex' },
  { owner: 'pinia', name: 'pinia' },
  { owner: 'zustand', name: 'zustand' },
  { owner: 'jotai', name: 'jotai' },
  { owner: 'recoiljs', name: 'recoil' },
  { owner: 'graphql', name: 'graphql-js' },
  { owner: 'apollographql', name: 'apollo-client' },
  { owner: 'relay', name: 'relay' },
  { owner: 'trpc', name: 'trpc' },
  { owner: 'socketio', name: 'socket.io' },
  { owner: 'websockets', name: 'ws' },
  { owner: 'storybookjs', name: 'storybook' },
  { owner: 'styleguidist', name: 'react-styleguidist' },
  { owner: 'docusaurus', name: 'docusaurus' },
  { owner: 'vuepress', name: 'vuepress' },
  { owner: 'astro', name: 'astro' },
  { owner: 'remix-run', name: 'remix' },
  { owner: 'solidjs', name: 'solid' },
  { owner: 'qwik', name: 'qwik' },
  { owner: 'lit', name: 'lit' },
  { owner: 'webcomponents', name: 'webcomponentsjs' },
]

const DESCRIPTIONS = [
  'A declarative, efficient, and flexible JavaScript library for building user interfaces',
  'The Progressive JavaScript Framework',
  'A modern web framework for building fast applications',
  'Cybernetically enhanced web apps',
  'A powerful, fast, and lightweight build tool',
  'Next generation frontend tooling',
  'Modern database access for TypeScript & Node.js',
  'A Node.js web application framework',
  'Delightful JavaScript Testing',
  'Fast, easy and reliable testing for anything that runs in a browser',
  'End-to-end testing framework',
  'Beautiful, fast and modern UI library',
  'A utility-first CSS framework',
  'Type-safe GraphQL client for TypeScript',
  'Blazing fast, instant search and analytics',
  'The most popular database for modern apps',
  'Open source headless CMS',
  'Build forms in React, without the tears',
  'Performant, flexible and extensible forms library',
  'Simple and complete routing solution',
  'State management made simple',
  'Predictable state container',
  'A lightweight state management library',
  'Data fetching library for React',
  'Hooks for fetching, caching and updating asynchronous data',
  'Production-grade React applications',
  'The React Framework for Production',
  'Intuitive Vue Framework',
  'Full Stack framework for building modern web applications',
  'Static site generator for Vue',
  'Build optimized websites quickly',
  'Web framework for building fast applications',
  'Component-driven development',
  'Design systems for everyone',
  'Beautiful, responsive UI components',
  'Enterprise-class UI design language',
  'Lightning fast, zero config web application bundler',
  'Module bundler for JavaScript',
  'Bundle your scripts with ease',
  null
]

/**
 * Generate mock repository data
 */
function generateRepository(index) {
  const template = REPO_TEMPLATES[index % REPO_TEMPLATES.length]
  const id = index + 1
  const stars = randomInt(10, 100000)
  const forks = Math.floor(stars * randomInt(10, 50) / 100)
  const watchers = Math.floor(stars * randomInt(5, 20) / 100)
  const issues = randomInt(0, 500)
  const language = randomPick(LANGUAGES)
  const license = randomPick(LICENSES)

  return {
    id,
    node_id: `MDEwOlJlcG9zaXRvcnk${id}`,
    name: template.name,
    full_name: `${template.owner}/${template.name}`,
    owner: {
      login: template.owner,
      id: randomInt(1000, 99999),
      node_id: `MDQ6VXNlcjEyMzQ1Njc4${id}`,
      avatar_url: `https://avatars.githubusercontent.com/u/${randomInt(1000, 99999)}?v=4`,
      gravatar_id: '',
      url: `https://api.github.com/users/${template.owner}`,
      html_url: `https://github.com/${template.owner}`,
      type: 'User',
      site_admin: false
    },
    private: false,
    html_url: `https://github.com/${template.owner}/${template.name}`,
    description: randomPick(DESCRIPTIONS),
    fork: randomInt(0, 10) < 2,
    url: `https://api.github.com/repos/${template.owner}/${template.name}`,
    created_at: randomDate(),
    updated_at: randomDate(),
    pushed_at: randomDate(),
    homepage: randomInt(0, 10) < 5 ? `https://${template.name}.dev` : null,
    size: randomInt(100, 50000),
    stargazers_count: stars,
    watchers_count: watchers,
    language,
    forks_count: forks,
    open_issues_count: issues,
    master_branch: 'main',
    default_branch: 'main',
    score: Math.random(),
    archived: false,
    disabled: false,
    license: license ? {
      key: license.toLowerCase(),
      name: license,
      url: `https://api.github.com/licenses/${license.toLowerCase()}`,
      spdx_id: license,
      node_id: `MDc6TGljZW5zZTEz${id}`
    } : null,
    topics: [],
    visibility: 'public',
    forks: forks,
    open_issues: issues,
    watchers: watchers,
    has_issues: true,
    has_projects: true,
    has_downloads: true,
    has_wiki: true,
    has_pages: randomInt(0, 10) < 3,
    has_discussions: randomInt(0, 10) < 2
  }
}

/**
 * Generate all mock repositories
 */
function generateMockRepositories() {
  return REPO_TEMPLATES.map((_, index) => generateRepository(index))
}

export { generateMockRepositories, generateRepository }
