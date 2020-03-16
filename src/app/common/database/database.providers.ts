import { createConnection, getConnectionOptions } from 'typeorm';

export const databaseProviders = [
    {
        provide: 'DATABASE_CONNECTION',
        useFactory: async () => await createConnection(
            await getConnectionOptions(),
        ),
    },
];
