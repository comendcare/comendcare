# Preamble

This repository is for Comend's core product and landing page.
We're using a monolithic architecture.

## Bootstrapping

### Templates

I've bootstrapped this project using an older version of the platforms template by Next.js (
specifically [this](https://github.com/realmikesolo/platforms) version that was forked from the [main repo](https://github.com/vercel/platforms))
I didn't use the main repo because they recently migrated to Drizzle ORM, but I wanted to use Prisma.

I've used a modified directory structure, which changes the configuration a bit.
For the most part the steps described [here](https://vercel.com/guides/nextjs-multi-tenant-application#3.-publish-your-prisma-schema) still apply (if this guide changes, consult the Wayback machine).

Multi-tenancy features are based off the way [Openpanel](https://github.com/Openpanel-dev/openpanel) has implemented organizations, memberships, and invites.

### Dependencies

| Name          | Notes                                                                                                                                                                                                                                      | Documentation                                                       | Version        | Product Database                                                           |
|---------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------|----------------|----------------------------------------------------------------------------|
| Typescript    | Our language of choice.                                                                                                                                                                                                                    | https://www.typescriptlang.org/docs/                                | ^1.2           |                                                                            |
| React         | Our frontend framework of choice.                                                                                                                                                                                                          | https://react.dev/                                                  | ^18            |                                                                            |
| NextJS        | Handles serverside rendering, navigation, metadata, and higher-level frontend needs (for example, our product-tour is built with Onborda, which depends on NextJS). We also use server actions to access the database and write API calls. | https://nextjs.org/docs                                             | ^14            |                                                                            |
| Next-Auth     | Our authentication package of choice. Integrates well with NextJS projects and easy to set up. We may eventually use Auth.js when it is stable.                                                                                            | https://next-auth.js.org/                                           | ^4.24.7        |                                                                            |
| Zod           | For form validation and handling of complex/dynamic types in our frontend. This is often used in hand with react-hook-forms                                                                                                                | https://zod.dev/                                                    | ^3.22.4        |                                                                            |
| Faker.js      | Used in development environments to generate dummy data for building interfaces or making mock API calls.                                                                                                                                  | https://zod.dev/                                                    | ^3.22.4        |                                                                            |
| shadcn/ui     | Our component library of choice. Uses Radix in the backend (you may occasionally need to refer to documentation there)                                                                                                                     | https://ui.shadcn.com/                                              | latest         |                                                                            |
| Tailwind CSS  | All styling is done with Tailwind, but we customize the global.css file as needed.                                                                                                                                                         | https://tailwindcss.com/                                            | ^3.3           |                                                                            |
| React-icons   | We source all icons from this all-in-one package. We primarily use Font-Awesome’s set of icons but will occasionally use other sets if necessary.                                                                                          | https://react-icons.github.io/react-icons/                          | ^5.2.1         |                                                                            |
| Framer Motion | For all our animation needs.                                                                                                                                                                                                               | https://www.framer.com/motion/                                      | ^11.1.7        |                                                                            |
| Sendgrid      | For all email related features.                                                                                                                                                                                                            | https://github.com/sendgrid/sendgrid-nodejs/tree/main/packages/mail | ^8.1.3         |                                                                            |
| Prisma        | Our ORM of choice.                                                                                                                                                                                                                         | https://www.prisma.io/docs                                          | ^4.13          |                                                                            |
| Postgres      | Our database of choice.                                                                                                                                                                                                                    | https://www.postgresql.org/docs/                                    | latest (^16.3) |                                                                            |
| Vercel        | Hosting the frontend interface.                                                                                                                                                                                                            | https://vercel.com/docs                                             | n/a            |                                                                            |
| GCP           | For hosting the database on cloud sql. You’ll need to install the CLI and the proxy service for local development and deployment. We use SSL certificates in production to allow the deployment on Vercel to access the production db.     | https://cloud.google.com/docs                                       | n/a            |                                                                            |
| Mixpanel      | We also use Google Analytics and Vercel Analytics, but for more complex product analytics Mixpanel (and its open source sister Openpanel) are used.                                                                                        | https://developer.mixpanel.com/reference/overview                   | latest         |                                                                            |
| Docker        | We recommend using Docker to set up and run a database. The rest of your environment can be set up locally.                                                                                                                                | https://docs.docker.com/                                            | n/a            |                                                                            |
| React Flow    | Used for rendering editable research plans                                                                                                                                                                                              | https://reactflow.dev/                                              | ^12            | @Untitled  (https://www.notion.so/d32bfe3e9c3b4144b81dd835413e3deb?pvs=21) |
| Zustand       | Used as a simpler, SSR friendlier, and less boilerplate, state management solution.                                                                                                                                                        | https://zustand-demo.pmnd.rs/                                       |                | @Untitled  (https://www.notion.so/d32bfe3e9c3b4144b81dd835413e3deb?pvs=21) |
| Dnd kit       | For drag and drop interactions across our products.                                                                                                                                                                                        | https://dndkit.com/                                                 |                | @Untitled  (https://www.notion.so/d32bfe3e9c3b4144b81dd835413e3deb?pvs=21) |

# Local Development

## Environment Setup

### Setup

1. Clone the Comend repo
2. Setup environment variables - create a `.env` file in the comend root directory (ask a team member for the
   environment variable contents)
3. Create the Docker container

    1. Run the [Docker Desktop](https://www.docker.com/products/docker-desktop/) app
    2. Run the command `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=comend --name comend-psql postgres`
    3. Check docker desktop to confirm that the container has been created and running

4. Create the database

   > Note: After switching to the postgres user you can call `psql` to switch to psql
   mode. [PSQL Mode Manual here](https://www.postgresql.org/docs/current/app-psql.html)

    1. Run the following on the command line to access the Virtual Machine `docker exec -it comend-psql bash`
    2. Run `su postgres` to switch to the postgres user
    3. Run `createdb -U postgres comend-psql` to create the database if you're using Bash mode.
       Run `CREATE DATABASE comend-psql TEMPLATE template0` to create the database if you're using psql mode.
        - (optional) To check that the database has been created, enter psql mode (if you haven't already), and
          run `\list`. The comend-postgres database should be listed.
    4. Double-check your .env file in your comendcare repo contains the following environment
       variable `DATABASE_URL="postgresql://postgres:comend@localhost:5432/comend-psql"`.

5. Prisma Migration - run `npx prisma migrate deploy` in the root directory to apply all migrations to the database.
   - Optionally you can seed the empty database with `prisma db seed` (if you want to reset, which will also trigger the seed script, run `prisma migrate reset`).
6. Install dependances - run `npm install` in the comendcare root directory
7. Run the app! - run `npm run dev` in the comendcare root directory

## Styling and Best Practices
> We don't have these yet but will soon!

We use ESLint and Prettier to maintain consistent code quality and styling across our project.

ESLint enforces best practices like using camelCase, preferring const, and avoiding var.
It also integrates with TypeScript, Next, and React for type safety and linting specific to those frameworks.

Prettier automatically formats code for consistency, such as enforcing double quotes and standardizing indentation.

The commands:

- Linting: Run `npm run lint` to check your code.
- Formatting: Run `npm run format` to apply Prettier.

For additional details around best practices, styles, and guides, check out
the [Comend Engineering guide](https://www.notion.so/comend/Engineering-c224073186cd42b69485dd5499f862d2?pvs=4)

## Git strategy

Our production branch is `main`.
`preview` is for testing with non-engineering team members.
`development` is the default development branch; all branches should be made off of `development`.

## Deployment

### Frontend and Backend

This project has been deployed on Vercel (Next.js frontend and tRPC backend) with the database deployed on Google
CloudSQL.
The Vercel deployment assumes you provide the correct environment variables as defined in the `.env`.
Be sure to include all the API keys, Authentication tokens, and database URLs.

### Subdomains
Special care and configuration is needed when setting up subdomains in production.
The `middleware.ts` file in the root directory contains a script that rewrites routes which can cause issues with auth.
The `.env` contains a variable `NEXT_PUBLIC_ROOT_DOMAIN` that must be configured in each environment (both locally, and in each deployment environment like development, preview, and production).
Specifically, each branch's deployment on Vercel will need to define its own `NEXT_PUBLIC_ROOT_DOMAIN` (because each branch deployment has a unique domain name).
If you don't specify a `NEXT_PUBLIC_ROOT_DOMAIN`, the branch deployment might still succeed, but attempting to open the branch deployment will lead to a 404 (due to middleware.ts relying on `NEXT_PUBLIC_ROOT_DOMAIN` to work).

If the main domain ever changes (for marketing or SEO reasons for example) and we end up switching to a different domain, you MUST update the `NEXT_PUBLIC_ROOT_DOMAIN` or else the landing page will 404.
This is also sensitive to `www.` and root domains, so make sure the domains are configured correctly in production.
Additionally, internal APIs might require the root/primary domain to be noted in configuration.
For example, Librarey's API is called for the Librarey landing page section, and so the domain must be allowed by CORS.

### Database
There is a specific setup required because our backend and database are hosted on two different platforms.
It's easy to access CloudSQL when deploying a backend on Cloud Run, but due to security concerns, accessing the deployed
database via a backend hosted off-platform requires additional configuration.
We use SSL certificates to securely access the database in deployment.
The detailed process of implementing SSL certificates in deployment is
defined [here](https://github.com/prisma/prisma/issues/1673).
You may need to refer to additional support [here](https://github.com/prisma/prisma/issues/4324)
and [here](https://stackoverflow.com/questions/77083613/how-to-use-ssl-with-prisma-on-a-vercel-deployment)

To set up the connection:
1. Navigate to the "Connections" tab of your cloud SQL instance.
2. Navigate to the "Authorized networks" section of the "Networking" subtab.
3. Create a new authorized network set to `0.0.0.0/0`, which allows any network to access the db (we'll set up the SSL certificates necessary to keep this secure next)
    - The reason this is necessary is that Vercel is serverless, and so many different addresses will be used to access the hosted database.
4. Navigate to the "Security" subtab.
5. Scroll down to the "Manage client certificates" section and click "Create Client Certificate"
6. Copy or download the `.pem` files and its content
    - Be sure to copy everything (you will only see this once) and exactly as displayed (or your setup will fail)
7. Convert the `.pem` files to base64 (you can do this in command line or using an online converter)
8. Create new environment variables in your `.env` with the base64 SSL certificate content
9. Check that you have `write-certificates.js` and/or `db.ts` setup to write the certificates back to the correct file in production.

### Connecting to the database
To access the deployed database locally, we use cloud sql proxy.
First you'll need to authenticate yourself with: `gcloud auth application-default login`.
This is session based, so occasionally you'll have to log in again, otherwise you won't be able to use cloud-sql-proxy.
You can then connect to your database remotely by navigating to the dir that you downloaded cloud sql auth proxy
executable (for example, I downloaded it in my Trash directory for some reason).
Once there, run the command: `./cloud-sql-proxy projectId:serverLocation:instanceName`.
Check the `.env` file for the database address.
For more details on the above you can visit
this [link](https://cloud.google.com/sql/docs/postgres/connect-auth-proxy#start-proxy)

Once you've set up and connected to the database via cloud sql proxy, follow the
prisma [deployment guide](https://www.prisma.io/docs/concepts/components/prisma-migrate/migrate-development-production#production-and-testing-environments)
for more information.
You'll most likely have to run the `npx prisma migrate deploy` to apply migrations to the remote database otherwise
requests may fail due to database mismatches.
Worst case scenario you may have to reset the database to apply migrations that have conflicts using the
command `npx prisma migrate reset`.
Running `npx prisma migrate dev --name "your message here"` will create a new migration (which you will likely want to
do locally).
The `prisma migrate deploy` command will apply existing migrations without creating a new one (which you will likely
want to do remotely).

## Typesense search
We use Typesense as our search as a service platform.
It comes with a lot of features out of the box, but the only special things to note is the initial setup with our stack.
1. Typesense Cloud
   - You can choose between self-hosting or using their hosted solution.
   - They have a free tier suitable for development.
   - Their setup/onboarding will provide you with an API key.
2. Typesense Client
   - Typesense has packages for popular languages including [javascript](https://github.com/typesense/typesense-js).
3. Prisma Pulse 
   - Requires a publicly available hosted database 
   - Requires you to enable `cloudsql.enable_pglogical` and `cloudsql.logical_decoding` in the Google Cloud SQL instance. Guides [here](https://cloud.google.com/sql/docs/postgres/replication/configure-logical-replication) and [here](https://cloud.google.com/sql/docs/postgres/flags).
   - You will also need to run `ALTER USER postgres WITH REPLICATION` and `ALTER SYSTEM SET wal_level = logical` (details [here](https://www.prisma.io/docs/pulse/database-setup/general-database-instructions))
4. In a separate terminal/process, run `tsx lib/sync.ts`
   - You can test if the syncing is working by opening prisma studio and triggering a change (create, update, or delete)

> Just for emphasis; Prisma Pulse DOES NOT WORK WITH LOCALLY HOSTED DATABASES. This means you cannot connect to a database hosted locally, and you cannot stream events triggered to your local database.