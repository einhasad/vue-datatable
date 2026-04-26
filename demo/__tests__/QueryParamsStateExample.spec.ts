import { describe, it, expect, vi } from 'vitest'
import QueryParamsStateExample from '../components/QueryParamsStateExample.vue'
import { mountExample, makeRouter } from './helpers'

describe('QueryParamsStateExample', () => {
  it('filters and sorts via column inputs and pushes filter to query string', async () => {
    const router = makeRouter()
    await router.push('/')
    await router.isReady()
    const replaceSpy = vi.spyOn(router, 'replace')

    const { wrapper } = mountExample(QueryParamsStateExample, { router })

    const filterInputs = wrapper.findAll('.grid-search-input')
    expect(filterInputs.length).toBe(5)

    const nameFilter = filterInputs[1]
    await nameFilter.setValue('Charlie')
    await nameFilter.trigger('input')

    const rowsAfterName = wrapper.findAll('tbody tr.grid-row')
    expect(rowsAfterName.length).toBe(1)
    expect(rowsAfterName[0].findAll('td')[1].text()).toBe('Charlie Brown')

    await nameFilter.setValue('')
    await nameFilter.trigger('input')

    const roleFilter = filterInputs[3]
    await roleFilter.setValue('Manager')
    await roleFilter.trigger('input')

    const rowsAfterRole = wrapper.findAll('tbody tr.grid-row')
    expect(rowsAfterRole.length).toBe(3)

    const idHeader = wrapper.find('.grid-header-cell:first-child .grid-sort-link')
    await idHeader.trigger('click')
    const rowsSortDesc = wrapper.findAll('tbody tr.grid-row')
    expect(rowsSortDesc[0].findAll('td')[0].text()).toBe('1')

    await idHeader.trigger('click')
    const rowsSortAsc = wrapper.findAll('tbody tr.grid-row')
    expect(rowsSortAsc[0].findAll('td')[0].text()).toBe('3')

    expect(replaceSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({ 'qp-role': 'Manager' })
      })
    )

    replaceSpy.mockRestore()
  })
})
