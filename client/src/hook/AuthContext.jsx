import { createContext } from "react";

export const AuthContext = createContext({
  app: null,
  auth: null,
  db: null,
  user: null,
  setUser: () => {},
  userData: {},
  setUserData: () => {},
  loading: false,
  setLoading: () => {}
})