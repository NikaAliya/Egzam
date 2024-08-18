import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  const token = req.header("Authorization")
  if (!token) return res.status(401).send("Access denied");
  const bearer = token.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(bearer, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err)
    res.status(400).send("Invalid token");
  }
};
