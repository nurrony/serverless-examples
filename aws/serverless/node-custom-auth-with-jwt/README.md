## How to setup

1.  execute `npm install`
2.  create `secrets.json` with these content


```
{
  "DB_HOST": "mongodb://<username>:<password>@<hostname>:<port>",
  "DB_NAME": "<db-name>",
  "JWT_SECRET": "<really-strong-secret>"
}
```

3.  deploy it as `sls deploy`
