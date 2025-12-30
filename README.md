<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<h1>Domain Ranking Backend</h1>
<h2>Features</h2>
<ul>
  <li>Fetches domain ranking history from Tranco API</li>
  <li>Stores data in Neon PostgreSQL via Sequelize</li>
  <li>Caches results for 24 hours to avoid dedundant API calls</li>
  <li>Supports single and mult-domain ranking fetch</li>
  <li>RESTful endpoints for querying and testing</li>
</ul>

<h2>Installation</h2>

<h3>1. Clone the repository</h3>

```
git clone https://github.com/your-username/domain-ranking-backend.git
cd domain-ranking-backend
```

<h3>2. Install dependencies</h3>

````
npm install
````

<h3>3. Configure environment variables</h3>

<p>Create a .env file in the root directory:</p>

```
DB_USER=neon_username
DB_PASS=neon_password
DB_HOST=neon_host
DB_NAME=neon_db
DB_PORT=neon_port
```
<p>Make sure your Neon database is set up and accessible.</p>

<h3>4. Run database migrations (if needed)</h3>
<p>If you're using Sequelize migrations:</p>

```
npx sequelize-cli db:migrate
```


<h2>▶️ Running the App<h2></h2>
<h3>Development mode</h3>

```
npm run start:dev
```

<h2>Production mode</h2>

````
npm run build
npm run start:prod
````

<h2>🧪 Testing the API</h2>
<h3>✅ Single domain ranking</h3>

```
GET /ranking/tranco?domain=example.com
(http://localhost:3000/ranking/tranco?domains=google.com)
```


<p>Returns cached data if less than 24 hours old, otherwise fetches fresh data from Tranco and updates the database.</p>

<h3>✅ Multi-domain ranking (optional)</h3>

````
[GET /ranking/tranco/multi?domains=google.com,facebook.com,amazon.com](http://localhost:3000/ranking/tranco/multi?domains=google.com,facebook.com,amazon.com)
````

<p>Fetches and stores rankings for multiple domains.</p>

<h3>✅ View all stored rankings</h3>

```
GET /ranking
```


<p>Returns all records from the database.</p>

<h2>🧠 Project Structure</h2>

```
src/
├── ranking/
│   ├── entities/
│   │   └── ranking.entity.ts
│   ├── ranking.service.ts
│   ├── ranking.controller.ts
│   └── ranking.module.ts
├── app.module.ts
└── main.ts

```

<h2>🧩 Tech Stac</h2>
<ul>
<li>- NestJS – backend framework</li>
<li>- Sequelize – ORM</li>
<li>- Neon PostgreSQL – cloud database</li>
<li>- Axios – HTTP client for Tranco API</li>
<li>- RxJS – used with Axios for async handling</li>
</ul>


<h2>📦 Deployment Notes</h2>
<ul>
  <li>- Ensure your Neon database allows external connections</li>
<li>- Use environment variables for secrets and URLs</li>
<li>- Enable CORS in main.ts if connecting to a frontend
app.enableCors();</li>
</ul>


