# Primsa Schema database commands:

_Make sure the database is running_

### Reload Schema

npm run prisma:generate

### Prisma Push to Database

- Prisma push - Only works for Local
  npm run prisma:push

# Migration of Database - Generation of Sql commands

- create migration
  npx prisma migrate dev --name {Insert Name of Migration Here}
  _npx is just a helper command_

* Resets Local Databse
  npx prisma migrate reset
