import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>Railfin Preview</h1>
      <ul>
        <li>
          <Link href="/login">/login</Link>
        </li>
        <li>
          <Link href="/app/editor">/app/editor</Link>
        </li>
      </ul>
    </main>
  );
}
