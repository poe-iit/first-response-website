import { createContext } from "react";

export const AuthContext = createContext({
  app: null,
  auth: null,
  user: null,
  setUser: () => {},
  loading: false,
  setLoading: () => {}
})