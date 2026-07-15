import { v4 as uuidv4 } from 'uuid';

const requestId = (req, res, next) => {
  const id = req.headers['x-request-id'] || uuidv4();
  res.locals.requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
};

export default requestId;
