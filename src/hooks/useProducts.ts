"use client";

import { useSyncExternalStore } from "react";
import {
  getProducts,
  getServerProducts,
  subscribeProducts,
} from "@/data/store";

export function useProducts() {
  return useSyncExternalStore(subscribeProducts, getProducts, getServerProducts);
}
