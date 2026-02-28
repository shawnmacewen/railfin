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
          <Link href="/create">/create</Link>
        </li>
        <li>
          <Link href="/library">/library</Link>
        </li>
        <li>
          <Link href="/campaigns">/campaigns</Link>
        </li>
        <li>
          <Link href="/configure">/configure</Link>
        </li>
      </ul>
    </main>
  );
}
