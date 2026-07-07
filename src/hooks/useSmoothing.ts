import { useRef } from 'react';
import { lerp } from '../utils/math';

export function useSmoothedNumber(initialValue: number, speed = 0.12) {
  const valueRef = useRef(initialValue);

  function update(target: number) {
    valueRef.current = lerp(valueRef.current, target, speed);
    return valueRef.current;
  }

  function set(value: number) {
    valueRef.current = value;
  }

  return { valueRef, update, set };
}
