"use client";

import { useSyncExternalStore } from "react";
import { getSales, getServerSales, subscribeSales } from "@/data/store";

export function useSales() {
  return useSyncExternalStore(subscribeSales, getSales, getServerSales);
}
