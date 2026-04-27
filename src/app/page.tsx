import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Roero Infissi</h1>
        <p className={styles.subtitle}>Sistema Preventivatore</p>
        <p className={styles.description}>
          Gestisci clienti, prodotti e preventivi in modo semplice e professionale.
        </p>

        <div className={styles.actions}>
          <Link href="/login" className="btn btn-primary btn-lg">
            Accedi
          </Link>
          <Link href="/register" className="btn btn-outline btn-lg">
            Registrati
          </Link>
        </div>
      </div>
    </div>
  );
}
