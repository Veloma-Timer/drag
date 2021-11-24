import {defineComponent, inject, reactive, watch} from 'vue';
import {
  ElForm,
  ElFormItem,
  ElButton,
  ElInputNumber,
  ElInput,
  ElColorPicker,
  ElSelect,
  ElOption
} from "element-plus";
import deepcopy from "deepcopy";
import TableEditor from './table-editor';


export const EditorOperator = defineComponent({
  name: 'EditorOperator',
  props: {
    block: Object, // 用户最后选中的元素
    data: Object, // 当前所有的数据
    updateContainer: Function,
    updateBlock: Function
  },
  setup(props) {
    const config = inject('config'); // 组件的配置信息

    const state = reactive({
      editData: {}
    });
    const reset = () => {
      // 说明要绑定的使容器的宽度和高度
      if (!props.block) {
        state.editData = deepcopy(props.data.container);
      } else {
        state.editData = deepcopy(props.block);
      }
    };
    const apply = () => {
      // 更改组件容器的大小
      if (!props.block) {
        props.updateContainer({ ...props.data, container: state.editData });
      } else {
        props.updateBlock(state.editData, props.block);
      }
    }
    watch(() => props.block, reset, { immediate: true });
    return () => {
      const content = [];
      // 如果没有选中的话 就渲染下面的东西
      if (!props.block) {
        content.push(<>
          <ElFormItem label="容器宽度">
            <ElInputNumber v-model={state.editData.width} />
          </ElFormItem>
          <ElFormItem label="容器高度">
            <ElInputNumber v-model={state.editData.height} />
          </ElFormItem>
        </>)
      } else {
        const component = config.componentMap[props.block.key];
        if (component && component.props) { // { tex: {}, type: {}, options: [] }
          content.push(Object.entries(component.props).map(([propName, propConfig]) => {
            return <ElFormItem label={propConfig.label}>
              {{
                input: () => <ElInput v-model={state.editData.props[propName]} />,
                color: () => <ElColorPicker v-model={state.editData.props[propName]} />,
                select: () => <ElSelect v-model={state.editData.props[propName]}>
                  {propConfig.options.map(opt => <ElOption label={opt.label} value={opt.value} />)}
                </ElSelect>,
                table: () => <TableEditor propConfig={propConfig} v-model={state.editData.props[propName]} />

              }[propConfig.type]()}
            </ElFormItem>
          }));
        }

        if (component && component.model) {
          content.push(Object.entries(component.model).map(([modelName, label]) => {
            return <ElFormItem label={label}>
              <ElInput v-model={state.editData.model[modelName]} />
            </ElFormItem>
          }))
        }
      }

      return (<ElForm labelPosition="top" style="padding: 30px">
        {content}
        <ElFormItem>
          <ElButton type="primary" onClick={apply}>应用</ElButton>
          <ElButton onClick={reset}>重置</ElButton>
        </ElFormItem>
      </ElForm>)
    }
  }
});