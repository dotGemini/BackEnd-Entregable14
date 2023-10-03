import {fileURLToPath} from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {faker} from '@faker-js/faker'

const PRIVATE_KEY = "CoderKeyFeliz";
faker.local= "es";

export const createHash = password => bcrypt.hashSync(password,bcrypt.genSaltSync(10));
export const isValidPassword = (user,password) => bcrypt.hashSync(password,bcrypt.genSaltSync(10));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const authToken = (role) => {
    return async (req, res, next) => {
        const authHeader = req.headers.codercookietoken;
        if (!authHeader) return res.status(401).send({ status: "error", error: "Unauthorized" })
        const token = authHeader.split(' ')[1];
        jwt.verify(token, PRIVATE_KEY, (error, credentials) => {
            if (error) return res.status(401).send({ status: "error", error: "Unauthorized" })
            req.user = credentials;
            if (role !== req.user.admin) return res.send({status:0, msg: "forbidden"})
            next();
        })
}}

export const generateProductsFaker = () => {
    let products = [];
    for(let i = 0; i<50; i++){
        let newProd = {
            title: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            code: faker.string.alphanumeric({ length: { min: 5, max: 10 } }),
            price: faker.commerce.price({ dec: 0, symbol: '$' }),
            stock: faker.string.numeric(3),
            category: faker.commerce.department(),
            url: faker.internet.domainName(),
            id: faker.database.mongodbObjectId(),
        }
        products.push(newProd);
    }
    return products
}

export const validarToken = (req, res, next) => {
    try {
        const token = req.params.token;
        jwt.verify(token, PRIVATE_KEY);
        const data = jwt.decode(token);
        req.email = data.email;
        next();
    } catch (e) {
        res.send(`Hubo un error al intentar recuperar password: ${e.message}`)
    }
    
}


export default __dirname;