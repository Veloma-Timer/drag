import { reactive } from 'vue';
import { events } from './events';

export function useBlockDragger(focusData, lastSelectBlock, data) {
  let dragState = {
    startX: 0,
    startY: 0,
    startLeft: 0,
    startTop: 0,
    lines: [],
    startPos: [],
    dragging: false // 默认不是正在拖拽
  };
  const markLine = reactive({
    x: null,
    y: null
  });
  const mousedown = (e) => {

    const { width: bWidth, height: bHeight } = lastSelectBlock.value;

    dragState = {
      startX: e.clientX,
      startY: e.clientY, // 记录每一个选中的位置
      startLeft: lastSelectBlock.value.left, // b节点拖拽前的位置 left和top
      startTop: lastSelectBlock.value.top,
      dragging: false,
      startPos: focusData.value.focus.map(({ top, left }) => ({ top, left })),
      lines: (() => {
        const { unfocused } = focusData.value; // 获取其他没选中的以他们的位置做辅助线
        const lines = { x: [], y: [] }; // 计算横线的位置, 用y来存放 x存的是纵向的
        [
          ...unfocused,
          { top: 0, left: 0, width: data.value.container.width, height: data.value.container.height }
        ].forEach((block) => {
          const { top: aTop, left: aLeft, width: aWidth, height: aHeight } = block;

          // 顶对顶, 当此元素拖拽到和a元素top一致的时候, 要显示这根辅助线, 辅助线的位置就是aTop
          // showTop是显示线的位置, top是b元素的位置
          lines.y.push({ showTop: aTop, top: aTop });
          lines.y.push({ showTop: aTop, top: aTop - bHeight }); // 顶对低
          lines.y.push({ showTop: aTop + aHeight / 2, top: aTop + aHeight / 2 - bHeight  / 2 }); // 中对中
          lines.y.push({ showTop: aTop + aHeight, top: aTop + aHeight }); // 低对顶
          lines.y.push({ showTop: aTop + aHeight, top: aTop + aHeight - bHeight }); // 低对低

          lines.x.push({ showLeft: aLeft, left: aLeft }); // 左对左
          lines.x.push({ showLeft: aLeft + aWidth, left: aLeft + aWidth }); // 左对右
          lines.x.push({ showLeft: aLeft + aWidth / 2, left: aLeft + aWidth / 2 - bWidth / 2 }); // 中对中
          lines.x.push({ showLeft: aLeft + aWidth, left: aLeft + aWidth - bWidth }); // 右对右
          lines.x.push({ showLeft: aLeft, left: aLeft - bWidth }); // 左对右

        });
        return lines;
      })()
    };
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
  };

  const mousemove = (e) => {
    let { clientX: moveX, clientY: moveY } = e;
    if (!dragState.dragging) {
      dragState.dragging = true;
      events.emit('start'); // 触发事件就会记住拖拽前的位置
    }

    // 计算当前元素最新的left和top 去线里面找, 找到显示线
    // 鼠标移动后 - 鼠标移动前 + left
    const left = moveX - dragState.startX + dragState.startLeft;
    const top = moveY - dragState.startY + dragState.startTop;

    // 先计算横线 距离参照物元素还有5px的时候 就显示这根线
    let y = null;
    let x = null;
    for (let item of dragState.lines.y) {
      const { top: t, showTop: s } = item; // 获取每一根线
      if (Math.abs(t - top) <= 5) { // 如果小于5说明横向接近了
        y = s; // 线要显示的位置
        // 实现快速和这个元素贴在一起
        moveY = dragState.startY - dragState.startTop + t; // 容器距离顶部的距离 + 目标的高度 就是最新的moveY
        break; // 找到一根线就跳出循环
      }
    }

    for (let item of dragState.lines.x) {
      const { left: l, showLeft: s } = item; // 获取每一根线
      if (Math.abs(l - left) <= 5) { // 如果小于5说明横向接近了
        x = s; // 线要显示的位置
        // 实现快速和这个元素贴在一起
        moveX = dragState.startX - dragState.startLeft + l; // 容器距离顶部的距离 + 目标的高度 就是最新的moveY
        break; // 找到一根线就跳出循环
      }
    }
    markLine.x = x; // markLine是一个响应式数据, x, y更新了会导致识图更新
    markLine.y = y;

    const durX = moveX - dragState.startX; // 之前和之后的距离
    const durY = moveY - dragState.startY;

    focusData.value.focus.map((block, index) => {
      block.top = dragState.startPos[index].top + durY;
      block.left = dragState.startPos[index].left + durX;
    });

  };

  const mouseup = (e) => {
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
    markLine.x = null;
    markLine.y = null;
    // 如果只是点击就不会触发
    if (dragState.dragging) {
      dragState.dragging = false;
      events.emit('end');
    };
  };
  return { mousedown, markLine };
}