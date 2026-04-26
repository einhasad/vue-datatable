import { describe, it, expect } from 'vitest'
import SortingExample from '../components/SortingExample.vue'
import { mountExample } from './helpers'
import type { VueWrapper } from '@vue/test-utils'

function firstCellText(wrapper: VueWrapper, columnIndex = 0): string {
  const rows = wrapper.findAll('tbody tr.grid-row')
  expect(rows.length).toBeGreaterThan(0)
  const cells = rows[0].findAll('td')
  return cells[columnIndex].text()
}

function rowIds(wrapper: VueWrapper): string[] {
  return wrapper.findAll('tbody tr.grid-row').map(r => r.findAll('td')[0].text())
}

async function clickHeader(wrapper: VueWrapper, headerIndex: number): Promise<void> {
  const link = wrapper.findAll('.grid-header-cell')[headerIndex].find('.grid-sort-link')
  await link.trigger('click')
}

describe('SortingExample', () => {
  it('renders rows in initial id-asc order', () => {
    const { wrapper } = mountExample(SortingExample)
    expect(rowIds(wrapper)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8'])
  })

  describe('sort by id (column 0)', () => {
    it('toggles asc → desc → unsorted on repeated header clicks', async () => {
      const { wrapper } = mountExample(SortingExample)

      // initial state is asc
      expect(firstCellText(wrapper)).toBe('1')

      // asc → desc
      await clickHeader(wrapper, 0)
      expect(firstCellText(wrapper)).toBe('8')

      // desc → null (insertion order, which is id-asc here)
      await clickHeader(wrapper, 0)
      expect(firstCellText(wrapper)).toBe('1')
    })
  })

  describe('sort by name (column 1)', () => {
    it('asc orders alphabetically by name (Alice first)', async () => {
      const { wrapper } = mountExample(SortingExample)
      await clickHeader(wrapper, 1)
      expect(firstCellText(wrapper, 1)).toBe('Alice Johnson')
      expect(firstCellText(wrapper, 0)).toBe('1')
    })

    it('desc orders reverse alphabetically (Hannah first)', async () => {
      const { wrapper } = mountExample(SortingExample)
      await clickHeader(wrapper, 1) // asc
      await clickHeader(wrapper, 1) // desc
      expect(firstCellText(wrapper, 1)).toBe('Hannah Montana')
      expect(firstCellText(wrapper, 0)).toBe('8')
    })
  })

  describe('sort by department (column 2)', () => {
    it('asc puts Engineering first, preserving insertion order within ties', async () => {
      const { wrapper } = mountExample(SortingExample)
      await clickHeader(wrapper, 2)
      expect(firstCellText(wrapper, 2)).toBe('Engineering')
      // Engineering rows in original order: Alice(1), Diana(4), George(7)
      expect(rowIds(wrapper).slice(0, 3)).toEqual(['1', '4', '7'])
    })

    it('desc puts Sales first', async () => {
      const { wrapper } = mountExample(SortingExample)
      await clickHeader(wrapper, 2) // asc
      await clickHeader(wrapper, 2) // desc
      expect(firstCellText(wrapper, 2)).toBe('Sales')
      // Sales rows: Charlie(3), Hannah(8)
      expect(rowIds(wrapper).slice(0, 2)).toEqual(['3', '8'])
    })
  })

  describe('sort by salary (column 3)', () => {
    it('asc puts the lowest salary (Bob, $75,000) first', async () => {
      const { wrapper } = mountExample(SortingExample)
      await clickHeader(wrapper, 3)
      expect(firstCellText(wrapper, 3)).toBe('$75,000')
      expect(firstCellText(wrapper, 0)).toBe('2')
    })

    it('desc puts the highest salary (Diana, $105,000) first', async () => {
      const { wrapper } = mountExample(SortingExample)
      await clickHeader(wrapper, 3) // asc
      await clickHeader(wrapper, 3) // desc
      expect(firstCellText(wrapper, 3)).toBe('$105,000')
      expect(firstCellText(wrapper, 0)).toBe('4')
    })
  })

  describe('sort by position via the Sort By dropdown', () => {
    it('Position Asc puts position 1 (Diana) first', async () => {
      const { wrapper } = mountExample(SortingExample)
      const select = wrapper.get('[data-qa="sort-select"]')
      await select.setValue('position-asc')
      // 1=Diana(4), 2=Hannah(8), 3=George(7), 4=Fiona(6), 5=Alice(1), 6=Bob(2), 7=Charlie(3), 8=Ethan(5)
      expect(rowIds(wrapper)).toEqual(['4', '8', '7', '6', '1', '2', '3', '5'])
    })

    it('Position Desc puts position 8 (Ethan) first', async () => {
      const { wrapper } = mountExample(SortingExample)
      const select = wrapper.get('[data-qa="sort-select"]')
      await select.setValue('position-desc')
      expect(rowIds(wrapper)).toEqual(['5', '3', '2', '1', '6', '7', '8', '4'])
    })

    it('Default restores the initial id-asc sort', async () => {
      const { wrapper } = mountExample(SortingExample)
      const select = wrapper.get('[data-qa="sort-select"]')
      await select.setValue('position-desc')
      expect(firstCellText(wrapper, 0)).toBe('5')

      await select.setValue('')
      expect(rowIds(wrapper)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8'])
    })
  })
})
