export default (value: string) => {
  return value.replaceAll('\r\n', '\n').replaceAll('\r', '\n').split('\n')
}
