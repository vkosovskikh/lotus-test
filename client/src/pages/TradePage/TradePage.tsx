import { useEffect, useState } from "react";
import { apiBaseUrl } from "../../api/baseApi";

export default function TradePage() {
  const [hello, setHello] = useState("");

  useEffect(() => {
    fetch(`${apiBaseUrl}/hello`)
      .then((res) => {
        return res.text();
      })
      .then((data) => {
        setHello(data);
      });
  }, []);

  return <div>{hello}</div>;
}
