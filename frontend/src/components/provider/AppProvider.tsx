"use client";
import { Provider } from "react-redux";
import React from "react";
import { store } from "@/frontend";

export interface AppProviderProps extends React.PropsWithChildren {}

export default function AppProvider({ children }: AppProviderProps) {
  return <Provider store={store}>{children}</Provider>;
}
