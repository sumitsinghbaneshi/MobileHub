// api/server.js
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const PORT = 3001;

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Add custom routes here if needed

server.use(router);
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
});
