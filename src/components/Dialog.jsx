import { ElDialog, ElInput, ElButton } from "element-plus";
import { defineComponent, createVNode, render, reactive } from "vue";

const DialogComponent = defineComponent({
  props: {
    option: Object
  },
  setup(props, { expose }) {
    const state = reactive({
      option: props.option,
      isShow: false
    });
    expose({
      showDialog(option) {
        state.option = option;
        state.isShow = true;
      }
    });
    const cancel = () => {
      state.isShow = false;
    };
    const apply = () => {
      state.option.apply && state.option.apply(state.option.content);
      state.isShow = false;
    };
    return () => {
      return <ElDialog v-model={state.isShow} title={state.option.title}>
        {{
          default: () => <ElInput type="textarea" v-model={state.option.content} rows={10}></ElInput>,
          footer: () => state.option.footer && (
            <div>
              <ElButton onClick={cancel}>取消</ElButton>
              <ElButton onClick={apply} type="primary">确定</ElButton>
            </div>
          )
        }}
      </ElDialog>
    }
  }
});

let vnode = null;

export function $dialog(option) {
  // element-plus中是有el-dialog组件的
  // 手动挂载组件 new SubComponent
  if (!vnode) {
    const divEl = document.createElement('div');

    vnode = createVNode(DialogComponent, { option });
    // 将组件渲染到这个el元素上
    render(vnode, divEl);
  
    // 渲染
    document.body.appendChild(divEl);
  }

  vnode.component.exposed.showDialog(option);
  
}