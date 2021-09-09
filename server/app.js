import express from "express";
import { graphqlHTTP } from "express-graphql";
import schema from "./schema/schema"
import mongoose from "mongoose";

import cors from "cors";
import bodyParser from "body-parser";

const startServer = async () => {
    const app = express();

    app.use(cors());
    app.use(bodyParser.json());

    await mongoose.connect("mongodb://localhost:27017/TestDB", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    });

    app.use(`/graphql`, graphqlHTTP({
        schema,
        graphiql: true
    }))

    app.listen({port: 4001}, () => console.log("server started"));
}

startServer();