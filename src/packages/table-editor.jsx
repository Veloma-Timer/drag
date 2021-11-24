import { defineComponent, computed } from 'vue';
import deepcopy from "deepcopy";
import {ElButton, ElTag} from "element-plus";
import {$tableDialog} from "../components/TableDialog";

export default defineComponent({
  name: 'TableEditor',
  props: {
    propConfig: Object,
    modelValue: Array
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {

    const data = computed({
      get: () => props.modelValue || [],
      set: (newValue) => emit('update:modelValue', deepcopy(newValue))
    });

    const add = () => {
      $tableDialog({
        config: props.propConfig,
        data: data.value,
        onConfirm: (v) => data.value = v
      });
    };

    return () => <div>
      {/* 此下拉框没有任何数据, 直接显示一个按钮即可 */}
      { (!data.value || data.value.length === 0) && <ElButton onClick={add}>添加</ElButton> }

      { (data.value || []).map(item => <ElTag onClick={add} style="margin-right: 5px">{item[props.propConfig.table.key]}</ElTag>) }
    </div>
  }
});