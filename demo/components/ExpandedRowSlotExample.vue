<template>
  <div class="expanded-slot-demo">
    <Grid
      :data-provider="provider"
      :columns="columns"
      :row-key="(item) => item.id"
      @expand="handleExpand"
      @collapse="handleCollapse"
    >
      <template #pagination="{ pagination, setPage }">
        <PagePagination
          :current-page="pagination.currentPage"
          :total-pages="pagination.totalPages"
          :total-items="pagination.totalItems"
          :items-per-page="pagination.pageSize"
          :max-visible-pages="5"
          :show-summary="true"
          @page-change="setPage"
        />
      </template>

      <template #expandedRow="{ item, toggle }">
        <div class="expanded-slot-demo__panel">
          <div class="expanded-slot-demo__panel-head">
            <div>
              <div class="expanded-slot-demo__panel-eyebrow">Order details</div>
              <div class="expanded-slot-demo__panel-title">
                {{ item.id }} · {{ item.customer }}
              </div>
            </div>
            <button
              type="button"
              class="expanded-slot-demo__close"
              @click="toggle"
            >
              Collapse
            </button>
          </div>

          <div
            v-if="!lineItems[item.id]"
            class="expanded-slot-demo__loading"
          >
            Loading line items…
          </div>
          <table
            v-if="lineItems[item.id]"
            class="expanded-slot-demo__lines"
          >
            <thead>
              <tr>
                <th>Line</th>
                <th>Description</th>
                <th class="r">Qty</th>
                <th class="r">Unit price</th>
                <th class="r">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="line in lineItems[item.id]"
                :key="line.id"
              >
                <td>{{ line.id }}</td>
                <td>{{ line.description }}</td>
                <td class="r">{{ line.qty }}</td>
                <td class="r">{{ formatMoney(line.unitPrice) }}</td>
                <td class="r"><b>{{ formatMoney(line.amount) }}</b></td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </Grid>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  ArrayDataProvider,
  Grid,
  PagePagination,
  type Column,
} from '@einhasad-vue/datatable-vue'

interface Order {
  id: string
  customer: string
  status: string
  total: number
}

interface OrderLine {
  id: string
  description: string
  qty: number
  unitPrice: number
  amount: number
}

const customers = ['ACME Corp', 'Globex', 'Initech', 'Stark Industries', 'Wayne Enterprises', 'Soylent']
const statuses = ['New', 'In progress', 'Shipped', 'Closed']

const orders: Order[] = Array.from({ length: 14 }, (_, i) => ({
  id: `ORD-${1000 + i}`,
  customer: customers[i % customers.length],
  status: statuses[i % statuses.length],
  total: 480 + ((i * 137) % 4200),
}))

const provider = new ArrayDataProvider<Order>({ items: orders })
provider.setOffsetPagination({ page: 1, pageSize: 5 })

const lineItems = ref<Record<string, OrderLine[]>>({})

const columns: Column<Order>[] = [
  { key: 'id', label: 'Order #', expandToggle: true },
  { key: 'customer', label: 'Customer' },
  { key: 'status', label: 'Status' },
  {
    key: 'total',
    label: 'Total',
    value: (row) => formatMoney(row.total),
  },
]

function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function fetchLineItems(parent: Order): Promise<OrderLine[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const count = 2 + (parent.total % 3)
      const labels = ['Diagnostic', 'Parts', 'Labor', 'Setup', 'Shipping']
      const share = parent.total / (count + 1)
      resolve(
        Array.from({ length: count }, (_, i) => {
          const qty = 1 + (i % 3)
          const amount = Math.round(share)
          return {
            id: `${parent.id}-L${i + 1}`,
            description: `${labels[i % labels.length]} #${i + 1}`,
            qty,
            unitPrice: Math.round(amount / qty),
            amount,
          }
        }),
      )
    }, 250)
  })
}

async function handleExpand(item: Order) {
  if (lineItems.value[item.id]) return
  const lines = await fetchLineItems(item)
  lineItems.value = { ...lineItems.value, [item.id]: lines }
}

function handleCollapse(item: Order) {
  if (!(item.id in lineItems.value)) return
  const next = { ...lineItems.value }
  delete next[item.id]
  lineItems.value = next
}
</script>

<style scoped>
.expanded-slot-demo {
  --grid-expanded-bg: #f8fafc;
  --grid-expanded-padding: 0;
  --grid-chevron-color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  overflow: hidden;
}

.expanded-slot-demo :deep(.grid-table) {
  width: 100%;
  border-collapse: collapse;
}

.expanded-slot-demo :deep(.grid-cell) {
  padding: 0.55rem 0.85rem;
  border-bottom: 1px solid #f1f5f9;
}

.expanded-slot-demo :deep(.grid-pagination) {
  padding: 0.5rem 0.85rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.expanded-slot-demo__panel {
  padding: 0.85rem 1rem 1rem;
}

.expanded-slot-demo__panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.65rem;
}

.expanded-slot-demo__panel-eyebrow {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}

.expanded-slot-demo__panel-title {
  font-weight: 600;
  color: #0f172a;
}

.expanded-slot-demo__close {
  appearance: none;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  border-radius: 6px;
  padding: 0.3rem 0.7rem;
  font-size: 0.8rem;
  color: #334155;
  cursor: pointer;
}

.expanded-slot-demo__close:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}

.expanded-slot-demo__loading {
  padding: 0.5rem 0;
  color: #64748b;
  font-style: italic;
}

.expanded-slot-demo__lines {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

.expanded-slot-demo__lines th,
.expanded-slot-demo__lines td {
  padding: 0.45rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  text-align: left;
  font-size: 0.85rem;
}

.expanded-slot-demo__lines th {
  background: #f8fafc;
  font-weight: 600;
  color: #475569;
}

.expanded-slot-demo__lines th.r,
.expanded-slot-demo__lines td.r {
  text-align: right;
}

.expanded-slot-demo__lines tr:last-child td {
  border-bottom: none;
}
</style>
