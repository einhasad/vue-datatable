<script lang="ts">
import { defineComponent, h, mergeProps, resolveDynamicComponent, toHandlers } from 'vue'
import type { PropType, VNode } from 'vue'
import type { ComponentOptions } from './types'

const DynamicComponent = defineComponent({
  name: 'DynamicComponent',
  props: {
    options: {
      type: Object as PropType<ComponentOptions>,
      required: true
    }
  },
  setup(props: { options: ComponentOptions }) {
    return () => {
      const { options } = props
      const ownProps: Record<string, unknown> & { key?: string | number } = options.props ?? {}
      const rendersHtml = ownProps.innerHTML != null
      const key = rendersHtml ? `innerHTML:${ownProps.key ?? ''}` : ownProps.key
      const vnodeProps = mergeProps(ownProps, toHandlers(options.events ?? {}), key === undefined ? {} : { key })
      const type = resolveDynamicComponent(options.is) as string

      if (rendersHtml) {
        return h(type, vnodeProps)
      }

      return h(type, vnodeProps, {
        default: (): VNode[] => [
          ...(options.content ? [h('span', options.content)] : []),
          ...(options.children ?? []).map((child, index) =>
            h(DynamicComponent, { key: child.props?.key ?? index, options: child })
          )
        ]
      })
    }
  }
})

export default DynamicComponent
</script>
