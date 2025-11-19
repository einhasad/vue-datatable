<template>
  <aside class="sidebar">
    <nav class="nav">
      <template v-for="item in navigationItems" :key="item.id || item.title">
        <!-- Regular nav link -->
        <NuxtLink
          v-if="!item.title"
          :to="item.route"
          :class="['nav-link', { active: isActive(item.id) }]"
        >
          {{ item.label }}
        </NuxtLink>

        <!-- Section with sub-links -->
        <div v-else class="nav-section">
          <span class="nav-section-title">{{ item.title }}</span>
          <NuxtLink
            v-for="link in item.links"
            :key="link.id"
            :to="link.route"
            :class="['nav-link', 'nav-sub-link', { active: isActive(link.id) }]"
          >
            {{ link.label }}
          </NuxtLink>
        </div>
      </template>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

interface NavLink {
  label: string
  id: string
  route: string
}

interface NavSection {
  title: string
  links: NavLink[]
}

defineProps<{
  navigationItems: (NavLink | NavSection)[]
}>()

const route = useRoute()

const isActive = (id: string) => {
  // Match against route path
  return route.path.includes(`/${id}`)
}
</script>

<style scoped>
.sidebar {
  width: 250px;
  background: #f7fafc;
  border-right: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  height: calc(100vh - 10rem);
  overflow-y: auto;
  flex-shrink: 0;
}

.nav {
  padding: 1.5rem 0;
}

.nav-link {
  display: block;
  padding: 0.75rem 1.5rem;
  color: #4a5568;
  text-decoration: none;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.nav-link:hover {
  background: #edf2f7;
  color: #667eea;
  border-left-color: #667eea;
}

.nav-link.active {
  background: #edf2f7;
  color: #667eea;
  font-weight: 500;
  border-left-color: #667eea;
}

.nav-section {
  margin: 1rem 0;
}

.nav-section-title {
  display: block;
  padding: 0.5rem 1.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #a0aec0;
  letter-spacing: 0.05em;
}

.nav-sub-link {
  padding-left: 2.5rem;
  font-size: 0.9rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }

  .nav {
    display: flex;
    overflow-x: auto;
    padding: 0.5rem 0;
  }

  .nav-link {
    white-space: nowrap;
    border-left: none;
    border-bottom: 3px solid transparent;
  }

  .nav-link:hover {
    border-left-color: transparent;
    border-bottom-color: #667eea;
  }
}
</style>
