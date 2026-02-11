import { onRequest as __api_deposit_ts_onRequest } from "D:\\DOWNLOAD NEW\\yusuf-adi-pratama---optimization-report-10\\functions\\api\\deposit.ts"

export const routes = [
    {
      routePath: "/api/deposit",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_deposit_ts_onRequest],
    },
  ]