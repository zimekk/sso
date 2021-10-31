import React, { Suspense } from "react";
import { hot } from "react-hot-loader/root";
import { createAsset } from "use-asset";
import styles from "./App.module.scss";

const Spinner = () => <span>Loading...</span>;

const asset = createAsset(async () => {
  const res = await fetch(`user`);
  return await res.json();
});

function Section() {
  const { user } = asset.read();
  return (
    <section className={styles.Section}>
      <pre>{JSON.stringify({ user }, null, 2)}</pre>
      <nav>
        {user ? (
          <a href="/logout">Logout</a>
        ) : (
          <a href="/auth/google">Sign In with Google</a>
        )}
      </nav>
    </section>
  );
}

function App() {
  return (
    <section className={styles.App}>
      <h1 className={styles.Nav}>sso</h1>
      <Suspense fallback={<Spinner />}>
        <Section />
      </Suspense>
    </section>
  );
}

export default hot(App);
