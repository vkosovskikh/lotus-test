import { useEffect, useState } from "react";
import { apiBaseUrl } from "../api/baseApi";

export default function HomePage() {
  const [hello, setHello] = useState("");

  useEffect(() => {
    fetch(`${apiBaseUrl}/hello`)
      .then((res) => {
        return res.text();
      })
      .then((data) => {
        console.log(data);
        setHello(data);
      });
  }, []);

  return <div>{hello}</div>;
}
