import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const { Database } = sqlite3.verbose();

export const openDatabase = async () => {
    const db = await open({
        filename: 'db.sqlite',
        driver: Database
    });
    return db;
}

export { default as SQL } from 'sql-template-strings';