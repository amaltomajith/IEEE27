import type { Metadata } from "next";
import Home from "../page";

// Legacy Google Sites slug. Same content as the home page, canonical points to "/".
export const metadata: Metadata = { title: "Welcome to IIC 2027", alternates: { canonical: "/" } };

export default Home;
