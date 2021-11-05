import { ref, computed } from 'vue';

export function useFocus(data, previewRef, callback) {

  const selectIndex = ref(-1); // 表示没有任何节点选中

  // 最后选择的那一个
  const lastSelectBlock = computed(() => data.value.blocks[selectIndex.value]);

  // 获取哪些元素被选中
  const focusData = computed(() => {
    const focus = [];
    const unfocused = [];
    data.value.blocks.forEach(block => (block.focus ? focus : unfocused).push(block));
    return { focus, unfocused };
  });
  const clearBlockFocus = () => {
    data.value.blocks.forEach(block => block.focus = false);
  }
  const containerClear = () => {
    if (previewRef.value) return;
    clearBlockFocus();
    selectIndex.value = -1;
  }
  // 当鼠标按下的时候
  const blockMousedown = (e, block, index) => {
    if (previewRef.value) return;
    e.preventDefault();
    e.stopPropagation();
    // block上 我们规定一个属性 focus 获取焦点后就将focus变为true
    if (e.shiftKey) {
      if (focusData.value.focus.length <= 1) {
        block.focus = true; // 当前只有一个节点被选中时, 按住shift键也不会切换focus状态
      } else {
        block.focus = !block.focus;
      }
    } else {
      if (!block.focus) {
        clearBlockFocus();
        block.focus = true; // 要清空其他人的focus属性
      }
      // 当自己已经被选中了, 再点击时不应该取消
    }
    selectIndex.value = index;
    callback(e);
  };
  return { blockMousedown, focusData, containerClear, lastSelectBlock, clearBlockFocus };
}