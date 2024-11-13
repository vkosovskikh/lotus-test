import { useEffect, useState } from "react";
import { apiBaseUrl } from "../../api/baseApi";

export default function TradePage() {
  const [hello, setHello] = useState("asdf");

  return <div>{hello}</div>;
}
