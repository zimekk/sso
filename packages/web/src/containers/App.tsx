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
              <a href="/logout">Logout</a>
            </li>
          </ul>
        ) : (
          <ul>
            <li>
              <a href="/auth/github">Sign In with GitHub</a>
            </li>
            <li>
              <a href="/auth/google">Sign In with Google</a>
            </li>
          </ul>
        )}
      </nav>
    </section>
  );
}

const authorization = {
  token: null,
};

const login = async (id) => {
  const res = await fetch(`jwt/login/${id}`);
  return await res
    .json()
    .then(({ token }) => Object.assign(authorization, { token }));
};

const profile = async () => {
  const res = await fetch(`jwt/profile`, {
    headers: authorization.token
      ? {
          authorization: `Bearer ${authorization.token}`,
        }
      : {},
  });
  return await res.json();
};

function Jwt() {
  const [user, setUser] = useState(undefined);

  const handleLogin = useCallback(() => login(1), []);
  const handleProfile = useCallback(() => profile().then(setUser), []);

  return (
    <section className={styles.Section}>
      <pre>{JSON.stringify({ user }, null, 2)}</pre>
      <nav>
        <ul>
          <li>
            <button onClick={handleLogin}>login</button>
          </li>
          <li>
            <button onClick={handleProfile}>profile</button>
          </li>
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
