import { redirect } from "next/navigation";

export default function Home() {
  // O middleware já garante a sessão; encaminha pro painel.
  redirect("/inicio");
}
