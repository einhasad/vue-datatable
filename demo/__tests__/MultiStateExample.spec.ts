import { describe, it, expect } from 'vitest'
import MultiStateExample from '../components/MultiStateExample.vue'
import { flushPromises } from '@vue/test-utils'
import { mountExample, makeRouter } from './helpers'

describe('MultiStateExample', () => {
  it('renders two grids with independent state', () => {
    const { wrapper } = mountExample(MultiStateExample)

    const tables = wrapper.findAll('table')
    expect(tables.length).toBe(2)

    const allRows = wrapper.findAll('tbody tr.grid-row')
    const firstGridRows = allRows.slice(0, 5)
    expect(firstGridRows.length).toBe(5)
    expect(firstGridRows[0].findAll('td')[1].text()).toBe('Laptop Pro')

    const secondGridRows = allRows.slice(5)
    expect(secondGridRows[0].findAll('td')[1].text()).toBe('alice_smith')
  })

  it('pages each grid independently and keeps both pages in the URL', async () => {
    const router = makeRouter()
    await router.push('/')
    await router.isReady()
    const { wrapper } = mountExample(MultiStateExample, { router })

    const navs = wrapper.findAll('nav.grid-pagination')
    expect(navs.length).toBe(2)

    await navs[0].findAll('.grid-pagination-page-number')[1].trigger('click')
    await flushPromises()
    await wrapper.findAll('nav.grid-pagination')[1].findAll('.grid-pagination-page-number')[1].trigger('click')
    await flushPromises()

    const tables = wrapper.findAll('table')
    expect(tables[0].findAll('tbody tr.grid-row').map(r => r.findAll('td')[1].text())).toEqual([
      'Webcam HD', 'Desk Lamp', 'Office Chair', 'Headphones', 'Tablet Stand'
    ])
    expect(tables[1].findAll('tbody tr.grid-row').map(r => r.findAll('td')[1].text())).toEqual([
      'fiona_glenn', 'george_hall'
    ])
    expect(router.currentRoute.value.query).toMatchObject({ 'products-page': '2', 'users-page': '2' })
  })

  it('filters each grid under its own URL prefix', async () => {
    const router = makeRouter()
    await router.push('/')
    await router.isReady()
    const { wrapper } = mountExample(MultiStateExample, { router })

    const tables = wrapper.findAll('table')
    await tables[0].findAll('.grid-search-input')[1].setValue('Office')
    await flushPromises()
    await tables[1].findAll('.grid-search-input')[1].setValue('Inactive')
    await flushPromises()

    expect(tables[0].findAll('tbody tr.grid-row').map(r => r.findAll('td')[1].text())).toEqual([
      'Desk Lamp', 'Office Chair'
    ])
    expect(tables[1].findAll('tbody tr.grid-row').map(r => r.findAll('td')[1].text())).toEqual([
      'charlie_brown', 'fiona_glenn'
    ])
    expect(router.currentRoute.value.query).toMatchObject({ 'products-category': 'Office', 'users-status': 'Inactive' })
  })
})
