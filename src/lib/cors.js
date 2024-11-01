import Cors from 'cors';

// Initialiser le middleware CORS
const cors = Cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  origin: '*', // Autoriser les requêtes depuis Ionic
  credentials: true,
});

// Wrapper promisified pour exécuter le middleware dans Next.js
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default cors;
export { runMiddleware };
