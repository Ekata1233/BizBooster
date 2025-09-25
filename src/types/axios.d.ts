import "axios";

declare module "axios" {
  // Make AxiosResponse.data default to `any` instead of `unknown`
  export interface AxiosResponse<T = any> {
    data: T;
  }
}
