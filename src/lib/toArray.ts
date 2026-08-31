import type {Arrayable} from 'type-fest'

export default <T>(value: Arrayable<T>): Array<T> => {
  return Array.isArray(value) ? value : [value]
}
