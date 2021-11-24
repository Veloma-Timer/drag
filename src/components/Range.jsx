import { defineComponent, computed } from 'vue';


export default defineComponent({
  props: {
    start: Number,
    end: Number
  },
  emits: ['update:start', 'update:end'],
  setup(props, { emit }) {
    const start = computed({
      get: () => props.start,
      set: (newValue) => emit('update:start', newValue)
    });
    const end = computed({
      get: () => props.end,
      set: (newValue) => emit('update:end', newValue)
    });
    return () => {
      return <div class="range">
        <input type="text" v-model={start.value}/>
        <span>~</span>
        <input type="text" v-model={end.value}/>
      </div>
    }
  }
})