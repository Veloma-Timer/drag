import { events } from "./events";

export function useMenuDragger(containerRef, data) {
  let currentComponent = null;
    const dragenter = (e) => {
      e.dataTransfer.dropEffect = 'move';
    };
    const dragover = (e) => {
      e.preventDefault();
    };
    const dragleave = (e) => {
      e.dataTransfer.dropEffect = 'none';
    };
    const drop = (e) => {
      const blocks = data.value.blocks; // 内部原有的已经渲染的组件
      data.value = { ...data.value, blocks: [
        ...blocks,
        { 
          top: e.offsetY, 
          left: e.offsetX, 
          zIndex: 1, 
          key: currentComponent.key,
          alignCenter: true,
          props: {},
          model: {}
        }
      ] };
      currentComponent = null;
    };

    const dragstart = (e, component) => {
      // dragenter进入元素中 添加一个移动的标识
      // dragover 在目标元素经过 必须要组织默认行为 否则不能出发drop
      // dragleave 离开元素的时候 需要增加一个禁用标识
      // drop 松手的时候 根据拖拽的组件添加一个组件
      currentComponent = component;
      containerRef.value.addEventListener('dragenter', dragenter);
      containerRef.value.addEventListener('dragover', dragover);
      containerRef.value.addEventListener('dragleave', dragleave);
      containerRef.value.addEventListener('drop', drop);
      events.emit('start'); // 发布开始方法
    };

    const dragend = (e) => {
      containerRef.value.removeEventListener('dragenter', dragenter);
      containerRef.value.removeEventListener('dragover', dragover);
      containerRef.value.removeEventListener('dragleave', dragleave);
      containerRef.value.removeEventListener('drop', drop);
      events.emit('end'); // 发布结束方法
    }

    return {
      dragstart, dragend
    }
}