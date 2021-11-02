import React, { Suspense, useCallback, useState } from "react";
import { hot } from "react-hot-loader/root";
import { createAsset } from "use-asset";
import styles from "./App.module.scss";

const Spinner = () => <span>Loading...</span>;

const asset = createAsset(async () => {
  const res = await fetch(`user`);
  return await res.json();
});

function Sso() {
  const { user } = asset.read();

  return (
    <section className={styles.Section}>
      <pre>{JSON.stringify({ user }, null, 2)}</pre>
      <nav>
        {user ? (
          <ul>
            <li>
              <a href="logout">Logout</a>
            </li>
          </ul>
        ) : (
          <ul>
            <li>
              <a href="auth/github">Sign In with GitHub</a>
            </li>
            <li>
              <a href="auth/google">Sign In with Google</a>
            </li>
          </ul>
        )}
      </nav>
    </section>
  );
}

function Jwt() {
  const [user, setUser] = useState(undefined);
  const [token, setToken] = useState(undefined);

  const handleLogin = useCallback(async () => {
    const id = 1;
    const res = await fetch(`jwt/login/${id}`);
    await res.json().then(({ token }) => setToken(token));
  }, []);
  const handleLogout = useCallback(() => {
    setUser(undefined);
    setToken(undefined);
  }, []);
  const handleProfile = useCallback(async () => {
    const res = await fetch(`jwt/profile`, {
      headers: token
        ? {
            authorization: `Bearer ${token}`,
          }
        : {},
    });
    return await res.json().then(setUser);
  }, [token]);

  return (
    <section className={styles.Section}>
      <pre>{JSON.stringify({ user }, null, 2)}</pre>
      <nav>
        <ul>
          <li>
            <button onClick={handleLogin}>Sign In</button>
          </li>
          <li>
            <button onClick={handleProfile}>User Profile</button>
          </li>
          {token && (
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          )}
        </ul>
      </nav>
    </section>
  );
}

function App() {
  return (
    <section className={styles.App}>
      <h1 className={styles.Nav}>sso</h1>
      <Suspense fallback={<Spinner />}>
        <Sso />
        <h2 className={styles.Nav}>jwt</h2>
        <Jwt />
      </Suspense>
    </section>
  );
}

export default hot(App);
