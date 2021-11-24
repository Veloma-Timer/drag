import {defineComponent, createVNode, reactive, render} from "vue";
import deepcopy from "deepcopy";
import {ElDialog, ElButton, ElTable, ElTableColumn, ElInput} from "element-plus";

const TableComponent = defineComponent({
  props: {
    option: Object
  },
  setup(props, { expose }) {
    const state = reactive({
      option: props.option,
      isShow: false,
      editData: [], // 编辑的数据
    });

    const methods = {
      show(option) {
        state.option = option; // 把用户的配置缓存起来
        state.isShow = true;
        state.editData = deepcopy(option.data); // 通过渲染的数据 默认展现
      }
    };

    const add = () => {
      state.editData.push({});
    };

    const onCancel = () => {
      state.isShow = false;
    };

    const onConfirm = () => {
      state.option.onConfirm(state.editData);
      onCancel();
    };

    expose(methods);

    return () => <ElDialog v-model={state.isShow} title={state.option.config.label}>
      {{
        default: () => (<div>
          <div>
            <ElButton type="primary" onClick={add}>添加</ElButton>
            <ElButton>重置</ElButton>
          </div>
          <ElTable data={state.editData}>
            <ElTableColumn type="index" />
            { state.option.config.table.options.map((item, index) => {
              return <ElTableColumn label={item.label}>
                {{
                  default: ({ row }) => <ElInput v-model={row[item.field]} />
                }}
              </ElTableColumn>
            }) }
            <ElTableColumn label="操作">
              <ElButton type="danger">删除</ElButton>
            </ElTableColumn>
          </ElTable>
        </div>),
        footer: () => (<>
          <ElButton onClick={onCancel}>取消</ElButton>
          <ElButton type="primary" onClick={onConfirm}>确定</ElButton>
        </>)
      }}
    </ElDialog>

  }
});

let vm;
export const $tableDialog = (option) => {
  if (!vm) {
    const el = document.createElement('div');
    vm = createVNode(TableComponent, { option });
    render(vm, el);
    document.body.appendChild(el);
  }
  const { show } = vm.component.exposed;
  show(option);
};