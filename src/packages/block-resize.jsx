import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BlockResize',
  props: {
    block: Object,
    component: Object
  },
  setup(props) {
    const { width, height } = props.component.resize || {};
    return () => <>
      { width && <>
        <div class="block-resize block-resize-left"></div>
        <div class="block-resize block-resize-right"></div>
      </> }
      {
        height && <>
          <div class="block-resize block-resize-top"></div>
          <div class="block-resize block-resize-bottom"></div>
        </>
      }
      {
        width && height && <>
          <div class="block-resize block-resize-top-left"></div>
          <div class="block-resize block-resize-top-right"></div>
          <div class="block-resize block-resize-bottom-left"></div>
          <div class="block-resize block-resize-bottom-right"></div>
        </>
      }
    </>
  }
});