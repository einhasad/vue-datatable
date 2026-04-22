import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, markRaw } from 'vue'
import DynamicComponent from '../src/DynamicComponent.vue'
import type { ComponentOptions } from '../src/types'

describe('DynamicComponent', () => {
  it('renders HTML element with text content via v-html', () => {
    const options: ComponentOptions = {
      is: 'span',
      content: '<strong>Hello</strong>'
    }

    const wrapper = mount(DynamicComponent, { props: { options } })

    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.find('strong').exists()).toBe(true)
    expect(wrapper.find('strong').text()).toBe('Hello')
  })

  it('renders div element', () => {
    const options: ComponentOptions = {
      is: 'div',
      content: 'Text inside div'
    }

    const wrapper = mount(DynamicComponent, { props: { options } })

    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.html()).toContain('Text inside div')
  })

  it('renders without content when options.content is undefined', () => {
    const options: ComponentOptions = {
      is: 'div'
    }

    const wrapper = mount(DynamicComponent, { props: { options } })

    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.element.children.length).toBe(0)
  })

  it('renders Vue component with props', () => {
    const ChildComponent = markRaw(defineComponent({
      props: { msg: String },
      template: '<p data-qa="child">{{ msg }}</p>'
    }))

    const options: ComponentOptions = {
      is: ChildComponent,
      props: { msg: 'from parent' }
    }

    const wrapper = mount(DynamicComponent, { props: { options } })

    expect(wrapper.find('[data-qa="child"]').text()).toBe('from parent')
  })

  it('renders nested children from options.children', () => {
    const options: ComponentOptions = {
      is: 'ul',
      children: [
        { is: 'li', content: 'Item 1' },
        { is: 'li', content: 'Item 2' },
        { is: 'li', content: 'Item 3' }
      ]
    }

    const wrapper = mount(DynamicComponent, { props: { options } })

    const items = wrapper.findAll('li')
    expect(items).toHaveLength(3)
    expect(items[0].text()).toBe('Item 1')
    expect(items[1].text()).toBe('Item 2')
    expect(items[2].text()).toBe('Item 3')
  })

  it('attaches event listeners on native element via events', async () => {
    const handler = vi.fn()
    const options: ComponentOptions = {
      is: 'button',
      content: 'Click me',
      events: {
        click: handler
      }
    }

    const wrapper = mount(DynamicComponent, { props: { options } })

    await wrapper.find('button').trigger('click')
    expect(handler).toHaveBeenCalled()
  })

  it('passes event arguments to the handler', async () => {
    const handler = vi.fn()
    const options: ComponentOptions = {
      is: 'input',
      events: {
        input: handler
      }
    }

    const wrapper = mount(DynamicComponent, { props: { options } })

    await wrapper.find('input').setValue('hello')
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('attaches multiple event listeners via events', async () => {
    const clickHandler = vi.fn()
    const mouseoverHandler = vi.fn()
    const options: ComponentOptions = {
      is: 'button',
      events: {
        click: clickHandler,
        mouseover: mouseoverHandler
      }
    }

    const wrapper = mount(DynamicComponent, { props: { options } })

    await wrapper.find('button').trigger('click')
    await wrapper.find('button').trigger('mouseover')

    expect(clickHandler).toHaveBeenCalled()
    expect(mouseoverHandler).toHaveBeenCalled()
  })

  it('attaches custom events on Vue component via events', async () => {
    const handler = vi.fn()
    const ChildComponent = markRaw(defineComponent({
      emits: ['custom-event'],
      template: '<button @click="$emit(\'custom-event\', 42)">fire</button>'
    }))

    const options: ComponentOptions = {
      is: ChildComponent,
      events: {
        'custom-event': handler
      }
    }

    const wrapper = mount(DynamicComponent, { props: { options } })

    await wrapper.find('button').trigger('click')
    expect(handler).toHaveBeenCalledWith(42)
  })

  it('works without events (backward compatible)', () => {
    const options: ComponentOptions = {
      is: 'span',
      content: 'no events'
    }

    const wrapper = mount(DynamicComponent, { props: { options } })

    expect(wrapper.find('span').text()).toBe('no events')
  })

  it('children use child.props.key for keyed rendering', () => {
    const options: ComponentOptions = {
      is: 'ul',
      children: [
        { is: 'li', content: 'A', props: { key: 'alpha' } },
        { is: 'li', content: 'B', props: { key: 'beta' } }
      ]
    }

    const wrapper = mount(DynamicComponent, { props: { options } })

    const items = wrapper.findAll('li')
    expect(items).toHaveLength(2)
    expect(items[0].text()).toBe('A')
    expect(items[1].text()).toBe('B')
  })
})
