import { ref } from 'vue';

/** A tiny boolean ref helper */
export function useBoolean(initial = false) {
  const bool = ref(initial);

  function setBool(value: boolean) {
    bool.value = value;
  }

  function setTrue() {
    setBool(true);
  }

  function setFalse() {
    setBool(false);
  }

  function toggle() {
    setBool(!bool.value);
  }

  return { bool, setBool, setTrue, setFalse, toggle };
}
