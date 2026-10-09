import dotenv from 'dotenv';
import mysql, { Connection } from 'mysql2';

dotenv.config();


const conexao = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    connectionLimit: 10 // limite de conexões simultâneas abertas
})

export default conexao.promise();