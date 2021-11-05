import deepcopy from "deepcopy";
import { events } from "./events";
import { onUnmounted } from "vue";

export function useCommand(data, focusData) {
  // 1.前进后退需要指针
  const state = {
    current: -1, // 前进后退的索引值
    queue: [], // 存放所有的操作命令 
    commands: {}, // 制作命令和执行功能的一个映射表 undo: () => {} redo: () => {}
    commandArray: [], // 存放所有的命令
    destroyArray: [] // 销毁列表
  };

  const registry = (command) => {
    state.commandArray.push(command);
    state.commands[command.name] = (...args) => { // 命令名字对应执行函数
      const { redo, undo } = command.execute(...args);
      redo();
      if (command.pushQueue) {
        let { queue, current } = state;

        // 如果先放了组件1 再放组件2, 撤回 -> 组件3
        // 组件1 -> 组件3

        if (queue.length > 0) {
          queue = queue.slice(0, current + 1); // 可能在放置的过程中有撤销操作, 所以根据当前最新的current值来计算新的队列
          state.queue = queue;
        }

        queue.push({ redo, undo }); // 保存指令的前进后退
        state.current = current + 1;
      }
    };
  };

  /* 注册我们需要的命令 */

  // 重做
  registry({
    name: 'redo',
    keyboard: 'ctrl+y',
    execute: () => {
      return {
        redo() {
          // 找到下一步还原
          const item = state.queue[state.current + 1];
          if (item && item.redo) {
            item.redo();
            state.current ++;
          }
        }
      }
    }
  });

  // 撤销
  registry({
    name: 'undo',
    keyboard: 'ctrl+z',
    execute: () => {
      return {
        redo() {
          // 找到上一步还原
          if (state.current === -1) return undefined; // 没有可以撤销的了
          const item = state.queue[state.current];
          item && item.undo && item.undo();
          state.current--;
        }
      }
    }
  });

  registry({ // 如果希望将操作放到队列中, 可以增加一个属性用来标识
    name: 'drag',
    pushQueue: true,
    init() { // 初始化指令, 默认就会执行
      this.before = null;
      // 监控拖拽开始事件, 保存状态
      const start = () => {
        this.before = deepcopy(data.value.blocks);
      };
      // 拖拽之后需要出发对应的指令
      const end = () => {
        state.commands.drag();
      };
      events.on('start', start);
      events.on('end', end);

      return () => {
        events.off('start', start);
        events.off('end', end);
      };
    },
    execute() {
      const before = this.before;
      const after = data.value.blocks;
      return {
        redo() { // 默认一松手就直接把当前的事情做了
          data.value = { ...data.value, blocks: after };
        },
        undo() { // 前一步的
          data.value = { ...data.value, blocks: before };
        }
      }
    }
  });

  registry({
    name: 'updateContainer', // 更新整个容器
    pushQueue: true,
    execute(newValue) {
      const state = {
        before: data.value,
        after: newValue
      };
      return {
        redo() {
          data.value = state.after;
        },
        undo() {
          data.value = state.before;
        }
      }
    }
  });

  // 置顶
  registry({
    name: 'placeTop',
    pushQueue: true,
    execute() {
      const before = deepcopy(data.value.blocks);
      // 置顶就是在所有的block中找到最大的zIndex
      const after = (() => {
        const { focus, unfocused } = focusData.value;
        const maxZIndex = unfocused.reduce((prev, block) => Math.max(prev, block.zIndex), -Infinity);

        focus.forEach(block => block.zIndex = maxZIndex + 1);
        // 让当前选中的比没有选中的最大zIndex+1即可
        return data.value.blocks;

      })();
      return {
        redo() {
          data.value = { ...data.value, blocks: after };
        },
        undo() {
          // 如果当前blocks前后一致则不会触发更新
          data.value = { ...data.value, blocks: before };
        }
      }
    }
  });

  // 置底
  registry({
    name: 'placeBottom',
    pushQueue: true,
    execute() {
      const before = deepcopy(data.value.blocks);
      const after = (() => {
        const { focus, unfocused } = focusData.value;

        const minZIndex = unfocused.reduce((prev, block) => Math.min(prev, block.zIndex), Infinity);

        // 不能直接-1 因为index不能出现负值
        // focus.forEach(block => block.zIndex = minZIndex - 1);

        // 如果最小的zIndex是负数, 那就把其他的图层向上放, 然后把自己弄成0
        if (minZIndex < 0) {
          const dur = Math.abs(minZIndex);
          minZIndex = 0;
          unfocused.forEach(block => block.zIndex += dur);
        }

        focus.forEach(block => block.zIndex = minZIndex);

        return data.value.blocks;
      })();
      return {
        redo() {
          data.value = { ...data.value, blocks: after };
        },
        undo() {
          data.value = { ...data.value, blocks: before };
        }
      }
    }
  });

  // 删除
  registry({
    name: 'delete',
    pushQueue: true,
    execute() {
      const state = {
        before: deepcopy(data.value.blocks),
        after: focusData.value.unfocused // 选中的都删除了, 留下的都是没选中的
      };
      return {
        redo() {
          data.value = { ...data.value, blocks: state.after };
        },
        undo() {
          data.value = { ...data.value, blocks: state.before };
        }
      }
    }
  });

  const keyboardEvent = (() => {
    const keyCodes = {
      90: 'z',
      89: 'y'
    };
    const onKeydown = (e) => {
      const { ctrlKey, keyCode } = e; // ctrl+z / ctrl+y
      let keyString = [];
      if (ctrlKey) keyString.push('ctrl');
      keyString.push(keyCodes[keyCode]);
      keyString = keyString.join('+');
      state.commandArray.forEach(({ keyboard, name }) => {
        if (!keyboard) return; // 没有键盘事件
        if (keyboard === keyString) {
          state.commands[name]();
          e.preventDefault();
        }
      });
    };
    const init = () => { // 初始化事件
      window.addEventListener('keydown', onKeydown);
      
      return () => { // 销毁事件
        window.removeEventListener('keydown', keyboardEvent);
      }
    };
    return init;
  })();

  ;(() => {
    // 监听键盘事件
    state.destroyArray.push(keyboardEvent());
    state.commandArray.forEach(command => command.init && state.destroyArray.push(command.init()));
  })();

  // 组建销毁的时候清理绑定的事件
  onUnmounted(() => {
    state.destroyArray.forEach(fn => fn && fn());
  });


  return state;

}