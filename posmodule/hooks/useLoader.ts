"use client";

import { useState } from "react";

export function useLoader() {
  const [loading, setLoading] = useState(false);

  async function run<T>(operation: () => Promise<T>): Promise<T> {
    setLoading(true);
    try {
      return await operation();
    } finally {
      setLoading(false);
    }
  }

  return { loading, run };
}
