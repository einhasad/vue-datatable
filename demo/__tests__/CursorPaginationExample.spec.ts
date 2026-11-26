import { describe, it, expect } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import CursorPaginationExample from '../components/CursorPaginationExample.vue'
import { mountExample } from './helpers'

function productNames(wrapper: ReturnType<typeof mountExample>['wrapper']): string[] {
  return wrapper.findAll('tbody tr.grid-row').map(row => row.findAll('td')[1].text())
}

describe('CursorPaginationExample', () => {
  it('loads more rows on each Load More click', async () => {
    const { wrapper } = mountExample(CursorPaginationExample)
    await flushPromises()

    const names = productNames(wrapper)
    expect(names).toHaveLength(8)
    expect(names[0]).toBe('Product 1')
    expect(names[7]).toBe('Product 8')

    const loadMoreBtn = wrapper.find('.grid-load-more')
    expect(loadMoreBtn.exists()).toBe(true)
    expect(loadMoreBtn.attributes('type')).toBe('button')
    await loadMoreBtn.trigger('click')
    await flushPromises()

    const namesAfter = productNames(wrapper)
    expect(namesAfter).toHaveLength(16)
    expect(namesAfter[8]).toBe('Product 9')
    expect(namesAfter[15]).toBe('Product 16')

    await wrapper.find('.grid-load-more').trigger('click')
    await flushPromises()
    expect(productNames(wrapper)).toHaveLength(24)
  })

  it('stops at the last product and hides Load More when the cursor has no next page', async () => {
    const { wrapper } = mountExample(CursorPaginationExample)
    await flushPromises()

    for (let i = 0; i < 3; i++) {
      await wrapper.find('.grid-load-more').trigger('click')
      await flushPromises()
    }
    expect(productNames(wrapper)).toHaveLength(32)

    await wrapper.find('.grid-load-more').trigger('click')
    await flushPromises()

    const names = productNames(wrapper)
    expect(names).toHaveLength(35)
    expect(new Set(names).size).toBe(35)
    expect(names[34]).toBe('Product 35')
    expect(wrapper.find('.grid-load-more').exists()).toBe(false)
  })
})
