import express, { Request, Response } from "express";
import db from "db";
import { IQuery, IGetQuery, IDelQuery } from "./types";

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());

app.get("/", async (req: Request, res: Response) => {
  const { role }: IGetQuery = req.body;

  const params = [];
  let queryParams = "";
  if (role) {
    queryParams = `WHERE u.role = $1`;
    params.push(role);
  }

  const { rows } = await db.pool.query(
    `
  SELECT 
    p.firstname AS realname,
    p.state AS userstate,
    u.username AS nickname,
    u.role AS userrole
  FROM
    profiles p
  INNER JOIN
    users u
  ON
    p.id = u.profileid
  ${queryParams}
  `,
    params
  );

  res.json(rows).end();
});

app.post("/", async (req: Request, res: Response) => {
  const { firstname, lastname, state, username, email, role }: IQuery =
    req.body;

  const { rows } = await db.pool.query(
    `
  WITH new_user AS (
    INSERT INTO
      profiles
      (firstname, lastname, state)
    VALUES
      ($1, $2, $3)
      RETURNING id
  )
  INSERT INTO
    users
    (profileid, username, email, role)
  SELECT id, $4, $5, $6
    FROM new_user
  RETURNING *
  `,
    [firstname, lastname, state, username, email, role]
  );

  res.json(rows).end();
});

app.patch("/", async (req: Request, res: Response) => {
  // Update by email, for example
  const { firstname, lastname, state, username, email, role }: IQuery =
    req.body;

  const response: Record<string, any> = {};

  if (firstname || lastname || state) {
    const { rows } = await db.pool.query(
      `
      UPDATE profiles 
      SET 
        firstname = COALESCE (NULLIF($1, ''), firstname),
        lastname = COALESCE (NULLIF($2, ''), lastname),
        state = COALESCE (NULLIF($3, ''), state)
      FROM users u
      WHERE u.profileid = profiles.id
      AND u.email = $4
      RETURNING *
      `,
      [firstname, lastname, state, email]
    );

    Object.keys(rows[0]).forEach((item) => (response[item] = rows[0][item]));
  }

  if (username || role) {
    const { rows } = await db.pool.query(
      `
      UPDATE users
      SET
        username = COALESCE (NULLIF($1, ''), username),
        role = COALESCE (NULLIF($2, ''), role)
      WHERE email = $3
      RETURNING *
      `,
      [username, role, email]
    );

    Object.keys(rows[0]).map((item) => (response[item] = rows[0][item]));
  }

  res.json(response).end();
});

app.delete("/", async (req: Request, res: Response) => {
  // Update by email, for example
  const { email }: IDelQuery = req.body;

  const { rows } = await db.pool.query(
    `
    DELETE FROM users
    WHERE email=$1
    RETURNING *;
    `,
    [email]
  );

  res.json(rows).end();
});

app.listen(PORT, () => {
  console.log(`app runnin on port ${PORT}`);
  db.runMigrations();
});
