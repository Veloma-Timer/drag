import { defineComponent, computed, inject, ref } from "vue";
import './editor.scss';
import EditorBlock from "./editor-block";
import deepcopy from "deepcopy";
import { useMenuDragger } from "./useMenuDragger";
import { useFocus } from "./useFocus";
import { useBlockDragger } from "./useBlockDragger";
import { useCommand } from "./useCommand";
import { $dialog } from "../components/Dialog";
import { isFun } from "../utils";
import { ElButton } from 'element-plus';
import {$dropdown} from "../components/Dropdown";

export default defineComponent({
  name: 'Editor',
  props: {
    modelValue: Object
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    // 预览的时候, 内容不能再操作了, 可以点击或者输入内容 方便看效果
    const previewRef = ref(false);
    // 当前是否是编辑状态
    const editorRef = ref(true);

    const data = computed({
      get: () => props.modelValue,
      set: (newValue) => emit('update:modelValue', deepcopy(newValue))
    });

    const containerStyles = computed(() => ({
      width: data.value.container.width + 'px',
      height: data.value.container.height + 'px'
    }));

    const config = inject('config');

    const containerRef = ref(null);

    // 1.实现菜单拖拽功能
    const { dragstart, dragend } = useMenuDragger(containerRef, data);

    // 2.实现获取焦点, 选中后可能直接酒进行拖拽了
    const { blockMousedown, focusData, containerClear, lastSelectBlock, clearBlockFocus } = useFocus(data, previewRef, (e) => mousedown(e));
    // 3.实现拖拽多个元素的功能
    const { mousedown, markLine } = useBlockDragger(focusData, lastSelectBlock, data);

    const { commands } = useCommand(data, focusData);

    const buttons = [
      { label: '撤销', icon: 'icon-chehui1', handler: () => commands.undo() },
      { label: '重做', icon: 'icon-zhongzuo', handler: () => commands.redo() },
      { label: '导出', icon: 'icon-daochu', handler: () => {
        $dialog({ title: '导出JSON', content: JSON.stringify(data.value, null, 2) });
      } },
      { label: '导入', icon: 'icon-daoru2', handler: () => {
        $dialog({ title: '导入JSON', content: '', footer: true, apply: (text) => {
          // 这样去更改 无法保留历史记录
          // data.value = JSON.parse(text);
          commands.updateContainer(JSON.parse(text));
        } });
      } },
      { label: '置顶', icon: 'icon-zhiding', handler: () => commands.placeTop() },
      { label: '置底', icon: 'icon-zhidi', handler: () => commands.placeBottom() },
      { label: '删除', icon: 'icon-shanchu', handler: () => commands.delete() },
      { label: () => previewRef.value ? '编辑' : '预览', icon: () => previewRef.value ? 'icon-dianji' : 'icon-zitiyulan', handler: () => {
        previewRef.value = !previewRef.value;
        clearBlockFocus();
      } },
      { label: '关闭', icon: 'icon-guanbi', handler: () => {
        editorRef.value = false;
        clearBlockFocus();
      } }
    ];

    // 右键菜单事件
    const onContextMenuBlock = (e, block) => {
      e.preventDefault();

      $dropdown({
        el: e.target, //  // 以哪个元素为准, 产生dropdown
        content: <>
          <DropdownItem label="删除" icon="icon-shanchu" onClick={() => {}} />
          <DropdownItem label="置顶" icon="icon-zhiding" onClick={() => {}} />
          <DropdownItem label="置底" icon="icon-zhidi" onClick={() => {}} />
          <DropdownItem label="查看" icon="icon-shanchu" onClick={() => {}} />
          <DropdownItem label="导入" icon="icon-zitiyulan" onClick={() => {}} />
        </>
      });

    }

    return () => !editorRef.value ? (
      <>
        <div
          class="editor-container-canvas__content"
          style={containerStyles.value}
          style="margin: 0"
        >
          {
            data.value.blocks.map((block) => (
              <EditorBlock
                class="editor-block-preview"
                block={block}
              />
            ))
          }
        </div>
        <div class="top">
          <ElButton type="primary" onClick={() => editorRef.value = true}>继续编辑</ElButton>
        </div>
      </>
    ) : (
      <div class="editor">
        <div class="editor-left">
          {/* 根据注册列表渲染对应的内容 可以实现h5的拖拽 */}
          { config.componentList.map(component => (
            <div
              class="editor-left-item"
              draggable
              onDragstart={e => dragstart(e, component)}
              onDragend = {dragend}
            >
              <span>{ component.label }</span>
              <div>{ component.preview() }</div>
            </div>
          )) }
        </div>
        <div class="editor-top">
          {
            buttons.map((btn, index) => {
              const icon = isFun(btn.icon) ? btn.icon() : btn.icon;
              const label = isFun(btn.label) ? btn.label() : btn.label;
              return <div class="editor-top-button" onClick={btn.handler}>
                <i class={ icon }></i>
                <span>{ label }</span>
              </div>
            })
          }
        </div>
        <div class="editor-right">属性控制栏</div>
        <div class="editor-container">
          {/* 负责产生滚动条 */}
          <div class="editor-container-canvas">
            {/* 产生内容区 */}
            <div
              class="editor-container-canvas__content"
              style={containerStyles.value}
              ref={containerRef}
              onMousedown={containerClear}
            >
              {
                data.value.blocks.map((block, index) => (
                  <EditorBlock
                    class={block.focus ? 'editor-block-focus' : ''}
                    class={previewRef.value ? 'editor-block-preview' : ''}
                    block={block}
                    onMousedown={(e) => blockMousedown(e, block, index)}
                    onContextmenu={(e) => onContextMenuBlock(e, block)}
                  />
                ))
              }
              { markLine.x !== null && <div class="line-x" style={{ left: markLine.x + 'px' }}></div> }
              { markLine.y !== null && <div class="line-y" style={{ top: markLine.y + 'px' }}></div> }
            </div>
          </div>
        </div>
      </div>
    );
  }
});