import {computed, createVNode, defineComponent, onBeforeUnmount, onMounted, reactive, ref, render} from "vue";

const DropdownComponent = defineComponent({
  props: {
    option: Object
  },
  setup(props, { expose }) {
    const state = reactive({
      option: props.option,
      isShow: false,
      top: 0,
      left: 0
    });
    expose({
      showDropdown(option) {
        state.option = option;
        state.isShow = true;
        const { top, left, height } = option.el.getBoundingClientRect();
        state.top = top + height;
        state.left = left;
      }
    });

    const classes = computed(() => [
      'dropdown',
      {
        'dropdown-isShow': state.isShow
      }
    ]);

    const styles = computed(() => ({
      top: state.top + 'px',
      left: state.left + 'px'
    }));

    const onMousedownDocument = (e) => {
      // 如果点击的是dropdown内部 什么都不做
      if (!el.value.contains(e.target)) {
        state.isShow = false;
      }
    };

    const el = ref(null);

    onMounted(() => {
      // 事件的传递行为是先捕获再冒泡
      // 之前为了阻止事件传播, 我们给block都增加了stopPropagation
      document.body.addEventListener('mousedown', onMousedownDocument, true);
    });

    onBeforeUnmount(() => {
      document.body.removeEventListener('mousedown', onMousedownDocument);
    });

    return () => {
      return (
        <div class={classes.value} style={styles.value} ref={el}>
          下拉菜单内容区域
        </div>
      )
    }
  }
});

let vnode = null;

export function $dropdown(option) {
  // element-plus中是有el-dialog组件的
  // 手动挂载组件 new SubComponent
  if (!vnode) {
    const divEl = document.createElement('div');

    vnode = createVNode(DropdownComponent, { option });
    // 将组件渲染到这个el元素上
    render(vnode, divEl);

    // 渲染
    document.body.appendChild(divEl);
  }

  vnode.component.exposed.showDropdown(option);

}