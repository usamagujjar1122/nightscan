

import mongoose from 'mongoose';
import chalk from 'chalk';

import { devConfig } from '../config/config.js';

export const configureDb = () => {

    // mongoose.Promise = global.Promise;
    mongoose
        .connect(
            // "mongodb://admin:admin@ac-qex2e9m-shard-00-00.bchklen.mongodb.net:27017,ac-qex2e9m-shard-00-01.bchklen.mongodb.net:27017,ac-qex2e9m-shard-00-02.bchklen.mongodb.net:27017/?ssl=true&replicaSet=atlas-bj2w46-shard-0&authSource=admin&retryWrites=true&w=majority",
            // `mongodb+srv://${devConfig.db_username}:${devConfig.db_password}@${devConfig.db_host}/${devConfig.db_name}?retryWrites=true&w=majority`,
            // `mongodb+srv://nightscan:nightscanpassword@cluster0.z93dgf5.mongodb.net/nightscan?retryWrites=true&w=majority`,
            // 'mongodb+srv://nightscan:nightscanpassword@cluster0.z93dgf5.mongodb.net/nightscan?retryWrites=true&w=majority',
            // 'mongodb://nightscan:nightscanpassword@cluster0.z93dgf5.mongodb.net:27017,ac-qex2e9m-shard-00-01.bchklen.mongodb.net:27017,ac-qex2e9m-shard-00-02.bchklen.mongodb.net:27017/?ssl=true&replicaSet=atlas-bj2w46-shard-0&authSource=admin&retryWrites=true&w=majority'
            `mongodb://localhost/${devConfig.db_name}`,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
                useCreateIndex: true,
            }
        )
        .then(() => console.log('%s Database connected successfully!', chalk.green('✓')))
        .catch((err) => console.error('Could not connect to Mongodb.. ', err));

}