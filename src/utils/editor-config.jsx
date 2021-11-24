// 列表区, 可以显示所有的物料
// key对应的组件映射关系
import {ElButton, ElInput, ElOption, ElSelect} from 'element-plus';
import Range from "../components/Range";

function createEditorConfig() {
  const componentList = [];
  const componentMap = {};

  return {
    componentList,
    componentMap,
    register: (component) => {
      componentList.push(component);
      componentMap[component.key] = component;
    }
  }

}

export const config = createEditorConfig();
const { register } = config;

const createInputProp = (label) => ({ type: 'input', label });
const createColorProp = (label) => ({ type: 'color', label });
const createSelectProp = (label, options) => ({ type: 'select', label, options });
const createTableProp = (label, table) => ({ type: 'table', label, table });

register({
  key: 'text',
  label: '文本',
  resize: {
    width: true,
    height: true
  },
  preview: () => '预览文本',
  render: ({ props }) => <span style={{ color: props.color, fontSize: props.size }}>{ props.text || '渲染文本' }</span>,
  props: {
    text: createInputProp('文本内容'),
    color: createColorProp('字体颜色'),
    size: createSelectProp('字体大小', [
      { label: '14px', value: '14px' },
      { label: '20px', value: '20px' },
      { label: '24px', value: '24px' },
      { label: '30px', value: '30px' },
      { label: '34px', value: '34px' }
    ])
  }
});

register({
  key: 'button',
  label: '按钮',
  resize: {
    width: true,
    height: true
  },
  preview: () => <ElButton>预览按钮</ElButton>,
  render: ({ props, size }) => <ElButton style={{ height: size.height + 'px', width: size.width + 'px' }} type={props.type} size={props.size}>{ props.text || '渲染按钮' }</ElButton>,
  props: {
    text: createInputProp('按钮内容'),
    type: createSelectProp('按钮类型', [
      { label: '基础', value: 'primary' },
      { label: '成功', value: 'success' },
      { label: '警告', value: 'warning' },
      { label: '危险', value: 'danger' },
      { label: '文本', value: 'text' },
    ]),
    size: createSelectProp('按钮尺寸', [
      { label: '默认', value: '' },
      { label: '中等', value: 'medium' },
      { label: '小的', value: 'small' },
      { label: '极小的', value: 'mini' }
    ])

  }
});

register({
  key: 'input',
  label: '输入框',
  resize: {
    width: true, // 更改输入框的横向大小
    height: true
  },
  preview: () => <ElInput placeholder="预览输入框" />,
  render: ({ model, size }) => <ElInput style={{ width: size.width + 'px', height: size.height + 'px' }} {...model.default} placeholder="渲染输入框" />,
  model: {
    default: '绑定字段'
  }
});

register({
  key: 'range',
  label: '范围选择器',
  resize: {
    width: true,
    height: true
  },
  preview: () => <Range placeholder="预览输入框" />,
  render: ({ model }) => {
    return <Range {...{
      start: model.start.modelValue,
      'onUpdate:start': model.start['onUpdate:modelValue'],
      end: model.end.modelValue,
      'onUpdate:end': model.end['onUpdate:modelValue']
    }} />
  },
  model: {
    start: '开始范围字段',
    end: '结束范围字段'
  }
});

register({
  key: 'select',
  label: '下拉框',
  resize: {
    width: true,
    height: true
  },
  preview: () => <ElSelect></ElSelect>,
  render: ({ props, model }) => (<ElSelect {...model.default}>
    { (props.options || []).map((opt, index) => <ElOption label={opt.label} value={opt.value} />) }
  </ElSelect>),
  props: {
    options: createTableProp('下拉选项', {
      options: [
        { label: '显示值', field: 'label' },
        { label: '绑定值', field: 'value' }
      ],
      key: 'label', // 显示给用户的值应该是label
    })
  },
  model: {
    default: '绑定字段'
  }
});