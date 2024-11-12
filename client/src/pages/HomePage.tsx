import { useEffect, useState } from "react";

export default function HomePage() {
  const [hello, setHello] = useState("");

  useEffect(() => {
    fetch("/api/hello")
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
