import 'axios';

declare module 'axios' {
  interface AxiosResponse<T = any> {
    data: T;
  }
}
