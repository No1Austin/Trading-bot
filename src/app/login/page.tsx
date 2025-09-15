"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"login"|"register">("login");

  const submit = async () => {
    const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body = mode === "login" ? { email, password } : { name, email, password };
    const res = await fetch(url, { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.token) { localStorage.setItem("token", data.token); window.location.href = "/dashboard"; }
    else { alert(data.error || "Error"); }
  };

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl mb-4">{mode === "login" ? "Login" : "Create Account"}</h1>
      {mode === "register" && (
        <input className="block mb-2 p-2 bg-gray-900 text-white" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
      )}
      <input className="block mb-2 p-2 bg-gray-900 text-white" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input type="password" className="block mb-2 p-2 bg-gray-900 text-white" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button onClick={submit} className="px-4 py-2 bg-emerald-600 rounded">Submit</button>
      <p className="mt-4">
        {mode === "login" ? "No account?" : "Already have one?"}{" "}
        <button className="underline" onClick={() => setMode(mode === "login" ? "register" : "login")}>Switch</button>
      </p>
    </main>
  );
}
