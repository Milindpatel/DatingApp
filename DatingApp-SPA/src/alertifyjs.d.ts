declare module 'alertifyjs' {
  interface Alertify {
    confirm(message: string, onOk: () => void): unknown;
    success(message: string): unknown;
    error(message: string): unknown;
    warning(message: string): unknown;
    message(message: string): unknown;
  }
  const alertify: Alertify;
  export default alertify;
}
