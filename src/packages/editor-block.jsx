import { defineComponent, computed, inject, onMounted, ref } from "vue";


export default defineComponent({
  name: 'EditorBlock',
  props: {
    block: Object
  },
  setup(props) {

    const blockStyles = computed(() => ({
      top: `${props.block.top}px`,
      left: `${props.block.left}px`,
      zIndex: `${props.block.zIndex}`
    }));

    const config = inject('config');
    const blockRef = ref(null);

    onMounted(() => {
      const { offsetWidth, offsetHeight } = blockRef.value;
      if (props.block.alignCenter) { // 说明是拖拽松手的时候才渲染的, 其他的默认渲染到页面上的内容不需要剧中
        props.block.left = props.block.left - offsetWidth / 2;
        props.block.top = props.block.top - offsetHeight / 2; // 原则上重新派发事件
        props.block.alignCenter = false; // 让渲染后的结果才能去居中
      }
      props.block.width = offsetWidth;
      props.block.height = offsetHeight;
    });

    return () => {
      // 通过block的key属性直接获取对应的组件
      const component = config.componentMap[props.block.key];
      // 获取render函数
      const RenderComponent = component.render();
      return <div class="editor-block" style={blockStyles.value} ref={blockRef}>
        { RenderComponent }
      </div>
    };
  }
});