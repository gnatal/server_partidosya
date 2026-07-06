import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { User } from './user/entities/user.entity';
import { Profile } from './user/entities/profile.entity';
import { Visitor } from './user/entities/visitor.entity';
import { RefreshToken } from './user/entities/refresh-token.entity';
import { Team } from './team/entities/team.entity';
import { Championship } from './championship/entities/championship.entity';
import { Stand } from './stands/entities/stand.entity';
import { Stats } from './stats/entities/stats.entity';
import { Staff } from './staff/entities/staff.entity';

// Manual .env parsing to avoid external dependency issues during CLI execution
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  for (const line of envConfig.split('\n')) {
    const match = line.trim().match(/^([\w.-]+)\s*=\s*(.*)?$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      // Remove surrounding quotes if any
      if (
        value.length > 0 &&
        value.charAt(0) === '"' &&
        value.charAt(value.length - 1) === '"'
      ) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value.trim();
    }
  }
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'partidosya_db',
  synchronize: false,
  logging: true,
  entities: [
    User,
    Profile,
    Visitor,
    RefreshToken,
    Team,
    Championship,
    Stand,
    Stats,
    Staff,
  ],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
});
